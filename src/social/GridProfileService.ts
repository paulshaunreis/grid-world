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
    // grid_user_profiles is the Grid-facing profile contract. Keep profiles as a
    // compatibility fallback for older accounts while the surfaces converge.
    const {data:gridProfile,error:gridError}=await this.client
      .from('grid_user_profiles')
      .select('user_id,handle,display_name,avatar_url')
      .eq('user_id',userId)
      .maybeSingle();
    if(gridError) throw gridError;

    let id=userId;
    let handle=gridProfile?.handle??undefined;
    let displayName=gridProfile?.display_name??undefined;
    let avatarImageUrl=gridProfile?.avatar_url??undefined;

    if(!gridProfile){
      const {data:legacy,error:legacyError}=await this.client
        .from('profiles')
        .select('id,handle,username,display_name,avatar_image_url,avatar_url')
        .eq('id',userId)
        .maybeSingle();
      if(legacyError) throw legacyError;
      if(!legacy) return null;
      id=String(legacy.id);
      handle=legacy.handle??legacy.username??undefined;
      displayName=legacy.display_name??handle??'Grid User';
      avatarImageUrl=legacy.avatar_image_url??legacy.avatar_url??undefined;
    }

    const {data:presence}=await this.client
      .from('grid_account_presence')
      .select('online,world_id,region_id')
      .eq('user_id',userId)
      .maybeSingle();

    return {
      id,
      handle,
      displayName:displayName??handle??'Grid User',
      avatarImageUrl,
      online:Boolean(presence?.online),
      worldId:presence?.world_id??undefined,
      regionId:presence?.region_id??undefined,
    };
  }
  async connectionState(userId:string){
    const me=(await this.client.auth.getUser()).data.user?.id;
    if(!me) return {friend:false,follow:false};
    const {data,error}=await this.client.from('grid_social_connections').select('kind,status').eq('requester_id',me).eq('target_id',userId);
    if(error) throw error;
    return {friend:Boolean((data??[]).some(x=>x.kind==='friend'&&x.status==='active')),follow:Boolean((data??[]).some(x=>x.kind==='follow'&&x.status==='active'))};
  }
}
