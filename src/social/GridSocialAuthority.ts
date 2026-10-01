import type { GridOrganizationActorKind, GridOrganizationKind, GridOrganizationRole } from './GridGuildSystem';

export type GridSocialAccessMode='private'|'invite'|'public';

export interface GridSocialOrganization {
  id:string;
  kind:GridOrganizationKind;
  name:string;
  accessMode:GridSocialAccessMode;
  worldId?:string|null;
  metadata:Record<string,unknown>;
}

export type GridFriendStatus='pending'|'accepted'|'blocked';
export interface GridFriendship { userId:string; friendUserId:string; status:GridFriendStatus; requestedBy:string; createdAt?:string; updatedAt?:string; }

export interface GridSocialMember {
  organizationId:string;
  actorKind:GridOrganizationActorKind;
  actorId:string;
  role:GridOrganizationRole;
  joinedAt?:string;
  metadata?:Record<string,unknown>;
}

export interface GridSocialRpcClient {
  rpc(name:string,args:Record<string,unknown>):Promise<{data:any;error:any}>;
  from?(table:string):any;
}

export class GridSocialAuthority {
  constructor(private readonly client:GridSocialRpcClient){}

  async requestFriend(friendUserId:string):Promise<GridFriendship>{
    const {data,error}=await this.client.rpc('grid_social_friend_request',{p_friend_user_id:friendUserId});
    if(error)throw error;
    return (Array.isArray(data)?data[0]:data) as GridFriendship;
  }

  async respondToFriend(friendUserId:string,status:'accepted'|'blocked'):Promise<GridFriendship>{
    const {data,error}=await this.client.rpc('grid_social_friend_respond',{p_friend_user_id:friendUserId,p_status:status});
    if(error)throw error;
    return (Array.isArray(data)?data[0]:data) as GridFriendship;
  }

  async removeFriend(friendUserId:string):Promise<void>{
    const {error}=await this.client.rpc('grid_social_friend_remove',{p_friend_user_id:friendUserId});
    if(error)throw error;
  }

  async listFriendRelationships():Promise<GridFriendship[]>{
    const {data,error}=await this.client.rpc('grid_social_friend_list',{});
    if(error)throw error;
    return (data??[]) as GridFriendship[];
  }

  async listFriends():Promise<GridFriendship[]>{
    return (await this.listFriendRelationships()).filter(row=>row.status==='accepted');
  }

  async listFriendRequests(direction:'incoming'|'outgoing'|'all'='all'):Promise<GridFriendship[]>{
    const rows=await this.listFriendRelationships();
    return rows.filter(row=>{
      if(row.status!=='pending')return false;
      if(direction==='all')return true;
      const incoming=row.requestedBy===row.friendUserId;
      return direction==='incoming'?incoming:!incoming;
    });
  }

  async upsertOrganization(input:{
    id:string;
    kind:GridOrganizationKind;
    name:string;
    accessMode?:GridSocialAccessMode;
    worldId?:string|null;
    metadata?:Record<string,unknown>;
  }):Promise<GridSocialOrganization>{
    const {data,error}=await this.client.rpc('grid_social_upsert',{
      p_id:input.id,
      p_kind:input.kind,
      p_name:input.name,
      p_access_mode:input.accessMode??'private',
      p_world_id:input.worldId??null,
      p_metadata:input.metadata??{}
    });
    if(error)throw error;
    return (Array.isArray(data)?data[0]:data) as GridSocialOrganization;
  }

  async setMember(input:{
    organizationId:string;
    actorKind:GridOrganizationActorKind;
    actorId:string;
    role?:GridOrganizationRole;
  }):Promise<GridSocialMember>{
    const {data,error}=await this.client.rpc('grid_social_set_member',{
      p_org_id:input.organizationId,
      p_actor_kind:input.actorKind,
      p_actor_id:input.actorId,
      p_role:input.role??'MEMBER'
    });
    if(error)throw error;
    return (Array.isArray(data)?data[0]:data) as GridSocialMember;
  }

  async removeMember(organizationId:string,actorKind:GridOrganizationActorKind,actorId:string):Promise<void>{
    const {error}=await this.client.rpc('grid_social_remove_member',{
      p_org_id:organizationId,
      p_actor_kind:actorKind,
      p_actor_id:actorId
    });
    if(error)throw error;
  }

  async listMembers(organizationId:string):Promise<GridSocialMember[]>{
    if(!this.client.from)throw new Error('GridSocialAuthority requires a query-capable client to list members');
    const {data,error}=await this.client.from('grid_social_members')
      .select('*')
      .eq('organization_id',organizationId)
      .order('joined_at',{ascending:true});
    if(error)throw error;
    return (data??[]) as GridSocialMember[];
  }

  async getOrganization(organizationId:string):Promise<GridSocialOrganization|null>{
    if(!this.client.from)throw new Error('GridSocialAuthority requires a query-capable client to read organizations');
    const {data,error}=await this.client.from('grid_social_organizations')
      .select('*')
      .eq('id',organizationId)
      .maybeSingle();
    if(error)throw error;
    return data as GridSocialOrganization|null;
  }

  async listOrganizations(kind?:GridOrganizationKind):Promise<GridSocialOrganization[]>{
    if(!this.client.from)throw new Error('GridSocialAuthority requires a query-capable client to list organizations');
    let query=this.client.from('grid_social_organizations').select('*').order('name',{ascending:true});
    if(kind)query=query.eq('kind',kind);
    const {data,error}=await query;
    if(error)throw error;
    return (data??[]) as GridSocialOrganization[];
  }
}
