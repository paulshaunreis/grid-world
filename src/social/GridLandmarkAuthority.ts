import type { SupabaseClient } from '@supabase/supabase-js';
export interface GridLandmarkItem { id:string; userId:string; landmarkId?:string|null; itemType:'LANDMARK'|'WAYPOINT'; label:string; icon:string; pinned:boolean; metadata:Record<string,unknown>; createdAt?:string; }
export class GridLandmarkAuthority {
  constructor(private readonly client:SupabaseClient){}
  async list():Promise<GridLandmarkItem[]>{const {data,error}=await this.client.from('grid_landmark_items').select('*').order('pinned',{ascending:false}).order('created_at',{ascending:false});if(error)throw error;return (data??[]).map((x:any)=>({id:x.id,userId:x.user_id,landmarkId:x.landmark_id,itemType:x.item_type,label:x.label,icon:x.icon,pinned:x.pinned,metadata:x.metadata??{},createdAt:x.created_at}));}
  async create(input:Omit<GridLandmarkItem,'id'|'userId'|'createdAt'>){const {data:{user}}=await this.client.auth.getUser();if(!user)throw new Error('Sign in required');const {data,error}=await this.client.from('grid_landmark_items').insert({user_id:user.id,landmark_id:input.landmarkId??null,item_type:input.itemType,label:input.label.slice(0,120),icon:input.icon,pinned:input.pinned,metadata:input.metadata}).select('*').single();if(error)throw error;return data;}
  async remove(id:string){const {error}=await this.client.from('grid_landmark_items').delete().eq('id',id);if(error)throw error;}
}