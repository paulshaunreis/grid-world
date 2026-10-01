export type GridJobStatus='idle'|'running'|'passed'|'warning'|'failed';
export type GridJobDomain='CODE'|'ROUTES'|'3D'|'IMAGERY'|'GAMES'|'LIVE';

export interface GridSystemJob {
  id:string; domain:GridJobDomain; name:string; intervalMs:number;
  run:()=>Promise<{status:Exclude<GridJobStatus,'idle'|'running'>;message:string}>;
}

export class GridSystemJobRunner {
  private jobs = new Map<string, GridSystemJob>();
  private timers = new Map<string, number>();
  private state = new Map<string,{status:GridJobStatus;message:string;updatedAt:string}>();
  register(job:GridSystemJob){
    this.jobs.set(job.id,job);
    this.state.set(job.id,{status:'idle',message:'Queued',updatedAt:new Date().toISOString()});
    return this;
  }
  async run(id:string){
    const job=this.jobs.get(id); if(!job) throw new Error('Unknown Grid job: '+id);
    this.state.set(id,{status:'running',message:'Running',updatedAt:new Date().toISOString()});
    try{const r=await job.run();this.state.set(id,{...r,updatedAt:new Date().toISOString()});return r}
    catch(error){const message=error instanceof Error?error.message:String(error);const r={status:'failed' as const,message};this.state.set(id,{...r,updatedAt:new Date().toISOString()});return r}
  }
  startAll(){
    for(const job of this.jobs.values()){
      void this.run(job.id);
      this.timers.set(job.id,window.setInterval(()=>void this.run(job.id),job.intervalMs));
    }
  }
  stopAll(){for(const id of this.timers.values())window.clearInterval(id);this.timers.clear()}
  snapshot(){return Object.fromEntries(this.state.entries())}
}