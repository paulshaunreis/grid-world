import * as THREE from 'three';
import type { EcologyWorld, EcologySnapshot } from './CreatureEcologySystem';
import { traversalHit, steerAround } from './TraversalSystem';
import type { WorldConsequenceSnapshot } from './WorldConsequenceSystem';
import { getWorlds } from './GridWorldRegistry';

export type CitizenState = 'WORK'|'TRAVEL'|'GATHER'|'TALK'|'REST'|'CELEBRATE';
export type CitizenRole = 'NAVIGATOR'|'GARDENER'|'ARTISAN'|'KEEPER'|'RANGER';

type Citizen = {
  root: THREE.Group;
  name: string;
  world: EcologyWorld;
  role: CitizenRole;
  state: CitizenState;
  home: THREE.Vector3;
  workplace: THREE.Vector3;
  social: number;
  energy: number;
  stateTimer: number;
  phase: number;
  target: THREE.Vector3;
  jumpVelocity: number;
  jumpCooldown: number;
  jumpPhase: number;
  jumpStyle: number;
  jumpTargetY: number;
  jumpCount: number;
  merchant:boolean;
  merchantStock:number;
  merchantStress:number;
  merchantMood:string;
  merchantOpen:boolean;
  merchantSchedule:number;
  schedulePhase:number;
  travelTimer:number;
  travelTarget:THREE.Vector3;
  travelMode:'WALK'|'TELEPORT';
  travelPurpose:'WORK'|'TRADE'|'FESTIVAL'|'EMERGENCY'|'RELATIONSHIP';
  travelWorld:EcologyWorld;
  selectedDestination:EcologyWorld;
  gateCooldown:number;
  travelStage:'IDLE'|'APPROACH_GATE'|'TRANSIT';
  gatePosition:THREE.Vector3;
};

export interface SocietySnapshot {
  population:number;
  active:number;
  working:number;
  gathering:number;
  talking:number;
  world:EcologyWorld;
  signal:string;
}

const CITIZENS = [
  ['Mara','NAVIGATOR','HARBOR',22,-24,27,-20],
  ['Iven','NAVIGATOR','HARBOR',27,-25,22,-28],
  ['Sela','GARDENER','GARDENS',23,20,27,15],
  ['Tarin','GARDENER','GARDENS',27,16,20,25],
  ['Caro','ARTISAN','ARTS',17,-15,22,-21],
  ['Veya','ARTISAN','ARTS',22,-21,14,-12],
  ['Orin','KEEPER','CITADEL',-19,-18,-24,-25],
  ['Nara','KEEPER','CITADEL',-24,-25,-15,-17],
  ['Rook','RANGER','WILDS',-25,22,-18,28],
  ['Edda','RANGER','WILDS',-18,28,-27,19],
] as const;

function worldCenter(id: string) {
  return getWorlds().find(w => w.id === id)?.center ?? new THREE.Vector3();
}


