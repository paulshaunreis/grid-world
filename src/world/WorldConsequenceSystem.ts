import * as THREE from 'three';
import type { EcologyWorld, EcologySnapshot } from './CreatureEcologySystem';
import type { SocietySnapshot } from './NPCSocietySystem';

export type WorldConsequenceKind =
  | 'EVENT_STARTED'
  | 'EVENT_ENDED'
  | 'CREATURE_DEFEATED'
  | 'PLAYER_DISCOVERY'
  | 'NPC_RESPONSE'
  | 'ECOLOGY_SHIFT';

export interface WorldConsequence {
  id:string;
  kind:WorldConsequenceKind;
  world:EcologyWorld;
  event:string;
  text:string;
  impact:number;
  at:number;
}

export interface WorldConsequenceSnapshot {
  world:EcologyWorld;
  event:string;
  pressure:number;
  stability:number;
  activity:number;
  history:WorldConsequence[];
  last:string;
}

const STORAGE_KEY='grid-world:world-consequences:v1';
const MAX_HISTORY=24;

export class WorldConsequenceSystem {
  readonly root=new THREE.Group();
  private history:WorldConsequence[]=[];
  private pressure:Record<EcologyWorld,number>={HARBOR:0,GARDENS:0,CITADEL:0,ARTS:0,WILDS:0};
  private stability:Record<EcologyWorld,number>={HARBOR:1,GARDENS:1,CITADEL:1,ARTS:1,WILDS:1};
  private lastEvent='';
  private lastWorld:EcologyWorld='HARBOR';
  private lastStoryAt=0;
  private snapshot:WorldConsequenceSnapshot={world:'HARBOR',event:'QUIET',pressure:0,stability:1,activity:1,history:[],last:'The Grid is quiet.'};

  constructor(){
    this.root.name='grid-world-consequences';
    this.root.userData.system='shared-world-consequence-layer';
    this.load();
  }

  private load(){
    try{
      const raw=localStorage.getItem(STORAGE_KEY);
      if(!raw)return;
      const parsed=JSON.parse(raw) as {history?:WorldConsequence[];pressure?:Record<EcologyWorld,number>;stability?:Record<EcologyWorld,number>};
      this.history=Array.isArray(parsed.history)?parsed.history.slice(-MAX_HISTORY):[];
      if(parsed.pressure)this.pressure={...this.pressure,...parsed.pressure};
      if(parsed.stability)this.stability={...this.stability,...parsed.stability};
    }catch{ /* local history is optional */ }
  }

  private save(){
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify({history:this.history.slice(-MAX_HISTORY),pressure:this.pressure,stability:this.stability}));}catch{}
  }

  private add(kind:WorldConsequenceKind,world:EcologyWorld,event:string,text:string,impact:number,at:number){
    const item:WorldConsequence={id:'wc-'+at.toString(36)+'-'+Math.random().toString(36).slice(2,7),kind,world,event,text,impact,at};
    this.history=[...this.history,item].slice(-MAX_HISTORY);
    this.pressure[world]=THREE.MathUtils.clamp(this.pressure[world]+Math.abs(impact)*.08,0,1);
    this.stability[world]=THREE.MathUtils.clamp(this.stability[world]-impact*.035,0,1);
    this.lastStoryAt=at;
    this.save();
    this.root.userData.lastConsequence=item;
  }

  update(delta:number,world:EcologyWorld,event:string,activity:number,ecology:EcologySnapshot,society:SocietySnapshot,now=Date.now()/1000){
    const normalized=event.toUpperCase();
    if(world!==this.lastWorld){
      this.lastWorld=world;
      this.add('ECOLOGY_SHIFT',world,normalized,'The living systems are adapting as travelers cross into '+world+'.',.15,now);
    }
    const eventKey=world+':'+normalized;
    if(eventKey!==this.lastEvent){
      if(this.lastEvent)this.add('EVENT_ENDED',world,normalized,'The previous world signal has faded into the local history.',-.05,now);
      this.lastEvent=eventKey;
      this.add('EVENT_STARTED',world,normalized,this.eventText(world,normalized),.1,now);
    }

    for(const key of Object.keys(this.pressure) as EcologyWorld[]){
      this.pressure[key]=Math.max(0,this.pressure[key]-delta*.004);
      this.stability[key]=THREE.MathUtils.clamp(this.stability[key]+delta*.0015,0,1);
    }

    if(now-this.lastStoryAt>18 && society.talking>0 && ecology.active>0 && normalized!=='QUIET'){
      this.add('NPC_RESPONSE',world,normalized,'Citizens are discussing the '+normalized.toLowerCase()+' signal and adjusting their routines.',.04,now);
    }

    const p=this.pressure[world];
    const s=this.stability[world];
    this.snapshot={world,event:normalized,pressure:p,stability:s,activity:activity*(1+p*.35),history:this.history.slice(-8),last:this.history.at(-1)?.text ?? 'The Grid is quiet.'};
    this.root.userData.snapshot=this.snapshot;
  }

  recordCreatureDefeat(world:EcologyWorld,species:string){
    const now=Date.now()/1000;
    this.add('CREATURE_DEFEATED',world,this.lastEvent.split(':')[1]??'QUIET',species.replaceAll('-',' ')+' was defeated; nearby life has noticed.',.22,now);
  }

  recordDiscovery(world:EcologyWorld,text:string){
    this.add('PLAYER_DISCOVERY',world,this.lastEvent.split(':')[1]??'QUIET',text,.08,Date.now()/1000);
  }

  getSnapshot(){return this.snapshot;}
  getRecentHistory(){return this.history.slice(-MAX_HISTORY);}
}
