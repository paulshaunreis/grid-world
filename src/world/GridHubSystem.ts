import * as THREE from 'three';
export type GridHubService='BANK'|'MARKET'|'CRAFTING'|'QUESTS'|'TRANSIT'|'HOUSING'|'ARENA'|'COLISEUM'|'MEDIA'|'FOOD'|'SOCIAL'|'TRAINING';
export interface GridHub{id:string;worldId:string;name:string;scale:'MEGA'|'COLOSSAL';services:GridHubService[];landmarkHeight:number;capacity:number;}
export class GridHubSystem{
 readonly root=new THREE.Group(); private hubs=new Map<string,GridHub>();
 constructor(){this.root.name='grid-mega-hubs';}
 create(worldId:string,id:string,name:string,services:GridHubService[]){const h:GridHub={id,worldId,name,scale:'COLOSSAL',services,landmarkHeight:420,capacity:50000};this.hubs.set(id,h);return h;}
 defaults(worldId:string){return[
 this.create(worldId,worldId+'-grand-exchange','Grand Exchange',['BANK','MARKET','CRAFTING','TRANSIT','FOOD','SOCIAL']),
 this.create(worldId,worldId+'-world-gate','World Gate Citadel',['TRANSIT','QUESTS','TRAINING','SOCIAL']),
 this.create(worldId,worldId+'-coliseum','Coliseum of the Grid',['ARENA','COLISEUM','FOOD','SOCIAL']),
 this.create(worldId,worldId+'-creator-arc','Creator Arcology',['CRAFTING','MEDIA','HOUSING','TRAINING','MARKET'])
 ];} snapshot(){return [...this.hubs.values()];}
}