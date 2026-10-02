import * as THREE from 'three';
import type { NPCProfileRecord } from './NPCProfile';
import { NPCInventorySystem } from './NPCInventorySystem';
import { GridMaterialDropSystem } from './GridMaterialDropSystem';

export type NPCProductionKind = 'HARVEST'|'CRAFT'|'REPAIR'|'DISCOVER'|'GATHER';

export interface NPCProducedItem {
  id:string;
  npcId:string;
  worldId:string;
  kind:NPCProductionKind;
  name:string;
  category:'FOOD'|'MATERIAL'|'TOOL'|'QUEST'|'BLUEPRINT';
  quantity:number;
  quality:number;
  createdAt:number;
}

const RECIPES: Record<string,{name:string;category:NPCProducedItem['category'];material:string}> = {
  GARDENER:{name:'Fresh Harvest',category:'FOOD',material:'Fiber'},
  ARTISAN:{name:'Handcrafted Component',category:'MATERIAL',material:'Component'},
  KEEPER:{name:'Restored Fixture',category:'TOOL',material:'Metal Scrap'},
  NAVIGATOR:{name:'Discovered Route Chart',category:'QUEST',material:'Blueprint Scrap'},
  RANGER:{name:'Wild Fiber Bundle',category:'MATERIAL',material:'Fiber'},
};

export class NPCProductionSystem {
  readonly root = new THREE.Group();
  private timers = new Map<string,number>();
  private produced:NPCProducedItem[] = [];
  private drops:GridMaterialDropSystem;
  private inventory:NPCInventorySystem;

  constructor(drops:GridMaterialDropSystem, inventory:NPCInventorySystem){
    this.root.name='grid-npc-production';
    this.drops=drops;
    this.inventory=inventory;
  }

  update(delta:number, workers:Array<{id:string;world:string;role:string;position:THREE.Vector3}>, profiles:Map<string,NPCProfileRecord>){
    for(const worker of workers){
      const profile=profiles.get(worker.id);
      if(!profile) continue;
      const timer=(this.timers.get(worker.id) ?? (4 + worker.id.length % 5)) - delta;
      if(timer>0){ this.timers.set(worker.id,timer); continue; }
      this.timers.set(worker.id, 7 + (worker.id.length % 6));
      const role=worker.role.toUpperCase();
      const recipe=RECIPES[role];
      if(!recipe) continue;
      const kind:NPCProductionKind =
        role==='GARDENER' ? 'HARVEST' :
        role==='ARTISAN' ? 'CRAFT' :
        role==='KEEPER' ? 'REPAIR' :
        role==='NAVIGATOR' ? 'DISCOVER' : 'GATHER';
      const quality=Math.max(25,Math.min(100,Math.round(55 + profile.level*4 + (profile.skills[role.toLowerCase()] ?? 1)*.35)));
      const quantity=role==='GARDENER'||role==='RANGER' ? 2 : 1;
      const item:NPCProducedItem={
        id:worker.id.toLowerCase()+':production:'+Date.now()+':'+this.produced.length,
        npcId:worker.id,worldId:worker.world,kind,name:recipe.name,category:recipe.category,
        quantity,quality,createdAt:Date.now()
      };
      this.produced.push(item);
      this.inventory.add(profile,{
        id:item.id,name:item.name,category:item.category,quality:item.quality,
        equipped:false
      },quantity);
      const drop=this.drops.createDrop(worker.id,'NPC',worker.world,worker.position, this.drops.seedFor(item.id));
      this.root.userData.lastProduction={
        ...item, materialDropId:drop.id, material:drop.material, materialAmount:drop.amount
      };
      profile.memories.push(item.name+' produced at '+item.createdAt);
      if(profile.memories.length>32) profile.memories.splice(0,profile.memories.length-32);
    }
    this.produced=this.produced.slice(-256);
  }

  getRecent(limit=25){ return this.produced.slice(-limit).map(item=>({...item})); }
  getSnapshot(){ return this.getRecent(256); }
}