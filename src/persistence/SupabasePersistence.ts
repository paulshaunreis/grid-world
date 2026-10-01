import { createClient, type RealtimeChannel, type SupabaseClient } from '@supabase/supabase-js';
import type { PersistedPlayerState } from '../core/Persistence';
import type { PlayerIdentity } from '../core/PlayerIdentity';

export interface PersistedGridBuild { objectId:string; definitionId:string; position:[number,number,number]; rotation:[number,number,number]; scale:[number,number,number]; ownerUserId?:string; }
export interface GridBuildRegion { worldId:string; regionId:string; ownerUserId:string; accessMode:'private'|'collaborative'|'public'; }
export interface GridBuildAccess { role:string; canBuild:boolean; canManage:boolean; accessMode:string; ownerUserId:string; }

export class SupabasePersistence {
  private readonly client: SupabaseClient;

  constructor(url: string, publishableKey: string) { this.client = createClient(url, publishableKey); }
  getClient() { return this.client; }
  async signInAnonymously() { return this.client.auth.signInAnonymously(); }

  async ensureBuildRegion(worldId:string, regionId:string, accessMode:'private'|'collaborative'|'public'='collaborative'):Promise<GridBuildRegion> {
    const { data, error } = await this.client.rpc('grid_build_claim_region', {
      p_world_id: worldId, p_region_id: regionId, p_access_mode: accessMode,
    });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) throw new Error('Grid build region authority returned no region.');
    return { worldId:String(row.world_id), regionId:String(row.region_id), ownerUserId:String(row.owner_user_id), accessMode:row.access_mode };
  }

  async getBuildAccess(worldId:string, regionId:string):Promise<GridBuildAccess|null> {
    const { data, error } = await this.client.rpc('grid_build_get_access', { p_world_id:worldId, p_region_id:regionId });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    return row ? { role:String(row.role ?? 'viewer'), canBuild:Boolean(row.can_build), canManage:Boolean(row.can_manage), accessMode:String(row.access_mode), ownerUserId:String(row.owner_user_id) } : null;
  }

  async setBuildMember(worldId:string, regionId:string, userId:string, role:'viewer'|'builder'|'manager'|'owner') {
    const { error } = await this.client.rpc('grid_build_set_member', { p_world_id:worldId, p_region_id:regionId, p_user_id:userId, p_role:role });
    if (error) throw error;
  }
  async listBuildMembers(worldId:string, regionId:string):Promise<Array<{userId:string;role:string}>> {
    const { data, error } = await this.client.rpc('grid_build_list_members', { p_world_id:worldId, p_region_id:regionId });
    if (error) throw error;
    return (data ?? []).map((row:any)=>({userId:String(row.user_id),role:String(row.role)}));
  }

  async save(identity: PlayerIdentity, state: PersistedPlayerState) {
    const { error: profileError } = await this.client.from('profiles').upsert({ id: identity.id, display_name: identity.displayName, updated_at: new Date().toISOString() });
    if (profileError) throw profileError;
    const { error } = await this.client.from('player_state').upsert({ user_id: identity.id, region_id: state.regionId, x: state.x, y: state.y, z: state.z, yaw: state.yaw, updated_at: state.updatedAt });
    if (error) throw error;
  }

  async saveBuilds(identity: PlayerIdentity, worldId:string, regionId:string, builds:PersistedGridBuild[]) {
    const { data: existing, error: existingError } = await this.client.from('grid_build_objects').select('object_id').eq('user_id', identity.id).eq('world_id', worldId).eq('region_id', regionId);
    if (existingError) throw existingError;
    const ownBuilds = builds.filter(build => !build.ownerUserId || build.ownerUserId === identity.id);
    const desiredIds = new Set(ownBuilds.map(build => build.objectId));
    for (const objectId of (existing ?? []).map(row => String(row.object_id)).filter(id => !desiredIds.has(id))) {
      const { error } = await this.client.rpc('grid_build_delete', { p_world_id: worldId, p_region_id: regionId, p_object_id: objectId });
      if (error) throw error;
    }
    for (const build of ownBuilds) {
      const { error } = await this.client.rpc('grid_build_upsert', { p_world_id: worldId, p_region_id: regionId, p_object_id: build.objectId, p_definition_id: build.definitionId, p_position: build.position, p_rotation: build.rotation, p_scale: build.scale });
      if (error) throw error;
    }
  }

  async loadBuilds(_identity: PlayerIdentity, worldId:string, regionId:string):Promise<PersistedGridBuild[]> {
    const { data, error } = await this.client.from('grid_build_objects').select('object_id,definition_id,position,rotation,scale,user_id').eq('world_id', worldId).eq('region_id', regionId);
    if (error) throw error;
    return (data ?? []).flatMap(row => {
      const p = Array.isArray(row.position) ? row.position.map(Number) : [];
      const r = Array.isArray(row.rotation) ? row.rotation.map(Number) : [];
      const s = Array.isArray(row.scale) ? row.scale.map(Number) : [];
      if (typeof row.object_id !== 'string' || typeof row.definition_id !== 'string' || p.length !== 3 || r.length !== 3 || s.length !== 3 || ![...p,...r,...s].every(Number.isFinite)) return [];
      return [{objectId:row.object_id,definitionId:row.definition_id,position:[p[0],p[1],p[2]],rotation:[r[0],r[1],r[2]],scale:[s[0],s[1],s[2]] as [number,number,number],ownerUserId:String((row as any).user_id ?? '')} as PersistedGridBuild];
    });
  }

  subscribeBuildChanges(worldId:string, regionId:string, onChange:(build:PersistedGridBuild|null, type:'INSERT'|'UPDATE'|'DELETE')=>void):RealtimeChannel {
    return this.client.channel('grid-build-'+worldId+'-'+regionId).on('postgres_changes', { event:'*', schema:'public', table:'grid_build_objects', filter:'world_id=eq.'+worldId }, payload => {
      const row = (payload.new && Object.keys(payload.new).length ? payload.new : payload.old) as any;
      if (String(row?.region_id ?? '') !== regionId) return;
      const parse = (value:any):[number,number,number]|null => Array.isArray(value) && value.length===3 && value.every((n:any)=>Number.isFinite(Number(n))) ? [Number(value[0]),Number(value[1]),Number(value[2])] : null;
      const p=parse(row?.position), r=parse(row?.rotation), s=parse(row?.scale);
      const build = row?.object_id && row?.definition_id && p && r && s ? { objectId:String(row.object_id), definitionId:String(row.definition_id), position:p, rotation:r, scale:s, ownerUserId:String(row?.user_id ?? '') } : null;
      onChange(build, payload.eventType as 'INSERT'|'UPDATE'|'DELETE');
    }).subscribe();
  }

  async load(identity: PlayerIdentity) {
    const { data, error } = await this.client.from('player_state').select('region_id,x,y,z,yaw,updated_at').eq('user_id', identity.id).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return { regionId:data.region_id, x:data.x, y:data.y, z:data.z, yaw:data.yaw, updatedAt:data.updated_at } satisfies PersistedPlayerState;
  }
}
