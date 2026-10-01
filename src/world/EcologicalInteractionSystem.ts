import * as THREE from 'three';
import type { EcologyWorld } from './CreatureEcologySystem';

export type LiveEcologicalRole='PLANT'|'HERBIVORE'|'PREDATOR'|'POLLINATOR'|'DECOMPOSER';

const ROLE_BY_SPECIES:Record<string,LiveEcologicalRole>={
  'canopy-moth':'POLLINATOR','gallery-swallow':'POLLINATOR',
  'frontier-wolf':'PREDATOR','moss-fox':'PREDATOR','muse-cat':'PREDATOR','crown-kite':'PREDATOR',
  'stone-hare':'HERBIVORE','ember-boar':'HERBIVORE','lumen-stag':'HERBIVORE','reef-runner':'HERBIVORE','tideline-skimmer':'HERBIVORE',
};

const distance=(a:THREE.Object3D,b:THREE.Object3D)=>a.position.distanceTo(b.position);

export class EcologicalInteractionSystem{
  readonly root=new THREE.Group();
  private elapsed=0;
  private readonly interval=.55;
  private interactions=0;
  private eventCounts={hunts:0,forages:0,pollinations:0,decompositions:0,migrations:0};
  private eventClock=0;
  private propagationClock=0;

  constructor(){this.root.name='grid-ecological-interactions';}

  private roleFor(object:THREE.Object3D):LiveEcologicalRole{
    const explicit=object.userData.ecologicalRole as LiveEcologicalRole|undefined;
    if(explicit)return explicit;
    const species=String(object.userData.species??'').toLowerCase();
    if(ROLE_BY_SPECIES[species])return ROLE_BY_SPECIES[species];
    if(species.includes('moth')||species.includes('swallow'))return 'POLLINATOR';
    if(species.includes('wolf')||species.includes('fox')||species.includes('cat')||species.includes('kite'))return 'PREDATOR';
    if(species.includes('hare')||species.includes('boar')||species.includes('stag')||species.includes('runner'))return 'HERBIVORE';
    return 'HERBIVORE';
  }

