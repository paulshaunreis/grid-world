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
