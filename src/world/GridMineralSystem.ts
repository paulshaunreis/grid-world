import * as THREE from 'three';
import { getWorlds } from './GridWorldRegistry';
import type { EcologyWorld } from './CreatureEcologySystem';
import { createStarterPBRMaterial } from '../engine/GridPBRLibrary';

export type GridMineralKind =
  | 'GRID_AUREL'      // gold
  | 'GRID_CUPRIX'     // copper
  | 'GRID_ARGENT'     // silver
  | 'GRID_QUARTZ'     // quartz
  | 'GRID_AMETHYST'   // amethyst
  | 'GRID_FLUORITE'   // fluorite
  | 'GRID_GARNET'     // garnet
  | 'GRID_OPAL'       // opal
  | 'GRID_TOURMALINE' // tourmaline
  | 'GRID_CITRINE'    // citrine
  | 'GRID_TOPAZ'      // topaz
  | 'GRID_OBSIDIAN'   // obsidian
  | 'GRID_DIAMOND';   // diamond

export interface GridMineralDefinition {
  kind: GridMineralKind;
  name: string;
  naturalName: string;
  color: number;
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'VERY_RARE' | 'LEGENDARY';
  baseYield: number;
}

export interface GridMineralDeposit {
  id: string;
  world: string;
  kind: GridMineralKind;
  remaining: number;
  capacity: number;
  position: THREE.Vector3;
}

export const GRID_MINERALS: Readonly<Record<GridMineralKind, GridMineralDefinition>> = {
  GRID_AUREL:{kind:'GRID_AUREL',name:'Aurel',naturalName:'Gold',color:0xd7ad45,rarity:'RARE',baseYield:8},
  GRID_CUPRIX:{kind:'GRID_CUPRIX',name:'Cuprix',naturalName:'Copper',color:0xb87333,rarity:'COMMON',baseYield:12},
  GRID_ARGENT:{kind:'GRID_ARGENT',name:'Argent',naturalName:'Silver',color:0xc7ccd3,rarity:'UNCOMMON',baseYield:10},
  GRID_QUARTZ:{kind:'GRID_QUARTZ',name:'Quarix',naturalName:'Quartz',color:0xdce7ff,rarity:'COMMON',baseYield:14},
  GRID_AMETHYST:{kind:'GRID_AMETHYST',name:'Amethyne',naturalName:'Amethyst',color:0x9966cc,rarity:'UNCOMMON',baseYield:10},
  GRID_FLUORITE:{kind:'GRID_FLUORITE',name:'Fluorix',naturalName:'Fluorite',color:0x78d9c0,rarity:'UNCOMMON',baseYield:10},
  GRID_GARNET:{kind:'GRID_GARNET',name:'Garnyx',naturalName:'Garnet',color:0x8f2942,rarity:'UNCOMMON',baseYield:9},
  GRID_OPAL:{kind:'GRID_OPAL',name:'Opaline',naturalName:'Opal',color:0xb8e6e2,rarity:'RARE',baseYield:7},
  GRID_TOURMALINE:{kind:'GRID_TOURMALINE',name:'Tourmara',naturalName:'Tourmaline',color:0x4abf8a,rarity:'RARE',baseYield:7},
  GRID_CITRINE:{kind:'GRID_CITRINE',name:'Citrine-X',naturalName:'Citrine',color:0xe8b84a,rarity:'UNCOMMON',baseYield:9},
  GRID_TOPAZ:{kind:'GRID_TOPAZ',name:'Topaz',naturalName:'Topaz',color:0x6fc7e8,rarity:'RARE',baseYield:7},
  GRID_OBSIDIAN:{kind:'GRID_OBSIDIAN',name:'Obsidrax',naturalName:'Obsidian',color:0x302c48,rarity:'RARE',baseYield:6},
  GRID_DIAMOND:{kind:'GRID_DIAMOND',name:'Diamara',naturalName:'Diamond',color:0xaeeeff,rarity:'LEGENDARY',baseYield:3},
};

