import type { SupabaseClient } from '@supabase/supabase-js';

export interface GridPartyMember{partyId:string;userId:string;role:'LEADER'|'MEMBER';healthCurrent:number;healthMax:number;manaCurrent?:number|null;manaMax?:number|null;level:number;worldId?:string|null;regionId?:string|null;updatedAt?:string;}
export interface GridPartyDestination{partyId:string;destinationId:string|null;destinationName:string|null;previewImageUrl:string|null;status:'idle'|'pending'|'active';setAt:string|null;updatedAt:string|null;}
export class GridPartySystem{
  constructor(private readonly client:SupabaseClient){}
  async current():Promise<GridPartyMember[]>{
    const {data,error}=await this.client.from('grid_party_members').select('*').order('role',{ascending:true}).order('updated_at',{ascending:false});
    if(error)throw error;
    return (data??[]) as GridPartyMember[];
  }
  async updateVitals(partyId:string,vitals:{healthCurrent:number;healthMax:number;manaCurrent?:number|null;manaMax?:number|null;level?:number;worldId?:string|null;regionId?:string|null}){const {error}=await this.client.from('grid_party_members').update({health_current:vitals.healthCurrent,health_max:vitals.healthMax,mana_current:vitals.manaCurrent??null,mana_max:vitals.manaMax??null,level:vitals.level??1,world_id:vitals.worldId??null,region_id:vitals.regionId??null,updated_at:new Date().toISOString()}).eq('party_id',partyId).eq('user_id',(await this.client.auth.getUser()).data.user?.id??'');if(error)throw error;}
  async transferLeadership(partyId:string,userId:string){const {data,error}=await this.client.rpc('grid_party_transfer_leadership',{p_party:partyId,p_recipient:userId});if(error)throw error;return Boolean(data);}
  async leave(partyId:string){const {data,error}=await this.client.rpc('grid_party_leave',{p_party:partyId});if(error)throw error;return Boolean(data);}
  async kick(partyId:string,userId:string){const {data,error}=await this.client.rpc('grid_party_kick',{p_party:partyId,p_recipient:userId});if(error)throw error;return Boolean(data);}
  async setDestination(partyId:string,destination:{id:string;name?:string;previewImageUrl?:string|null}){const {data,error}=await this.client.rpc('grid_party_set_destination',{p_party:partyId,p_destination_id:destination.id,p_destination_name:destination.name??destination.id,p_preview_image_url:destination.previewImageUrl??null});if(error)throw error;return Boolean(data);}
  async activateDestination(partyId:string){const {data,error}=await this.client.rpc('grid_party_activate_destination',{p_party:partyId});if(error)throw error;return Boolean(data);}
  async clearDestination(partyId:string){const {data,error}=await this.client.rpc('grid_party_clear_destination',{p_party:partyId});if(error)throw error;return Boolean(data);}
  async destination(partyId:string){const {data,error}=await this.client.from('grid_parties').select('id,destination_id,destination_name,destination_preview_image_url,destination_status,destination_set_at,updated_at').eq('id',partyId).maybeSingle();if(error)throw error;if(!data)return null;return {partyId:String(data.id),destinationId:data.destination_id?String(data.destination_id):null,destinationName:data.destination_name?String(data.destination_name):null,previewImageUrl:data.destination_preview_image_url?String(data.destination_preview_image_url):null,status:String(data.destination_status) as GridPartyDestination['status'],setAt:data.destination_set_at?String(data.destination_set_at):null,updatedAt:data.updated_at?String(data.updated_at):null};}
}