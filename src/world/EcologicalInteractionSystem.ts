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
  private migrationMarkers=new Map<string,THREE.Mesh>();
  private visualClock=0;

  constructor(){this.root.name='grid-ecological-interactions';}

  private habitatScore(creature:THREE.Object3D, candidate:THREE.Object3D){
    const creatureTags=Array.isArray(creature.userData.habitatTags)?creature.userData.habitatTags.map(String):[];
    const candidateTags=Array.isArray(candidate.userData.habitatTags)?candidate.userData.habitatTags.map(String):[];
    if(!creatureTags.length||!candidateTags.length)return .5;
    const matches=creatureTags.reduce((n,tag)=>n+(candidateTags.some(candidateTag=>candidateTag.toLowerCase().includes(tag.toLowerCase())||tag.toLowerCase().includes(candidateTag.toLowerCase()))?1:0),0);
    return THREE.MathUtils.clamp(matches/Math.max(2,creatureTags.length),0,1);
  }

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
    this.visualClock+=delta;
    if(this.elapsed<this.interval)return;
    this.elapsed=0;
    const scene=this.root.parent;
    if(!scene)return;
    const creatures:THREE.Object3D[]=[];
    const flora:THREE.Object3D[]=[];
    const decomposerFlora:THREE.Object3D[]=[];
    scene.traverse(object=>{
      if(object.userData.gridObjectKind==='creature' && !object.userData.populationAmbient && String(object.userData.worldId??world)===world)creatures.push(object);
      if(object.userData.gridObjectKind==='world-flora' && String(object.userData.worldId??world)===world){flora.push(object); if(String(object.userData.floraFamily??'').toLowerCase().includes('fung'))decomposerFlora.push(object);}
    });
    this.interactions=0;
    const events={hunts:0,forages:0,pollinations:0,decompositions:0,migrations:0};
    const migrationIds=new Set<string>();
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
      const healthVisual=THREE.MathUtils.clamp(Number(plant.userData.floraHealth??1),.12,1);
      if(!plant.userData.ecologyBaseScale)plant.userData.ecologyBaseScale=plant.scale.clone();
      const base=plant.userData.ecologyBaseScale as THREE.Vector3;
      plant.scale.set(base.x*(.72+healthVisual*.28),base.y*(.72+healthVisual*.28),base.z*(.72+healthVisual*.28));
      plant.userData.ecologyVisualState=healthVisual<.3?'STRESSED':healthVisual>.8?'THRIVING':'RECOVERING';
    }
    // Decomposer patches recycle spent organic matter back into nearby flora.
    for(const decomposer of decomposerFlora){
      const nearby=flora.filter(plant=>plant!==decomposer).sort((a,b)=>distance(decomposer,a)-distance(decomposer,b))[0];
      if(nearby && distance(decomposer,nearby)<6){
        nearby.userData.nutrientReserve=THREE.MathUtils.clamp(Number(nearby.userData.nutrientReserve??.35)+delta*.006,0,1);
        events.decompositions++;
      }
    }
    const populationFor=(object:THREE.Object3D)=>Math.max(1,Number(object.userData.evolutionAbundance??1));
    const habitatTarget=(creature:THREE.Object3D, candidates:THREE.Object3D[])=>candidates
      .filter(candidate=>Number(candidate.userData.floraHealth??1)>.18)
      .map(candidate=>({candidate,score:Number(candidate.userData.floraHealth??1)*3+this.habitatScore(creature,candidate)*5-distance(creature,candidate)*.045}))
      .sort((a,b)=>b.score-a.score)[0]?.candidate;
    const territory=(creature:THREE.Object3D, candidates:THREE.Object3D[])=>{
      const target=habitatTarget(creature,candidates);
      if(!target)return;
      creature.userData.habitatTerritory=target.userData.floraFamily??'native';
      creature.userData.habitatQuality=THREE.MathUtils.clamp(Number(target.userData.floraHealth??.5)*.55+this.habitatScore(creature,target)*.45,0,1);
      creature.userData.habitatAnchor=new THREE.Vector3(target.position.x,target.position.y,target.position.z);
    };
    const weightedTarget=(origin:THREE.Object3D,candidates:THREE.Object3D[])=>candidates
      .map(candidate=>({candidate,distance:distance(origin,candidate),population:populationFor(candidate),habitat:this.habitatScore(origin,candidate)}))
      .sort((a,b)=>((a.distance/(1+Math.log2(a.population)))-(a.habitat*6))-((b.distance/(1+Math.log2(b.population)))-(b.habitat*6)))[0]?.candidate;
    for(const creature of creatures){
      const role=this.roleFor(creature);
      creature.userData.ecologicalRole=role;
      territory(creature,flora);
      creature.userData.ecologicalTarget=undefined;
      creature.userData.ecologicalInteraction='ROAM';
      let target:THREE.Object3D|undefined;
      if(role==='PREDATOR'){
        target=weightedTarget(creature,creatures.filter(candidate=>candidate!==creature && this.roleFor(candidate)==='HERBIVORE'));
        if(target && distance(creature,target)<14){
          creature.userData.ecologicalInteraction='HUNT';
          if(distance(creature,target)<2.4){
            events.hunts++;
            target.userData.ecologicalPressure=THREE.MathUtils.clamp(Number(target.userData.ecologicalPressure??0)+.035,0,1);
            creature.userData.lastEcologicalEvent='predator-encounter';
          }
        }
      }else if(role==='HERBIVORE'){
        target=flora.filter(candidate=>candidate!==creature).sort((a,b)=>{
          const score=(item:THREE.Object3D)=>distance(creature,item)+Number(item.userData.ecologicalPressure??0)*4-this.habitatScore(creature,item)*6;
          return score(a)-score(b);
        })[0];
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
        target=flora.filter(candidate=>candidate.userData.floraFamily && !String(candidate.userData.floraFamily).includes('fung')).sort((a,b)=>{
          const score=(item:THREE.Object3D)=>distance(creature,item)-Number(item.userData.pollination??0)*2-this.habitatScore(creature,item)*5;
          return score(a)-score(b);
        })[0];
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
      const nearest=habitatTarget(creature,flora);
      const nearestHealth=nearest ? Number(nearest.userData.floraHealth??1) : 0;
      const localForage=flora.filter(plant=>distance(creature,plant)<12).reduce((sum,plant)=>sum+Number(plant.userData.floraHealth??1),0);
      creature.userData.localForageAvailability=localForage;
      const foragePressure=Number(creature.userData.foragingPressure??0);
      const nextPressure=THREE.MathUtils.clamp(foragePressure + (nearestHealth<.25 ? delta*.06 : -delta*.025),0,1);
      creature.userData.foragingPressure=nextPressure;
      if(nextPressure>.72){
        creature.userData.ecologicalInteraction='MIGRATE';
        creature.userData.migrationPressure=nextPressure;
        const destination=habitatTarget(creature,flora);
        const angle=(Number(creature.userData.migrationSeed??0)+this.eventClock*.07)%Math.PI*2;
        creature.userData.ecologicalTarget=destination
          ? new THREE.Vector3(destination.position.x,destination.position.y,destination.position.z)
          : new THREE.Vector3(creature.position.x+Math.cos(angle)*(8+nextPressure*10),creature.position.y,creature.position.z+Math.sin(angle)*(8+nextPressure*10));
        creature.userData.ecologicalTargetId=destination?.uuid??('migration:'+world);
        creature.userData.migrationDestination=destination?.userData.floraFamily??'unknown-habitat';
        events.migrations++;
        migrationIds.add(creature.uuid);
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
        clone.userData.habitatTags=Array.isArray(parent.userData.habitatTags)?[...parent.userData.habitatTags]:[];
        clone.userData.habitatQuality=parent.userData.habitatQuality??.7;
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

    const markerParent=this.root;
    for(const [id,marker] of this.migrationMarkers){
      if(!migrationIds.has(id)){
        markerParent.remove(marker);
        marker.geometry.dispose();
        (marker.material as THREE.Material).dispose();
        this.migrationMarkers.delete(id);
      }
    }
    for(const creature of creatures){
      if(!migrationIds.has(creature.uuid))continue;
      let marker=this.migrationMarkers.get(creature.uuid);
      if(!marker){
        marker=new THREE.Mesh(new THREE.RingGeometry(.45,.7,24),new THREE.MeshBasicMaterial({transparent:true,opacity:.5,depthWrite:false,side:THREE.DoubleSide}));
        marker.rotation.x=-Math.PI/2;
        this.migrationMarkers.set(creature.uuid,marker);
        markerParent.add(marker);
      }
      marker.position.set(creature.position.x,creature.position.y+.08,creature.position.z);
      marker.scale.setScalar(1+Math.sin(this.visualClock*5+String(creature.id).length)*.18);
      (marker.material as THREE.MeshBasicMaterial).opacity=.3+.2*(.5+.5*Math.sin(this.visualClock*4));
    }

    this.eventCounts={...events};
    this.root.userData={
      world,
      interactions:this.interactions,
      creatures:creatures.length,
      flora:flora.length,
      decomposers:decomposerFlora.length,
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
