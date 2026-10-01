import * as THREE from 'three';
export interface GridArena{id:string;worldId:string;name:string;type:'ARENA'|'COLISEUM';capacity:number;rewardPoolGrid:number;protected:boolean;}
export class GridArenaSystem{
 readonly root=new THREE.Group(); private arenas=new Map<string,GridArena>();
 constructor(){this.root.name='grid-arenas-coliseums';}
 create(worldId:string,id:string,name:string,type:'ARENA'|'COLISEUM',capacity=10000,rewardPoolGrid=0){const a:GridArena={id,worldId,name,type,capacity,rewardPoolGrid,protected:true};this.arenas.set(id,a);return a;}
 defaults(worldId:string){return[this.create(worldId,worldId+'-arena','Grand Grid Arena','ARENA',5000,0),this.create(worldId,worldId+'-coliseum','World Coliseum','COLISEUM',50000,0)];}
 snapshot(){return [...this.arenas.values()];}
}