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

const BUILTIN_POINTS: Record<string,[number,number][]> = {
  HARBOR:[[18,-24],[24,-27],[29,-20],[21,-17]],
  GARDENS:[[17,18],[24,23],[29,14],[20,27]],
  CITADEL:[[-19,-23],[-26,-19],[-14,-27],[-22,-15]],
  ARTS:[[14,-17],[20,-21],[26,-15],[18,-11]],
  WILDS:[[-25,20],[-18,25],[-29,27],[-21,15]],
};
