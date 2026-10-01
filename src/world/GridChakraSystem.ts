export type GridChakraId = 'ROOT'|'SACRAL'|'SOLAR'|'HEART'|'THROAT'|'VISION'|'CROWN';

export interface GridChakraState {
  id: GridChakraId;
  name: string;
  resonance: number;
  stability: number;
  affinityTags: readonly string[];
}

/** Fictional/spiritual gameplay layer inspired by chakra traditions; not a medical model. */
const DEFINITIONS: Readonly<Record<GridChakraId,{name:string;tags:string[]}>> = {
  ROOT:{name:'Root',tags:['earth','stability','survival']},
  SACRAL:{name:'Sacral',tags:['water','creation','adaptation']},
  SOLAR:{name:'Solar',tags:['fire','will','action']},
  HEART:{name:'Heart',tags:['air','life','connection']},
  THROAT:{name:'Throat',tags:['sound','expression','communication']},
  VISION:{name:'Vision',tags:['light','perception','discovery']},
  CROWN:{name:'Crown',tags:['aether','cosmos','systems']},
};

export class GridChakraSystem {
  private readonly states = new Map<GridChakraId,GridChakraState>();
  constructor(){ this.reset(); }
  reset(){ this.states.clear(); for(const [id,d] of Object.entries(DEFINITIONS) as [GridChakraId,{name:string;tags:string[]}][]) this.states.set(id,{id,name:d.name,resonance:.5,stability:1,affinityTags:d.tags}); }
  tune(id:GridChakraId, amount:number){ const s=this.states.get(id); if(!s)return; s.resonance=Math.max(0,Math.min(1,s.resonance+amount)); s.stability=Math.max(0,Math.min(1,s.stability+amount*.25)); }
  alignToTags(tags:readonly string[]){ for(const s of this.states.values()){ const matches=s.affinityTags.filter(tag=>tags.includes(tag)).length; if(matches) this.tune(s.id,Math.min(.12,matches*.04)); } }
  update(delta:number, worldTags:readonly string[]){ this.alignToTags(worldTags); for(const s of this.states.values()) s.resonance += (s.stability-s.resonance)*Math.min(.08,delta*.03); }
  get(id:GridChakraId){ return this.states.get(id); }
  getSnapshot(){ return [...this.states.values()].map(s=>({...s,affinityTags:[...s.affinityTags]})); }
}
