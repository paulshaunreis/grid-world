export type GridKarmaAction = 'HELP'|'HARM'|'DISCOVER'|'KEEP_PROMISE'|'BREAK_PROMISE'|'PROTECT'|'STEAL'|'CREATE'|'DESTROY';

export interface GridKarmaState { subjectId:string; karma:number; luck:number; streak:number; lastAction?:GridKarmaAction; }

const DELTA:Record<GridKarmaAction,number>={HELP:3,HARM:-3,DISCOVER:1,KEEP_PROMISE:2,BREAK_PROMISE:-2,PROTECT:3,STEAL:-4,CREATE:2,DESTROY:-2};

export class GridKarmaSystem {
  private readonly states=new Map<string,GridKarmaState>();
  private state(subjectId:string){ let s=this.states.get(subjectId); if(!s){s={subjectId,karma:0,luck:.5,streak:0};this.states.set(subjectId,s);} return s; }
  record(subjectId:string,action:GridKarmaAction,impact=1){ const s=this.state(subjectId); const delta=DELTA[action]*Math.max(.25,Math.min(3,impact)); s.karma=Math.max(-100,Math.min(100,s.karma+delta)); s.streak=delta>=0?s.streak+1:Math.min(0,s.streak-1); s.luck=Math.max(0,Math.min(1,.5+s.karma/250+s.streak/100)); s.lastAction=action; return {...s}; }
  roll(subjectId:string,baseChance:number){ const s=this.state(subjectId); const chance=Math.max(.01,Math.min(.99,baseChance+(s.luck-.5)*.2)); const success=Math.random()<chance; return {success,chance,karma:s.karma,luck:s.luck}; }
  get(subjectId:string){ return {...this.state(subjectId)}; }
  getSnapshot(){ return [...this.states.values()].map(s=>({...s})); }
}
