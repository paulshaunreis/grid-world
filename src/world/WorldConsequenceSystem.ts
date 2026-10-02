import * as THREE from 'three';
import type { EcologyWorld, EcologySnapshot } from './CreatureEcologySystem';
import type { SocietySnapshot } from './NPCSocietySystem';

export type WorldConsequenceKind =
  | 'EVENT_STARTED'
  | 'EVENT_ENDED'
  | 'CREATURE_DEFEATED'
  | 'PLAYER_DISCOVERY'
  | 'NPC_RESPONSE'
  | 'ECOLOGY_SHIFT'
  | 'TRANSIT_FLOW'
  | 'POPULATION_BOOM'
  | 'POPULATION_COLLAPSE'
  | 'MIGRATION_WAVE'
  | 'POLLINATOR_BLOOM'
  | 'NEW_SPECIES'
  | 'SEASONAL_SHIFT';

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
  private lastEcologyPulse=0;
  private populationMemory=new Map<string,number>();
  private eventCooldown=new Map<string,number>();
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

  private eventText(world:EcologyWorld,event:string){
    const texts:Record<string,string>={
      HARBOR:'Tidal systems are shifting through the Harbor. Navigation routes and shoreline life are responding.',
      GARDENS:'A bloom signal is moving through the Gardens. Pollinators and caretakers are changing their routines.',
      CITADEL:'An aurora signal is crossing the Crown. Keepers are watching the old structures for changes.',
      ARTS:'The Muse market is active. Artists, visitors, and local creatures are converging on the galleries.',
      WILDS:'A migration is moving through the Frontier. Rangers and wildlife are changing course.',
    };
    return texts[world] ?? ('The '+event.toLowerCase()+' signal is changing local life.');
  }

  private add(kind:WorldConsequenceKind,world:EcologyWorld,event:string,text:string,impact:number,at:number){
    if (this.pressure[world] === undefined) this.pressure[world]=0;
    if (this.stability[world] === undefined) this.stability[world]=1;
    const item:WorldConsequence={id:'wc-'+at.toString(36)+'-'+Math.random().toString(36).slice(2,7),kind,world,event,text,impact,at};
    this.history=[...this.history,item].slice(-MAX_HISTORY);
    this.pressure[world]=THREE.MathUtils.clamp(this.pressure[world]+Math.abs(impact)*.08,0,1);
    this.stability[world]=THREE.MathUtils.clamp(this.stability[world]-impact*.035,0,1);
    this.lastStoryAt=at;
    this.save();
    this.root.userData.lastConsequence=item;
  }

  update(delta:number,world:EcologyWorld,event:string,activity:number,ecology:EcologySnapshot,society:SocietySnapshot,now=Date.now()/1000,transitFlow=0){
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
    const flowBoost=THREE.MathUtils.clamp(transitFlow*.12,0,.3);
    this.snapshot={world,event:normalized,pressure:p,stability:s,activity:activity*(1+p*.35+flowBoost),history:this.history.slice(-8),last:this.history.at(-1)?.text ?? 'The Grid is quiet.'};
    this.root.userData.snapshot=this.snapshot;
  }

  recordCreatureDefeat(world:EcologyWorld,species:string){
    const now=Date.now()/1000;
    this.add('CREATURE_DEFEATED',world,this.lastEvent.split(':')[1]??'QUIET',species.replaceAll('-',' ')+' was defeated; nearby life has noticed.',.22,now);
  }

  recordDiscovery(world:EcologyWorld,text:string){
    this.add('PLAYER_DISCOVERY',world,this.lastEvent.split(':')[1]??'QUIET',text,.08,Date.now()/1000);
  }

  recordTransitSurge(world:EcologyWorld,flow:number){
    if(flow < 2.5) return;
    const now=Date.now()/1000;
    if(now-this.lastStoryAt < 12) return;
    const text = world==='ARTS' ? 'A transit surge is drawing artists, visitors, and merchants toward the Muse.' :
      world==='GARDENS' ? 'Traveler traffic is carrying new activity into the living terraces.' :
      world==='WILDS' ? 'Travel activity is intersecting frontier migration routes.' :
      world==='CITADEL' ? 'Increased passage is waking dormant systems around the Crown.' :
      'Transit traffic is increasing commerce and movement along the Tideline.';
    this.add('TRANSIT_FLOW',world,'TRANSIT',text,Math.min(.24,flow*.025),now);
  }

  recordEcologyPulse(world:EcologyWorld, interaction:{events?:{hunts?:number;forages?:number;pollinations?:number;decompositions?:number;migrations?:number}}, populations:Array<{speciesId:string;population:number;generation:number}>, season:string, now=Date.now()/1000){
    const events=interaction.events??{};
    const pulse=Number(events.migrations??0)+Number(events.pollinations??0)+Number(events.hunts??0)+Number(events.forages??0)+Number(events.decompositions??0);
    if(now-this.lastEcologyPulse<2 && pulse<2) return;
    this.lastEcologyPulse=now;
    const emit=(kind:WorldConsequenceKind,text:string,impact:number,cooldown=20)=>{
      const key=world+':'+kind;
      const until=this.eventCooldown.get(key)??0;
      if(now<until)return;
      this.eventCooldown.set(key,now+cooldown);
      this.add(kind,world,'ECOLOGY',text,impact,now);
    };
    if(Number(events.migrations??0)>=2) emit('MIGRATION_WAVE','A migration wave is moving through the habitat. Feeding pressure and travel routes are changing.',.12,24);
    if(Number(events.pollinations??0)>=2) emit('POLLINATOR_BLOOM','Pollinator activity is surging. Flowering routes are spreading through the living world.',.08,24);
    if(Number(events.hunts??0)>=2) emit('ECOLOGY_SHIFT','Predator encounters are reshaping local herd pressure.',-.05,22);
    if(Number(events.forages??0)>=3) emit('ECOLOGY_SHIFT','Herbivore feeding pressure is changing the local vegetation balance.',-.03,22);
    if(season && season!==String(this.root.userData.lastSeason??'')){
      this.root.userData.lastSeason=season;
      emit('SEASONAL_SHIFT','The '+season.toLowerCase()+' season has shifted the rhythm of local life.',.03,1);
    }
    for(const p of populations){
      const key=world+':'+p.speciesId;
      const previous=this.populationMemory.get(key);
      this.populationMemory.set(key,p.population);
      if(previous===undefined) continue;
      if(previous>=4 && p.population>=Math.max(14,previous*1.45)) emit('POPULATION_BOOM',p.speciesId.replaceAll('-',' ')+' is experiencing a population boom. The habitat is responding.',.07,30);
      if(previous>=8 && p.population<=Math.max(2,previous*.45)) emit('POPULATION_COLLAPSE',p.speciesId.replaceAll('-',' ')+' has suffered a population collapse. The local food web is under pressure.',-.14,30);
    }
  }

  recordNewSpecies(world:EcologyWorld,name:string,generation:number){
    const key=world+':species:'+name;
    const now=Date.now()/1000;
    const until=this.eventCooldown.get(key)??0;
    if(now<until)return;
    this.eventCooldown.set(key,now+120);
    this.add('NEW_SPECIES',world,'EVOLUTION',name.replaceAll('-',' ')+' has emerged as a new evolutionary form (generation '+generation+').',.16,now);
  }

  exportState() {
    return {
      history: this.history.slice(-MAX_HISTORY),
      pressure: this.pressure,
      stability: this.stability,
    };
  }

  importState(raw: unknown) {
    if (!raw || typeof raw !== 'object') return;
    const p = raw as Record<string, unknown>;
    if (Array.isArray(p.history)) this.history = p.history.slice(-MAX_HISTORY) as WorldConsequence[];
    if (p.pressure && typeof p.pressure === 'object') this.pressure = { ...this.pressure, ...(p.pressure as Record<EcologyWorld, number>) };
    if (p.stability && typeof p.stability === 'object') this.stability = { ...this.stability, ...(p.stability as Record<EcologyWorld, number>) };
    this.snapshot = { ...this.snapshot, history: this.history.slice(-8), pressure: this.pressure[this.snapshot.world] ?? 0, stability: this.stability[this.snapshot.world] ?? 1, last: this.history.at(-1)?.text ?? 'The Grid is quiet.' };
    this.root.userData.snapshot = this.snapshot;
    this.save();
  }

  getSnapshot(){return this.snapshot;}
  recordResourceGathered(world:EcologyWorld, kind:string, amount:number){
    this.add('ECOLOGY_SHIFT',world,this.lastEvent.split(':')[1]??'QUIET',`Resource flow: +${amount} ${kind.replaceAll('_',' ')}`,.04,Date.now()/1000);
  }
  getRecentHistory(){return this.history.slice(-MAX_HISTORY);}
}
