import * as THREE from 'three';
import type { EcologyWorld } from './CreatureEcologySystem';
import type { WorldConsequenceSnapshot } from './WorldConsequenceSystem';
import { createClient } from '@supabase/supabase-js';

export type WorldResourceKind = 'TIDE_SALT' | 'BLOOM_RESIN' | 'CROWN_RELIC' | 'MUSE_INK' | 'FRONTIER_ORE';

export interface WorldResourceNode {
  id:string;
  world:EcologyWorld;
  kind:WorldResourceKind;
  amount:number;
  maxAmount:number;
  position:THREE.Vector3;
}

const DEFINITIONS: Record<EcologyWorld,{kind:WorldResourceKind;label:string;color:number;points:[number,number][]}> = {
  HARBOR:{kind:'TIDE_SALT',label:'Tide Salt',color:0x54d9ff,points:[[18,-24],[24,-27],[29,-20],[21,-17]]},
  GARDENS:{kind:'BLOOM_RESIN',label:'Bloom Resin',color:0x8fe388,points:[[17,18],[24,23],[29,14],[20,27]]},
  CITADEL:{kind:'CROWN_RELIC',label:'Crown Relic',color:0xd7b46a,points:[[-19,-23],[-26,-19],[-14,-27],[-22,-15]]},
  ARTS:{kind:'MUSE_INK',label:'Muse Ink',color:0xd28cff,points:[[14,-17],[20,-21],[26,-15],[18,-11]]},
  WILDS:{kind:'FRONTIER_ORE',label:'Frontier Ore',color:0xc9a36a,points:[[-25,20],[-18,25],[-29,27],[-21,15]]},
};

const RESOURCE_STORAGE='grid-world:resource-inventory:v1';
export class WorldResourceSystem {
  readonly root=new THREE.Group();
  private nodes:WorldResourceNode[]=[];
  private pulse=0;
  private snapshot:WorldResourceNode[]=[];
  private inventory:Partial<Record<WorldResourceKind,number>>={};
  private lastSave=0;
  private readonly supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);
  constructor(){
    this.root.name='grid-world-resources';
    this.root.userData.system='world-specific-resource-layer';
    (Object.keys(DEFINITIONS) as EcologyWorld[]).forEach(world=>{
      const def=DEFINITIONS[world];
      def.points.forEach(([x,z],index)=>{
        const material=new THREE.MeshStandardMaterial({color:def.color,emissive:def.color,emissiveIntensity:.35,metalness:.45,roughness:.3});
        const mesh=new THREE.Mesh(new THREE.IcosahedronGeometry(.28,1),material);
        mesh.position.set(x,.55,z);
        mesh.userData.resourceWorld=world;
        mesh.userData.resourceKind=def.kind;
        mesh.userData.resourceLabel=def.label;
        this.root.add(mesh);
        const node={id:world.toLowerCase()+'-resource-'+index,world,kind:def.kind,amount:100,maxAmount:100,position:mesh.position.clone()};
        this.nodes.push(node);
        mesh.userData.resourceId=node.id;
      });
    });
    try { this.inventory=JSON.parse(localStorage.getItem(RESOURCE_STORAGE)??'{}'); } catch { this.inventory={}; }
    this.snapshot=this.nodes;
  }
  update(delta:number,world:EcologyWorld,event:string,consequences:WorldConsequenceSnapshot){
    this.pulse+=delta;
    const eventBoost = event.toUpperCase()==='QUIET' ? 0 : .22;
    for(const node of this.nodes){
      const pressure=consequences.world===node.world?consequences.pressure:0;
      node.amount=Math.min(node.maxAmount,node.amount+delta*(.018+eventBoost*.01)*(1-pressure*.5));
    }
    this.root.children.forEach((child,index)=>{
      const node=this.nodes[index];
      const active=node.world===world;
      child.visible=true;
      const scale=active ? 1+Math.sin(this.pulse*2.2+index)*.08 : .78;
      child.scale.setScalar(scale);
      const material=child instanceof THREE.Mesh ? child.material as THREE.MeshStandardMaterial : null;
      if(material) material.emissiveIntensity=active ? .5+Math.sin(this.pulse*2+index)*.18 : .18;
    });
    if(this.pulse-this.lastSave>2){ localStorage.setItem(RESOURCE_STORAGE,JSON.stringify(this.inventory)); this.lastSave=this.pulse; }
    this.snapshot=this.nodes.map(node=>({...node,position:node.position.clone()}));
    this.root.userData.activeWorld=world;
    this.root.userData.snapshot=this.snapshot;
  }
  getSnapshot(){ return this.snapshot.map(node=>({...node,position:node.position.clone()})); }
  getInventory(){ return {...this.inventory}; }
  collect(id:string,amount=10){
    const node=this.nodes.find(item=>item.id===id);
    if(!node)return null;
    const taken=Math.min(Math.max(1,amount),node.amount);
    node.amount-=taken;
    this.inventory[node.kind]=(this.inventory[node.kind]??0)+taken;
    localStorage.setItem(RESOURCE_STORAGE,JSON.stringify(this.inventory));
    return {id:node.id,world:node.world,kind:node.kind,amount:taken,remaining:node.amount};
  }
  spend(kind:WorldResourceKind,amount:number){
    const have=this.inventory[kind]??0;
    if(have<amount)return false;
    this.inventory[kind]=have-amount; return true;
  }
}
