import type { SupabaseClient } from '@supabase/supabase-js';
export interface GridPartyInvite{id:string;partyId:string;senderUserId:string;recipientUserId:string;status:'pending'|'accepted'|'declined'|'expired'|'cancelled';createdAt:string;expiresAt:string;}
export class GridPartyInviteAuthority{
 constructor(private readonly client:SupabaseClient){}
 async ensureParty(name='Grid Party'){const {data,error}=await this.client.rpc('grid_party_create',{p_name:name});if(error)throw error;return data as string;}
 async create(partyId:string,recipientUserId:string){const {data,error}=await this.client.rpc('grid_party_invite_create',{p_party:partyId,p_recipient:recipientUserId});if(error)throw error;return data as string;}
 async pending(){const {data,error}=await this.client.from('grid_party_invites').select('*').eq('status','pending').order('created_at',{ascending:false});if(error)throw error;return (data??[]) as GridPartyInvite[];}
 async respond(id:string,status:'accepted'|'declined'){const {data,error}=await this.client.rpc('grid_party_invite_respond',{p_invite:id,p_status:status});if(error)throw error;return data as GridPartyInvite;}
}