  update(delta:number,world:EcologyWorld,..._context:unknown[]){
    this.elapsed+=delta;
    this.eventClock+=delta;
    this.propagationClock+=delta;
    if(this.elapsed<this.interval)return;
    this.elapsed=0;
    const scene=this.root.parent;
    if(!scene)return;
    const creatures:THREE.Object3D[]=[];
    const flora:THREE.Object3D[]=[];
    scene.traverse(object=>{
      if(object.userData.gridObjectKind==='creature' && String(object.userData.worldId??world)===world)creatures.push(object);
      if(object.userData.gridObjectKind==='world-flora' && String(object.userData.worldId??world)===world)flora.push(object);
    });
    this.interactions=0;
    const events={hunts:0,forages:0,pollinations:0,decompositions:0,migrations:0};
    // Flora recovers between grazing events, while pollinated plants accumulate
    // enough seed potential to spread locally. This keeps generated worlds alive
    // without requiring a fixed authored ecosystem.
    for(const plant of flora){
      const health=Number(plant.userData.floraHealth??1);
      const pressure=Number(plant.userData.ecologicalPressure??0);
      plant.userData.floraHealth=THREE.MathUtils.clamp(health + delta*.012 - pressure*delta*.004,0,1);
      plant.userData.ecologicalPressure=THREE.MathUtils.clamp(pressure-delta*.018,0,1);
      plant.userData.pollination=THREE.MathUtils.clamp(Number(plant.userData.pollination??0)-delta*.004,0,1);
      plant.userData.seedPotential=THREE.MathUtils.clamp(Number(plant.userData.seedPotential??0)-delta*.0015,0,1);
    }
    for(const creature of creatures){
      const role=this.roleFor(creature);
      creature.userData.ecologicalRole=role;
      creature.userData.ecologicalTarget=undefined;
      creature.userData.ecologicalInteraction='ROAM';
      let target:THREE.Object3D|undefined;
      if(role==='PREDATOR'){
        target=creatures.filter(candidate=>candidate!==creature && this.roleFor(candidate)==='HERBIVORE').sort((a,b)=>distance(creature,a)-distance(creature,b))[0];
        if(target && distance(creature,target)<14){
          creature.userData.ecologicalInteraction='HUNT';
          if(distance(creature,target)<2.4){
            events.hunts++;
            target.userData.ecologicalPressure=THREE.MathUtils.clamp(Number(target.userData.ecologicalPressure??0)+.035,0,1);
            creature.userData.lastEcologicalEvent='predator-encounter';
          }
        }
      }else if(role==='HERBIVORE'){
        target=flora.filter(candidate=>candidate!==creature).sort((a,b)=>distance(creature,a)-distance(creature,b))[0];
        if(target && distance(creature,target)<10){
          creature.userData.ecologicalInteraction='FORAGE';
          if(distance(creature,target)<2.1){
            events.forages++;
            target.userData.floraHealth=THREE.MathUtils.clamp(Number(target.userData.floraHealth??1)-.018,0,1);
            target.userData.foragedCount=Number(target.userData.foragedCount??0)+1;
            creature.userData.lastEcologicalEvent='foraged';
          }
        }
      }else if(role==='POLLINATOR'){
        target=flora.filter(candidate=>candidate.userData.floraFamily && !String(candidate.userData.floraFamily).includes('fung')).sort((a,b)=>distance(creature,a)-distance(creature,b))[0];
        if(target && distance(creature,target)<13){
          creature.userData.ecologicalInteraction='POLLINATE';
          if(distance(creature,target)<2.4){
            events.pollinations++;
            target.userData.pollination=THREE.MathUtils.clamp(Number(target.userData.pollination??0)+.04,0,1);
            target.userData.seedPotential=THREE.MathUtils.clamp(Number(target.userData.seedPotential??0)+.025,0,1);
            creature.userData.lastEcologicalEvent='pollinated';
          }
        }
      }
      if(target){
        creature.userData.ecologicalTarget=new THREE.Vector3(target.position.x,target.position.y,target.position.z);
        creature.userData.ecologicalTargetId=target.uuid;
        this.interactions++;
      }
    }
    // Persistent pressure creates migration behavior instead of trapping creatures
    // inside a fixed encounter loop. The movement system consumes ecologicalTarget.
    for(const creature of creatures){
      const role=this.roleFor(creature);
      if(role!=='HERBIVORE') continue;
      const nearest=flora.slice().sort((a,b)=>distance(creature,a)-distance(creature,b))[0];
      const nearestHealth=nearest ? Number(nearest.userData.floraHealth??1) : 0;
      const foragePressure=Number(creature.userData.foragingPressure??0);
      const nextPressure=THREE.MathUtils.clamp(foragePressure + (nearestHealth<.25 ? delta*.06 : -delta*.025),0,1);
      creature.userData.foragingPressure=nextPressure;
      if(nextPressure>.72){
        creature.userData.ecologicalInteraction='MIGRATE';
        creature.userData.migrationPressure=nextPressure;
        const angle=(Number(creature.userData.migrationSeed??0)+this.eventClock*.07)%Math.PI*2;
        creature.userData.ecologicalTarget=new THREE.Vector3(
          creature.position.x+Math.cos(angle)*(8+nextPressure*10),
          creature.position.y,
          creature.position.z+Math.sin(angle)*(8+nextPressure*10)
        );
        creature.userData.ecologicalTargetId='migration:'+world;
        events.migrations++;
      }
    }

    if(this.propagationClock>8){
      this.propagationClock=0;
      const candidates=flora.filter(plant=>Number(plant.userData.seedPotential??0)>.55 && Number(plant.userData.floraHealth??1)>.45);
      if(candidates.length){
        const parent=candidates[Math.floor(Math.random()*candidates.length)];
        const clone=parent.clone(true);
        clone.position.copy(parent.position);
        clone.position.x+=(Math.random()-.5)*3.5;
        clone.position.z+=(Math.random()-.5)*3.5;
        clone.scale.multiplyScalar(.65+Math.random()*.2);
        clone.userData.worldId=world;
        clone.userData.gridObjectKind='world-flora';
        clone.userData.floraFamily=parent.userData.floraFamily;
        clone.userData.floraHealth=.65;
        clone.userData.pollination=0;
        clone.userData.seedPotential=0;
        clone.userData.generation=Number(parent.userData.generation??0)+1;
        parent.userData.seedPotential=Math.max(0,Number(parent.userData.seedPotential??0)-.35);
        scene.add(clone);
        flora.push(clone);
        events.pollinations++;
      }
    }

    this.eventCounts={...events};
    this.root.userData={
      world,
      interactions:this.interactions,
      creatures:creatures.length,
      flora:flora.length,
      events:this.eventCounts,
      lastEventAt:this.eventClock
    };
  }

  getSnapshot(){
    return {
      ...this.root.userData,
      events:{...this.eventCounts}
    };
  }
}