const worldMinerals: GridMineralKind[] = [
  'GRID_CUPRIX','GRID_QUARTZ','GRID_ARGENT','GRID_AUREL','GRID_AMETHYST','GRID_FLUORITE',
  'GRID_GARNET','GRID_OPAL','GRID_TOURMALINE','GRID_CITRINE','GRID_TOPAZ','GRID_OBSIDIAN','GRID_DIAMOND'
];

export class GridMineralSystem {
  readonly root = new THREE.Group();
  private readonly deposits = new Map<string, GridMineralDeposit>();
  private readonly inventory: Partial<Record<GridMineralKind, number>> = {};

  constructor() {
    this.root.name = 'grid-mineral-system';
    for (const world of getWorlds()) this.registerWorld(world);
  }

  registerWorld(world: {id:string; center:THREE.Vector3; tags?:readonly string[]}) {
    if ([...this.deposits.values()].some(d => d.world === world.id)) return;
    const seed = this.hash(world.id);
    for (let i = 0; i < 13; i++) {
      const kind = worldMinerals[(seed + i * 7) % worldMinerals.length];
      const definition = GRID_MINERALS[kind];
      const angle = i * 2.399963 + (seed % 17) * .07;
      const radius = 9 + ((seed + i * 11) % 12);
      const capacity = Math.max(8, definition.baseYield * (2 + ((seed + i) % 5)));
      const id = world.id.toLowerCase() + ':mineral:' + i;
      const position = new THREE.Vector3(
        world.center.x + Math.cos(angle) * radius,
        .35 + ((i + seed) % 3) * .35,
        world.center.z + Math.sin(angle) * radius
      );
      const material = createStarterPBRMaterial('technical',{
        color:definition.color, emissive:definition.color, emissiveIntensity:.9, roughness:.24, metalness:.62
      });
      const mesh = new THREE.Mesh(new THREE.OctahedronGeometry(.24 + Math.min(.2, capacity/120), 0), material);
      mesh.position.copy(position);
      mesh.userData.gridObjectKind='grid-mineral';
      mesh.userData.mineralId=id;
      mesh.userData.mineralKind=kind;
      mesh.userData.interactable=true;
      mesh.userData.interactionName=definition.name + ' deposit';
      this.root.add(mesh);
      this.deposits.set(id,{id,world:world.id,kind,remaining:capacity,capacity,position:mesh.position});
    }
  }

  getSnapshot() { return [...this.deposits.values()].map(d => ({...d,position:d.position.clone()})); }
  getInventory() { return {...this.inventory}; }

  /** Client-side presentation fallback only. Authoritative servers must call the protected RPC. */
  collectLocal(id:string, requested=1) {
    const deposit=this.deposits.get(id);
    if(!deposit || deposit.remaining<=0) return {ok:false,amount:0,kind:deposit?.kind};
    const definition=GRID_MINERALS[deposit.kind];
    const amount=Math.min(deposit.remaining, Math.max(1, Math.min(requested, definition.baseYield)));
    deposit.remaining-=amount;
    this.inventory[deposit.kind]=(this.inventory[deposit.kind]??0)+amount;
    return {ok:true,amount,kind:deposit.kind,authoritative:false};
  }

  applyAuthoritativeResult(id:string, amount:number, remaining:number) {
    const deposit=this.deposits.get(id);
    if(!deposit) return;
    deposit.remaining=Math.max(0,Math.min(deposit.capacity,remaining));
    this.inventory[deposit.kind]=(this.inventory[deposit.kind]??0)+Math.max(0,amount);
  }

  update(delta:number, world:EcologyWorld) {
    for (const deposit of this.deposits.values()) {
      if (deposit.world !== world) continue;
      deposit.remaining=Math.min(deposit.capacity,deposit.remaining + delta*.01);
    }
  }

  private hash(value:string) {
    let h=2166136261;
    for(const char of value) h=Math.imul(h ^ char.charCodeAt(0),16777619);
    return Math.abs(h);
  }
}
