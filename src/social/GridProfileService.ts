import type { SupabaseClient } from '@supabase/supabase-js';

export interface GridPublicProfile {
  id:string;
  handle?:string;
  displayName:string;
  avatarImageUrl?:string;
  online?:boolean;
  worldId?:string;
  regionId?:string;
}

export class GridProfileService {
  constructor(private readonly client:SupabaseClient){}
  async get(userId:string):Promise<GridPublicProfile|null>{
    const {data,error}=await this.client.from('profiles').select('id,handle,display_name,avatar_image_url').eq('id',userId).maybeSingle();
    if(error) throw error;
    if(!data) return null;
    const {data:presence}=await this.client.from('grid_account_presence').select('online,world_id,region_id').eq('user_id',userId).maybeSingle();
    return {id:data.id,handle:data.handle??undefined,displayName:data.display_name??data.handle??'Grid User',avatarImageUrl:data.avatar_image_url??undefined,online:Boolean(presence?.online),worldId:presence?.world_id??undefined,regionId:presence?.region_id??undefined};
  }
  async connectionState(userId:string){
    const me=(await this.client.auth.getUser()).data.user?.id;
    if(!me) return {friend:false,follow:false};
    const {data,error}=await this.client.from('grid_social_connections').select('kind,status').eq('requester_id',me).eq('target_id',userId);
    if(error) throw error;
    return {friend:Boolean((data??[]).some(x=>x.kind==='friend'&&x.status==='active')),follow:Boolean((data??[]).some(x=>x.kind==='follow'&&x.status==='active'))};
  }
}
