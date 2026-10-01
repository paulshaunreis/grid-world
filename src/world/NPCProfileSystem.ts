import type { SupabaseClient } from '@supabase/supabase-js';

export interface NPCProfile {
  id:string;
  display_name:string;
  role:string;
  archetype:string;
  personality:Record<string,unknown>;
  autonomy_profile:Record<string,unknown>;
  schedule:unknown[];
  merchant?:boolean;
}

export class NPCProfileSystem {
  private profiles=new Map<string,NPCProfile>();
  constructor(private readonly client?:SupabaseClient){}

  async load(npcId:string):Promise<NPCProfile|null>{
    if(this.profiles.has(npcId)) return this.profiles.get(npcId)!;
    if(!this.client) return null;
    const {data,error}=await this.client.from('grid_npc_profiles').select('*').eq('id',npcId).maybeSingle();
    if(error||!data) return null;
    const profile={...data,merchant:Boolean(data.role?.toLowerCase().includes('merchant')||data.role?.toLowerCase().includes('broker'))} as NPCProfile;
    this.profiles.set(npcId,profile);
    return profile;
  }

  async memories(npcId:string,limit=12){
    if(!this.client) return [];
    const {data}=await this.client.functions.invoke('grid-combat',{body:{action:'npc_memory_read',npc_id:npcId,limit}});
    return (data as {memories?:unknown[]}|null)?.memories??[];
  }

  snapshot(){return [...this.profiles.values()];}
}
