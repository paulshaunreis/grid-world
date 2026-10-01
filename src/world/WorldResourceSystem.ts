import * as THREE from 'three';
import type { EcologyWorld } from './CreatureEcologySystem';
import type { WorldConsequenceSnapshot } from './WorldConsequenceSystem';
import { getWorlds } from './GridWorldRegistry';

export type WorldResourceKind = string;

export interface WorldResourceNode {
  id:string;
  world:EcologyWorld;
  kind:WorldResourceKind;
  amount:number;
  maxAmount:number;
  position:THREE.Vector3;
}

const DEFINITIONS: Record<string,{kind:WorldResourceKind;label:string;color:number;points:[number,number][]}> = {
  HARBOR:{kind:'TIDE_SALT',label:'Tide Salt',color:0x54d9ff,points:[[18,-24],[24,-27],[29,-20],[21,-17]]},
  GARDENS:{kind:'BLOOM_RESIN',label:'Bloom Resin',color:0x8fe388,points:[[17,18],[24,23],[29,14],[20,27]]},
  CITADEL:{kind:'CROWN_RELIC',label:'Crown Relic',color:0xd7b46a,points:[[-19,-23],[-26,-19],[-14,-27],[-22,-15]]},
  ARTS:{kind:'MUSE_INK',label:'Muse Ink',color:0xd28cff,points:[[14,-17],[20,-21],[26,-15],[18,-11]]},
  WILDS:{kind:'FRONTIER_ORE',label:'Frontier Ore',color:0xc9a36a,points:[[-25,20],[-18,25],[-29,27],[-21,15]]},
};

function colorForWorld(color:number) { return color; }
function resourceDefinition(world:{id:string;label:string;color:number;resourceKind?:string;tags?:readonly string[]}) {
  const existing=DEFINITIONS[world.id];
  if(existing) return existing;
  const kind=(world.resourceKind?.trim().toUpperCase() || world.id+'_RESOURCE').replace(/[^A-Z0-9_]/g,'_');
  const tag=world.tags?.[0] ?? 'resource';
  const label=(world.label || world.id).replace(/_/g,' ')+' '+tag.replace(/_/g,' ');
  const center=world.center;
  const radius=5;
  const points:[number,number][]=[];
  for(let i=0;i<4;i++){const a=i*2.399963;points.push([center.x+Math.cos(a)*radius,center.z+Math.sin(a)*radius]);}
  return {kind,label,color:colorForWorld(world.color),points};
}
