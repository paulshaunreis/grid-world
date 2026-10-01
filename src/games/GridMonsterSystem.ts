import * as THREE from 'three';
export type GridMonsterElement='FIRE'|'WATER'|'EARTH'|'AIR'|'AETHER'|'LIFE'|'SHADOW'|'CRYSTAL'|'TECH';
export interface GridMonster{id:string;name:string;element:GridMonsterElement;level:number;maxHp:number;hp:number;attack:number;defense:number;speed:number;traits:string[];meshKey:string;}
export class GridMonsterSystem{
 readonly root=new THREE.Group(); private monsters=new Map<string,GridMonster>();
 constructor(){this.root.name='grid-monster-arena';}
 spawn(m:GridMonster){this.monsters.set(m.id,m);return m;}
 battle(aId:string,bId:string){const a=this.monsters.get(aId),b=this.monsters.get(bId);if(!a||!b)throw new Error('monster missing');const aScore=a.attack+a.speed*.4+b.defense*-0.25;const bScore=b.attack+b.speed*.4+a.defense*-0.25;const winner=aScore>=bScore?a:b;return{winnerId:winner.id,rounds:Math.max(1,Math.ceil(100/Math.max(1,Math.abs(aScore-bScore)))),a,b};}
}