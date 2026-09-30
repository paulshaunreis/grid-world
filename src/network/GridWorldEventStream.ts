import type { SupabaseClient } from '@supabase/supabase-js';

export interface GridWorldEvent {
  id:string;
  event_type:string;
  source_table:string|null;
  source_id:string|null;
  region_id:string|null;
  title:string;
  summary:string;
  visibility:string;
  metadata:Record<string,unknown>;
  created_at:string;
}

export class GridWorldEventStream {
  private cursor=0;
  private events:GridWorldEvent[]=[];
  private inFlight=false;
  constructor(private readonly client:SupabaseClient){}
  async poll(limit=24){
    if(this.inFlight)return this.events;
    this.inFlight=true;
    try{
      const {data,error}=await this.client.from('grid_world_events')
        .select('*')
        .eq('visibility','public')
        .order('created_at',{ascending:false})
        .limit(limit);
      if(error) throw error;
      const incoming=(data??[]) as GridWorldEvent[];
      const seen=new Set(this.events.map(e=>e.id));
      for(const event of incoming) if(!seen.has(event.id)) this.events.push(event);
      this.events=this.events.slice(-64);
      return incoming;
    }finally{this.inFlight=false;}
  }
  getRecent(){return this.events.slice(-64);}
}
