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

  update(delta:number,world:EcologyWorld){
    this.elapsed+=delta;
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
    for(const creature of creatures){
      const role=this.roleFor(creature);
      creature.userData.ecologicalRole=role;
      creature.userData.ecologicalTarget=undefined;
      creature.userData.ecologicalInteraction='ROAM';
      let target:THREE.Object3D|undefined;
      if(role==='PREDATOR'){
        target=creatures.filter(candidate=>candidate!==creature && this.roleFor(candidate)==='HERBIVORE').sort((a,b)=>distance(creature,a)-distance(creature,b))[0];
        if(target && distance(creature,target)<14)creature.userData.ecologicalInteraction='HUNT';
      }else if(role==='HERBIVORE'){
        target=flora.filter(candidate=>candidate!==creature).sort((a,b)=>distance(creature,a)-distance(creature,b))[0];
        if(target && distance(creature,target)<10)creature.userData.ecologicalInteraction='FORAGE';
      }else if(role==='POLLINATOR'){
        target=flora.filter(candidate=>candidate.userData.floraFamily && !String(candidate.userData.floraFamily).includes('fung')).sort((a,b)=>distance(creature,a)-distance(creature,b))[0];
        if(target && distance(creature,target)<13)creature.userData.ecologicalInteraction='POLLINATE';
      }
      if(target){
        creature.userData.ecologicalTarget=new THREE.Vector3(target.position.x,target.position.y,target.position.z);
        creature.userData.ecologicalTargetId=target.uuid;
        this.interactions++;
      }
    }
    this.root.userData={world,interactions:this.interactions,creatures:creatures.length,flora:flora.length};
  }

  getSnapshot(){return {...this.root.userData};}
}
