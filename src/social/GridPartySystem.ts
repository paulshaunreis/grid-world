import type { SupabaseClient } from '@supabase/supabase-js';

export interface GridPartyMember{partyId:string;userId:string;role:'LEADER'|'MEMBER';healthCurrent:number;healthMax:number;manaCurrent?:number|null;manaMax?:number|null;level:number;worldId?:string|null;regionId?:string|null;updatedAt?:string;}
export class GridPartySystem{
  constructor(private readonly client:SupabaseClient){}
  async current():Promise<GridPartyMember[]>{
    const {data,error}=await this.client.from('grid_party_members').select('*').order('role',{ascending:true}).order('updated_at',{ascending:false});
    if(error)throw error;
    return (data??[]) as GridPartyMember[];
  }
  async updateVitals(partyId:string,vitals:{healthCurrent:number;healthMax:number;manaCurrent?:number|null;manaMax?:number|null;level?:number;worldId?:string|null;regionId?:string|null}){
    const {error}=await this.client.from('grid_party_members').update({health_current:vitals.healthCurrent,health_max:vitals.healthMax,mana_current:vitals.manaCurrent??null,mana_max:vitals.manaMax??null,level:vitals.level??1,world_id:vitals.worldId??null,region_id:vitals.regionId??null,updated_at:new Date().toISOString()}).eq('party_id',partyId).eq('user_id',(await this.client.auth.getUser()).data.user?.id??'');
    if(error)throw error;
  }
}