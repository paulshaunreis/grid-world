import type { SupabaseClient } from '@supabase/supabase-js';
export interface GridTeleportInvite{id:string;senderUserId:string;recipientUserId:string;destinationId:string;destinationName:string;previewImageUrl?:string|null;status:'pending'|'accepted'|'declined'|'expired'|'cancelled';createdAt:string;expiresAt:string;}
export class GridTeleportInviteAuthority{
 constructor(private readonly client:SupabaseClient){}
 async create(recipientUserId:string,destination:{id:string;displayName:string;previewImageUrl?:string|null}){const {data,error}=await this.client.rpc('grid_teleport_invite_create',{p_recipient:recipientUserId,p_destination_id:destination.id,p_destination_name:destination.displayName,p_preview_image_url:destination.previewImageUrl??null});if(error)throw error;return data as string;}
 async pending(){const {data,error}=await this.client.from('grid_teleport_invites').select('*').eq('status','pending').order('created_at',{ascending:false});if(error)throw error;return (data??[]) as GridTeleportInvite[];}
 async respond(id:string,status:'accepted'|'declined'){const {data,error}=await this.client.rpc('grid_teleport_invite_respond',{p_invite:id,p_status:status});if(error)throw error;return data as GridTeleportInvite;}
}