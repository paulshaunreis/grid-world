import * as THREE from 'three';
export type GridCardType='MONSTER'|'TECHNIQUE'|'RELIC'|'FIELD'|'TRAP';
export interface GridCard{id:string;name:string;type:GridCardType;cost:number;attack:number;defense:number;element:string;meshKey?:string;text:string;}
export interface GridDuelState{id:string;players:string[];turn:number;board:{playerId:string;cardId:string;zone:number;mesh?:THREE.Object3D}[];status:'WAITING'|'ACTIVE'|'FINISHED';winnerId?:string;}
export class GridDuelSystem{
 readonly root=new THREE.Group(); private duels=new Map<string,GridDuelState>(); private cards=new Map<string,GridCard>();
 constructor(){this.root.name='grid-duel-arena';}
 registerCard(c:GridCard){this.cards.set(c.id,c);}
 createDuel(id:string,a:string,b:string){const d:GridDuelState={id,players:[a,b],turn:0,board:[],status:'ACTIVE'};this.duels.set(id,d);return d;}
 summon(duelId:string,playerId:string,cardId:string,zone:number,mesh?:THREE.Object3D){const d=this.duels.get(duelId),c=this.cards.get(cardId);if(!d||!c||d.status!=='ACTIVE'||d.players[d.turn%2]!==playerId)throw new Error('invalid summon');const entry={playerId,cardId,zone,mesh};d.board.push(entry);d.turn++;if(mesh){mesh.userData.gridCardId=cardId;mesh.userData.gridDuelId=duelId;this.root.add(mesh);}return entry;}
 snapshot(id:string){return this.duels.get(id);}
}