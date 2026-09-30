import * as THREE from 'three';
import type { EcologyWorld } from './CreatureEcologySystem';
import type { SocietySnapshot } from './NPCSocietySystem';

export type QuestType='EXPLORE'|'MEET'|'CREATURE'|'WORLD_EVENT'|'DELIVER'|'BUILD'|'DISCOVER';
export interface Quest {
  id:string; title:string; description:string; type:QuestType; world:EcologyWorld|'ANY';
  target:number; progress:number; reward:number; giver:string; complete:boolean; active:boolean;
}
const QUESTS: Quest[] = [
  {id:'first-steps',title:'Walk the Living World',description:'Visit two different worlds and learn how their environments change.',type:'EXPLORE',world:'ANY',target:2,progress:0,reward:100,giver:'Lyra',complete:false,active:true},
  {id:'harbor-tide',title:'Follow the Tide',description:'Travel through Tideline while its tide event is active.',type:'WORLD_EVENT',world:'HARBOR',target:1,progress:0,reward:120,giver:'Mara',complete:false,active:false},
  {id:'garden-friends',title:'Garden Companions',description:'Meet living creatures in Verdant.',type:'CREATURE',world:'GARDENS',target:3,progress:0,reward:140,giver:'Sela',complete:false,active:false},
  {id:'artist-route',title:'The Artist Route',description:'Visit Muse and discover its active market signal.',type:'WORLD_EVENT',world:'ARTS',target:1,progress:0,reward:160,giver:'Caro',complete:false,active:false},
  {id:'wild-migration',title:'Migration Watch',description:'Observe the Frontier migration and follow the movement of the wilds.',type:'WORLD_EVENT',world:'WILDS',target:1,progress:0,reward:180,giver:'Rook',complete:false,active:false},
  {id:'crown-signal',title:'Signal at the Crown',description:'Reach Crown during its aurora event.',type:'WORLD_EVENT',world:'CITADEL',target:1,progress:0,reward:180,giver:'Orin',complete:false,active:false},
  {id:'world-builder',title:'Leave a Mark',description:'Interact with a world object, creator station, or living-world feature.',type:'DISCOVER',world:'ANY',target:3,progress:0,reward:150,giver:'Aurora',complete:false,active:false},
];

export class QuestSystem {
  readonly root=new THREE.Group();
  private quests=QUESTS.map(q=>({...q}));
  private visited=new Set<EcologyWorld>();
  private lastWorld='HARBOR';
  private lastEvent='QUIET';
  private snapshot={active:1,completed:0,total:this.quests.length,reward:0};
  constructor(){this.root.name='grid-user-quests';}
  update(_delta:number,world:EcologyWorld,event:string,society:SocietySnapshot,playerX:number,playerZ:number) {
    if(world!==this.lastWorld) {
      this.visited.add(world);
      this.lastWorld=world;
    }
    const ev=event.toUpperCase();
    if(ev!==this.lastEvent) {
      this.lastEvent=ev;
      if(ev!=='QUIET') for(const q of this.quests) if(q.type==='WORLD_EVENT'&&q.world===world&&!q.complete){q.active=true;q.progress=Math.min(q.target,q.progress+1);}
    }
    const nearby=Math.hypot(playerX,playerZ);
    const objectsNearby=nearby>0?1:0;
    const garden=this.quests.find(q=>q.id==='garden-friends');
    if(garden&&world==='GARDENS') garden.progress=Math.min(garden.target,Math.max(garden.progress,society.talking+society.gathering));
    const explore=this.quests.find(q=>q.id==='first-steps');
    if(explore) explore.progress=Math.min(explore.target,this.visited.size);
    const mark=this.quests.find(q=>q.id==='world-builder');
    if(mark) mark.progress=Math.min(mark.target,Math.max(mark.progress,objectsNearby));
    for(const q of this.quests) if(q.progress>=q.target&&!q.complete) {q.complete=true;q.active=false;}
    const completed=this.quests.filter(q=>q.complete);
    this.snapshot={active:this.quests.filter(q=>q.active&&!q.complete).length,completed:completed.length,total:this.quests.length,reward:completed.reduce((n,q)=>n+q.reward,0)};
    this.root.userData.quests=this.getSnapshot();
  }
  getSnapshot(){return this.snapshot;}
  getQuests(){return this.quests.map(q=>({...q}));}
}
