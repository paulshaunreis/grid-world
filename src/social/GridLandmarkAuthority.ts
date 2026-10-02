import type { SupabaseClient } from '@supabase/supabase-js';

export interface GridLandmarkPosition { x:number; y:number; z:number; yaw?:number; }
export interface GridLandmarkRecord {
  id:string;
  userId:string;
  name:string;
  worldId:string;
  regionId:string;
  position:GridLandmarkPosition;
  rotation:Record<string,unknown>;
  previewImageUrl?:string|null;
  description:string;
  tags:string[];
  createdAt?:string;
}
export interface GridLandmarkItem {
  id:string;
  userId:string;
  landmarkId?:string|null;
  itemType:'LANDMARK'|'WAYPOINT';
  label:string;
  icon:string;
  pinned:boolean;
  metadata:Record<string,unknown>;
  createdAt?:string;
}

const toLandmark=(x:any):GridLandmarkRecord=>({
  id:x.id,userId:x.user_id,name:x.name,worldId:x.world_id,regionId:x.region_id,
  position:(x.position??{}) as GridLandmarkPosition,rotation:(x.rotation??{}) as Record<string,unknown>,
  previewImageUrl:x.preview_image_url??null,description:x.description??'',tags:Array.isArray(x.tags)?x.tags:[],createdAt:x.created_at,
});
const toItem=(x:any):GridLandmarkItem=>({
  id:x.id,userId:x.user_id,landmarkId:x.landmark_id,itemType:x.item_type,label:x.label,
  icon:x.icon,pinned:Boolean(x.pinned),metadata:x.metadata??{},createdAt:x.created_at,
});

export class GridLandmarkAuthority {
  constructor(private readonly client:SupabaseClient, private readonly onCreate?:(item:GridLandmarkItem)=>void){}

  private async userId(){
    const {data:{user}}=await this.client.auth.getUser();
    if(!user) throw new Error('Sign in required');
    return user.id;
  }

  async list():Promise<GridLandmarkItem[]>{
    const {data,error}=await this.client.from('grid_landmark_items').select('*')
      .order('pinned',{ascending:false}).order('created_at',{ascending:false});
    if(error) throw error;
    return (data??[]).map(toItem);
  }

  async getLandmark(id:string):Promise<GridLandmarkRecord|null>{
    const {data,error}=await this.client.from('grid_landmarks').select('*').eq('id',id).maybeSingle();
    if(error) throw error;
    return data?toLandmark(data):null;
  }

  async createWaypoint(input:{
    label:string; itemType?:'LANDMARK'|'WAYPOINT'; icon?:string; pinned?:boolean;
    worldId:string; regionId:string; position:GridLandmarkPosition; previewImageUrl?:string|null;
    description?:string; tags?:string[];
  }){
    const userId=await this.userId();
    const name=input.label.trim().slice(0,120)||'Waypoint';
    const {data:landmark,error:landmarkError}=await this.client.from('grid_landmarks').insert({
      user_id:userId,name,world_id:input.worldId,region_id:input.regionId,
      position:input.position,rotation:{yaw:input.position.yaw??0},preview_image_url:input.previewImageUrl??null,
      description:(input.description??'Saved Grid destination').slice(0,500),tags:(input.tags??[]).slice(0,20),
    }).select('*').single();
    if(landmarkError) throw landmarkError;
    const {data:item,error:itemError}=await this.client.from('grid_landmark_items').insert({
      user_id:userId,landmark_id:landmark.id,item_type:input.itemType??'WAYPOINT',
      label:name,icon:input.icon??(input.itemType==='LANDMARK'?'LANDMARK':'WAYPOINT'),pinned:Boolean(input.pinned),
      metadata:{worldId:input.worldId,regionId:input.regionId,position:input.position,previewImageUrl:input.previewImageUrl??null},
    }).select('*').single();
    if(itemError){ await this.client.from('grid_landmarks').delete().eq('id',landmark.id); throw itemError; }
    const created=toItem(item);
    this.onCreate?.(created);
    return {landmark:toLandmark(landmark),item:created};
  }

  async rename(id:string,label:string){
    const name=label.trim().slice(0,120);
    if(!name) throw new Error('A landmark name is required');
    const {error}=await this.client.from('grid_landmark_items').update({label:name}).eq('id',id);
    if(error) throw error;
    const {data:item}=await this.client.from('grid_landmark_items').select('landmark_id').eq('id',id).maybeSingle();
    if(item?.landmark_id) await this.client.from('grid_landmarks').update({name}).eq('id',item.landmark_id);
  }

  async setPinned(id:string,pinned:boolean){
    const {error}=await this.client.from('grid_landmark_items').update({pinned}).eq('id',id);
    if(error) throw error;
  }

  async remove(id:string){
    const {data:item,error:readError}=await this.client.from('grid_landmark_items').select('landmark_id').eq('id',id).maybeSingle();
    if(readError) throw readError;
    const {error}=await this.client.from('grid_landmark_items').delete().eq('id',id);
    if(error) throw error;
    if(item?.landmark_id) await this.client.from('grid_landmarks').delete().eq('id',item.landmark_id);
  }
}
