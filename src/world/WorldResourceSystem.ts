import * as THREE from 'three';
import type { EcologyWorld } from './CreatureEcologySystem';
import type { WorldConsequenceSnapshot } from './WorldConsequenceSystem';
import { getWorlds } from './GridWorldRegistry';
import { createStarterPBRMaterial } from '../engine/GridPBRLibrary';

export type WorldResourceKind = string;

export interface WorldResourceNode {
  id:string; world:EcologyWorld; kind:WorldResourceKind; amount:number; maxAmount:number; position:THREE.Vector3;
}

export interface WorldResourceInventory { [kind:string]: number; }

const DEFINITIONS: Record<string,{kind:WorldResourceKind;label:string;color:number;points:[number,number][]}> = {
  HARBOR:{kind:'TIDE_SALT',label:'Tide Salt',color:0x54d9ff,points:[[18,-24],[24,-27],[29,-20],[21,-17]]},
  GARDENS:{kind:'BLOOM_RESIN',label:'Bloom Resin',color:0x8fe388,points:[[17,18],[24,23],[29,14],[20,27]]},
  CITADEL:{kind:'CROWN_RELIC',label:'Crown Relic',color:0xd7b46a,points:[[-19,-23],[-26,-19],[-14,-27],[-22,-15]]},
  ARTS:{kind:'MUSE_INK',label:'Muse Ink',color:0xd28cff,points:[[14,-17],[20,-21],[26,-15],[18,-11]]},
  WILDS:{kind:'FRONTIER_ORE',label:'Frontier Ore',color:0xc9a36a,points:[[-25,20],[-18,25],[-29,27],[-21,15]]},
};

function resourceDefinition(world:{id:string;label:string;color:number;center:THREE.Vector3;resourceKind?:string;tags?:readonly string[]}) {
  const existing=DEFINITIONS[world.id];
  if(existing) return existing;
  const kind=(world.resourceKind?.trim().toUpperCase() || world.id+'_RESOURCE').replace(/[^A-Z0-9_]/g,'_');
  const tag=world.tags?.[0] ?? 'resource';
  const label=(world.label || world.id).replace(/_/g,' ')+' '+tag.replace(/_/g,' ');
  const points:[number,number][]=[];
  for(let i=0;i<4;i++){const a=i*2.399963;points.push([world.center.x+Math.cos(a)*5,world.center.z+Math.sin(a)*5]);}
  return {kind,label,color:world.color,points};
}

export class WorldResourceSystem {
  readonly root = new THREE.Group();
  private readonly nodes = new Map<string,WorldResourceNode>();
  private readonly inventory:WorldResourceInventory = {};

  constructor() {
    this.root.name='grid-world-resources';
    for(const world of getWorlds()) this.registerWorld(world);
  }

  registerWorld(world:{id:string;label:string;color:number;center:THREE.Vector3;resourceKind?:string;tags?:readonly string[]}) {
    const definition=resourceDefinition(world);
    const existing=[...this.nodes.values()].some(node=>node.world===world.id);
    if(existing) return;
    definition.points.forEach(([x,z],index)=>{
      const id=world.id.toLowerCase()+':resource:'+index;
      const material=createStarterPBRMaterial('technical',{color:definition.color,emissive:definition.color,emissiveIntensity:.7,roughness:.2});
      const mesh=new THREE.Mesh(new THREE.OctahedronGeometry(.22,0),material);
      mesh.position.set(x,0.35+(index%2)*.12,z);
      mesh.userData.gridObjectKind='resource';
      mesh.userData.resourceId=id;
      mesh.userData.interactable=true;
      mesh.userData.interactionName=definition.label;
      this.root.add(mesh);
      this.nodes.set(id,{id,world:world.id,kind:definition.kind,amount:40,maxAmount:40,position:mesh.position});
    });
  }

  getSnapshot() { return [...this.nodes.values()].map(node=>({...node,position:node.position.clone()})); }
  getInventory() { return {...this.inventory}; }

  collect(id:string, amount=8) {
    const node=this.nodes.get(id);
    if(!node || node.amount<=0) return {ok:false,amount:0,kind:node?.kind};
    const gathered=Math.min(node.amount,Math.max(0,amount));
    node.amount-=gathered;
    this.inventory[node.kind]=(this.inventory[node.kind]??0)+gathered;
    return {ok:true,amount:gathered,kind:node.kind};
  }

  update(delta:number, world:EcologyWorld, event:string, consequences?:WorldConsequenceSnapshot) {
    const recovery=delta*(event==='STORM'?.5:event==='BLOOM'?1.4:.8)*(consequences?.stability??1);
    for(const node of this.nodes.values()) {
      if(node.world!==world) continue;
      node.amount=Math.min(node.maxAmount,node.amount+recovery);
    }
  }
}
