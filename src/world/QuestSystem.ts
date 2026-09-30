import * as THREE from 'three';
import type { EcologyWorld } from './CreatureEcologySystem';
import type { SocietySnapshot } from './NPCSocietySystem';

export type QuestType='EXPLORE'|'MEET'|'CREATURE'|'WORLD_EVENT'|'DELIVER'|'BUILD'|'DISCOVER';
export type QuestStatus='AVAILABLE'|'ACTIVE'|'TURN_IN'|'COMPLETE';
export interface Quest { id:string; title:string; description:string; type:QuestType; world:EcologyWorld|'ANY'; target:number; progress:number; reward:number; giver:string; status:QuestStatus; objective?:string; targetId?:string; objectivePosition?:[number,number]; }
type QuestState=Record<string,{progress:number;status:QuestStatus}>;
const SEEDS:Omit<Quest,'progress'|'status'>[]=[
{id:'first-steps',title:'Walk the Living World',description:'Visit two different worlds and learn how their environments change.',type:'EXPLORE',world:'ANY',target:2,reward:100,giver:'Lyra',objective:'Visit 2 different worlds.',objectivePosition:[0,-7]},
{id:'harbor-tide',title:'Follow the Tide',description:'Travel through Tideline while its tide event is active.',type:'WORLD_EVENT',world:'HARBOR',target:1,reward:120,giver:'Mara',objective:'Reach the tidal beacon during TIDE.',objectivePosition:[0,-7],targetId:'grid-signal-beacon'},
{id:'garden-friends',title:'Garden Companions',description:'Meet three living creatures in Verdant.',type:'CREATURE',world:'GARDENS',target:3,reward:140,giver:'Sela',objective:'Meet 3 different Verdant creatures.',objectivePosition:[23,20]},
{id:'artist-route',title:'The Artist Route',description:'Visit Muse and discover its active market signal.',type:'WORLD_EVENT',world:'ARTS',target:1,reward:160,giver:'Caro',objective:'Reach the gallery plinth during MARKET.',objectivePosition:[-20,-24],targetId:'grid-gallery-plinth'},
{id:'wild-migration',title:'Migration Watch',description:'Observe the Frontier migration and follow the movement of the wilds.',type:'WORLD_EVENT',world:'WILDS',target:1,reward:180,giver:'Rook',objective:'Reach the migration overlook during MIGRATION.',objectivePosition:[-25,22]},
{id:'crown-signal',title:'Signal at the Crown',description:'Reach Crown during its aurora event.',type:'WORLD_EVENT',world:'CITADEL',target:1,reward:180,giver:'Orin',objective:'Reach the Crown signal during AURORA.',objectivePosition:[-19,-18]},
{id:'world-builder',title:'Leave a Mark',description:'Interact with a world object, creator station, or living-world feature.',type:'DISCOVER',world:'ANY',target:3,reward:150,giver:'Aurora',objective:'Interact with 3 meaningful world objects.',objectivePosition:[18,-2]},
];
const GIVERS:Record<string,{world:EcologyWorld;position:[number,number]}>={
Lyra:{world:'HARBOR',position:[0,-7]},Mara:{world:'HARBOR',position:[22,-24]},Sela:{world:'GARDENS',position:[23,20]},Caro:{world:'ARTS',position:[17,-15]},Rook:{world:'WILDS',position:[-25,22]},Orin:{world:'CITADEL',position:[-19,-18]},Aurora:{world:'ARTS',position:[0,-12]}
};
const STORAGE='grid-world:quest-state:v2';
export class QuestSystem{
 readonly root=new THREE.Group(); private quests:Quest[]=[]; private visited=new Set<EcologyWorld>(); private interacted=new Set<string>(); private playerId='local'; private lastWorld:EcologyWorld='HARBOR'; private lastEvent='QUIET'; private rewardBank=0; private markers=new Map<string,THREE.Group>(); private saved:QuestState={};
 constructor(playerId='local'){this.playerId=playerId;this.root.name='grid-user-quests';this.load();for(const seed of SEEDS){const saved=this.saved[seed.id];this.quests.push({...seed,progress:saved?.progress??0,status:saved?.status??(seed.id==='first-steps'?'ACTIVE':'AVAILABLE')});}this.syncMarkers();}
 private load(){try{const raw=localStorage.getItem(STORAGE+'-'+this.playerId);if(!raw)return;const p=JSON.parse(raw);if(p?.quests)this.saved=p.quests;if(Array.isArray(p?.visited))this.visited=new Set(p.visited);if(Array.isArray(p?.interacted))this.interacted=new Set(p.interacted);if(typeof p?.rewardBank==='number')this.rewardBank=p.rewardBank;}catch{}}
 private save(){try{const quests:QuestState={};for(const q of this.quests)quests[q.id]={progress:q.progress,status:q.status};localStorage.setItem(STORAGE+'-'+this.playerId,JSON.stringify({quests,visited:[...this.visited],interacted:[...this.interacted],rewardBank:this.rewardBank}));}catch{}}
 private marker(id:string,pos:[number,number],label:string){const g=new THREE.Group();g.position.set(pos[0],.08,pos[1]);g.userData={gridObjectKind:'quest-marker',interactable:false,questId:id};const ring=new THREE.Mesh(new THREE.TorusGeometry(.48,.045,8,24),new THREE.MeshBasicMaterial({color:0xffd36a,transparent:true,opacity:.82}));ring.rotation.x=Math.PI/2;const beam=new THREE.Mesh(new THREE.CylinderGeometry(.025,.09,1.6,8),new THREE.MeshBasicMaterial({color:0xffd36a,transparent:true,opacity:.24}));beam.position.y=.8;g.add(ring,beam);this.root.add(g);this.markers.set(id,g);}
 private syncMarkers(){for(const [id,m] of this.markers){m.removeFromParent();this.markers.delete(id);}for(const q of this.quests.filter(q=>q.status==='ACTIVE'||q.status==='TURN_IN')){
      const position=q.status==='TURN_IN'?GIVERS[q.giver]?.position:q.objectivePosition;
      if(position)this.marker(q.id,position,q.status==='TURN_IN'?'RETURN · '+q.giver:'OBJECTIVE');
    }}
 update(_delta:number,world:EcologyWorld,event:string,_society:SocietySnapshot,_playerX:number,_playerZ:number){if(world!==this.lastWorld){this.visited.add(world);this.lastWorld=world;}const ev=event.toUpperCase();for(const q of this.quests){if(q.status!=='ACTIVE')continue;if(q.type==='EXPLORE')q.progress=Math.min(q.target,this.visited.size);if(q.type==='WORLD_EVENT'&&q.world===world&&ev!=='QUIET'&&ev!==this.lastEvent)q.progress=Math.min(q.target,q.progress+1);if(q.type==='CREATURE'&&q.world===world)q.progress=Math.min(q.target,this.interacted.size);if(q.type==='DISCOVER')q.progress=Math.min(q.target,this.interacted.size);if(q.progress>=q.target){q.status='TURN_IN';}}if(ev!==this.lastEvent)this.lastEvent=ev;this.syncMarkers();this.save();this.root.userData.quests=this.getSnapshot();}
 interact(target:THREE.Object3D,world:EcologyWorld,event:string){const kind=String(target.userData.gridObjectKind??'');const name=String(target.userData.interactionName??target.name??'');const isTeamAvatar=Boolean(target.userData.teamAvatarId);if(kind==='npc'||isTeamAvatar){
      const turnIn=this.quests.find(q=>q.giver===name&&q.status==='TURN_IN');
      if(turnIn){turnIn.status='COMPLETE';this.rewardBank+=turnIn.reward;this.syncMarkers();this.save();return {handled:true,message:name+': “'+turnIn.title+'” complete. +'+turnIn.reward+' GRID.' ,quest:turnIn};}const available=this.quests.find(q=>q.giver===name&&q.status==='AVAILABLE');if(available){available.status='ACTIVE';this.syncMarkers();this.save();return {handled:true,message:name+' offers “'+available.title+'”. Mission accepted.',quest:available};}const active=this.quests.find(q=>q.giver===name&&q.status==='ACTIVE');if(active)return {handled:true,message:name+' says: “'+active.objective+'”',quest:active};const done=this.quests.find(q=>q.giver===name&&q.status==='COMPLETE');if(done)return {handled:true,message:name+' remembers your work on “'+done.title+'”.'};return {handled:true,message:this.dialogue(name,world,event)};}
 if(kind==='creature'){const species=String(target.userData.species??'');this.interacted.add(species);for(const q of this.quests.filter(q=>q.status==='ACTIVE'&&q.type==='CREATURE'&&q.world===world)){q.progress=Math.min(q.target,this.interacted.size);if(q.progress>=q.target)q.status='TURN_IN';}this.save();return {handled:true,message:'You met the '+name+'. It is now in your field journal.'};}
 if(kind==='local-story'){this.interacted.add('story:'+String(target.userData.storyId??name));this.save();const story=target.userData.story as {text?:string}|undefined;return {handled:true,message:story?.text??'Local story recorded in your journal.'};}
 if(kind==='traversal-obstacle'){this.interacted.add('terrain:'+name);for(const q of this.quests.filter(q=>q.status==='ACTIVE'&&q.type==='DISCOVER'))q.progress=Math.min(q.target,this.interacted.size);this.save();return {handled:true,message:'Traversal note recorded: '+name+'.'};}
 if(kind||target.userData.gridFreeObject||target.userData.gridTeleportNodeId){
      const objectId=String(target.userData.gridObjectId??name);
      this.interacted.add(objectId);
      for(const q of this.quests.filter(q=>q.status==='ACTIVE'&&(q.type==='DISCOVER'||q.type==='WORLD_EVENT'))){
        if(q.targetId&&q.targetId!==objectId)continue;
        q.progress=Math.min(q.target,q.progress+1);
        if(q.progress>=q.target)q.status='TURN_IN';
      }
      this.syncMarkers();this.save();return {handled:false};
    }
 return {handled:false};}
 private dialogue(name:string,world:EcologyWorld,event:string){const lines:Record<string,string>={Mara:'The tide changes the harbor routes. Watch the water, not just the roads.',Sela:'The gardens are listening. Stay a moment and the creatures will come closer.',Caro:'Muse is never finished. Every strange detail can become part of the next work.',Rook:'Frontier paths belong to the migration. Sometimes the best route is the one the animals choose.',Orin:'The Crown records signals older than our maps. The aurora is worth watching.',Lyra:'Two worlds are enough to start. After that, the Grid tends to reveal itself.',Aurora:'Build with the world, not merely on top of it.'};return lines[name]??(event!=='QUIET'?name+' is watching the '+event+' signal in '+world+'.':name+' has no new request right now.');}
 getSnapshot(){return {active:this.quests.filter(q=>q.status==='ACTIVE').length,available:this.quests.filter(q=>q.status==='AVAILABLE').length,turnIn:this.quests.filter(q=>q.status==='TURN_IN').length,completed:this.quests.filter(q=>q.status==='COMPLETE').length,total:this.quests.length,reward:this.rewardBank};}
 getQuests(){return this.quests.map(q=>({...q}));}
}
