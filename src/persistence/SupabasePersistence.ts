import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { PersistedPlayerState } from '../core/Persistence';
import type { PlayerIdentity } from '../core/PlayerIdentity';

export interface PersistedGridBuild { objectId:string; definitionId:string; position:[number,number,number]; rotation:[number,number,number]; scale:[number,number,number]; }

export class SupabasePersistence {
  private readonly client: SupabaseClient;

  constructor(url: string, publishableKey: string) {
    this.client = createClient(url, publishableKey);
  }

  getClient() {
    return this.client;
  }

  async signInAnonymously() {
    return this.client.auth.signInAnonymously();
  }

  async save(identity: PlayerIdentity, state: PersistedPlayerState) {
    const { error: profileError } = await this.client.from('profiles').upsert({
      id: identity.id,
      display_name: identity.displayName,
      updated_at: new Date().toISOString(),
    });
    if (profileError) throw profileError;

    const { error } = await this.client.from('player_state').upsert({
      user_id: identity.id,
      region_id: state.regionId,
      x: state.x,
      y: state.y,
      z: state.z,
      yaw: state.yaw,
      updated_at: state.updatedAt,
    });
    if (error) throw error;
  }

  async saveBuilds(identity: PlayerIdentity, worldId:string, regionId:string, builds:PersistedGridBuild[]) {
    const { data: existing, error: existingError } = await this.client
      .from('grid_build_objects')
      .select('object_id')
      .eq('user_id', identity.id)
      .eq('world_id', worldId)
      .eq('region_id', regionId);
    if (existingError) throw existingError;

    const desiredIds = new Set(builds.map(build => build.objectId));
    const staleIds = (existing ?? []).map(row => String(row.object_id)).filter(id => !desiredIds.has(id));

    for (const objectId of staleIds) {
      const { error } = await this.client.rpc('grid_build_delete', {
        p_world_id: worldId, p_region_id: regionId, p_object_id: objectId,
      });
      if (error) throw error;
    }

    for (const build of builds) {
      const { error } = await this.client.rpc('grid_build_upsert', {
        p_world_id: worldId,
        p_region_id: regionId,
        p_object_id: build.objectId,
        p_definition_id: build.definitionId,
        p_position: build.position,
        p_rotation: build.rotation,
        p_scale: build.scale,
      });
      if (error) throw error;
    }
  }

  async loadBuilds(identity: PlayerIdentity, worldId:string, regionId:string):Promise<PersistedGridBuild[]> {
    const { data, error } = await this.client
      .from('grid_build_objects')
      .select('object_id,definition_id,position,rotation,scale')
      .eq('world_id', worldId)
      .eq('region_id', regionId);
    if (error) throw error;
    return (data ?? []).flatMap(row => {
      const p = Array.isArray(row.position) ? row.position.map(Number) : [];
      const r = Array.isArray(row.rotation) ? row.rotation.map(Number) : [];
      const s = Array.isArray(row.scale) ? row.scale.map(Number) : [];
      if (typeof row.object_id !== 'string' || typeof row.definition_id !== 'string' || p.length !== 3 || r.length !== 3 || s.length !== 3 || ![...p,...r,...s].every(Number.isFinite)) return [];
      return [{objectId:row.object_id,definitionId:row.definition_id,position:[p[0],p[1],p[2]],rotation:[r[0],r[1],r[2]],scale:[s[0],s[1],s[2]] as [number,number,number]} as PersistedGridBuild];
    });
  }

  async load(identity: PlayerIdentity: PlayerIdentity) {
    const { data, error } = await this.client
      .from('player_state')
      .select('region_id,x,y,z,yaw,updated_at')
      .eq('user_id', identity.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      regionId: data.region_id,
      x: data.x,
      y: data.y,
      z: data.z,
      yaw: data.yaw,
      updatedAt: data.updated_at,
    } satisfies PersistedPlayerState;
  }
}

// Grid construction persistence remains client-fallback safe when cloud sync is unavailable.
