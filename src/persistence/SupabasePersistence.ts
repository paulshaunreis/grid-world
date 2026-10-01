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
    const scope = this.client.from('grid_build_objects');
    const { error: removeError } = await scope.delete().eq('user_id', identity.id).eq('world_id', worldId).eq('region_id', regionId);
    if (removeError) throw removeError;
    if (!builds.length) return;
    const rows = builds.map(build => ({
      user_id: identity.id,
      world_id: worldId,
      region_id: regionId,
      object_id: build.objectId,
      definition_id: build.definitionId,
      position: build.position,
      rotation: build.rotation,
      scale: build.scale,
      schema: 1,
      updated_at: new Date().toISOString(),
    }));
    const { error } = await this.client.from('grid_build_objects').insert(rows);
    if (error) throw error;
  }

  async loadBuilds(identity: PlayerIdentity, worldId:string, regionId:string):Promise<PersistedGridBuild[]> {
    const { data, error } = await this.client
      .from('grid_build_objects')
      .select('object_id,definition_id,position,rotation,scale')
      .eq('user_id', identity.id)
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

  async load(identity: PlayerIdentity) {
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
