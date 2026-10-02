import type { SupabaseClient } from '@supabase/supabase-js';

export interface GridWorldContentSnapshot {
  worldId: string;
  builds: Array<Record<string, unknown>>;
  terrain: string[];
  quests: Record<string, unknown>;
  consequences: Record<string, unknown>;
  npcState: Array<Record<string, unknown>>;
  creatureState: Array<Record<string, unknown>>;
  metadata?: Record<string, unknown>;
}

export class GridWorldContentAuthority {
  constructor(private readonly client: SupabaseClient) {}

  async load(worldId: string): Promise<GridWorldContentSnapshot | null> {
    const { data, error } = await this.client.from('grid_world_content')
      .select('world_id,builds,terrain,quests,consequences,npc_state,creature_state,metadata')
      .eq('world_id', worldId).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      worldId: String(data.world_id),
      builds: Array.isArray(data.builds) ? data.builds as Array<Record<string, unknown>> : [],
      terrain: Array.isArray(data.terrain) ? data.terrain.map(String) : [],
      quests: (data.quests && typeof data.quests === 'object' ? data.quests : {}) as Record<string, unknown>,
      consequences: (data.consequences && typeof data.consequences === 'object' ? data.consequences : {}) as Record<string, unknown>,
      npcState: Array.isArray(data.npc_state) ? data.npc_state as Array<Record<string, unknown>> : [],
      creatureState: Array.isArray(data.creature_state) ? data.creature_state as Array<Record<string, unknown>> : [],
      metadata: (data.metadata && typeof data.metadata === 'object' ? data.metadata : {}) as Record<string, unknown>,
    };
  }

  async getRole(worldId: string): Promise<'owner'|'viewer'|'builder'|'editor'|'admin'|null> {
    const { data: auth } = await this.client.auth.getUser();
    if (!auth.user) return null;
    const { data: world, error: worldError } = await this.client.from('grid_worlds').select('owner_user_id').eq('id', worldId).maybeSingle();
    if (worldError) throw worldError;
    if (world?.owner_user_id === auth.user.id) return 'owner';
    const { data, error } = await this.client.from('grid_world_collaborators').select('role').eq('world_id', worldId).eq('user_id', auth.user.id).maybeSingle();
    if (error) throw error;
    return (data?.role as 'viewer'|'builder'|'editor'|'admin'|undefined) ?? null;
  }

  async listCollaborators(worldId: string): Promise<Array<{userId:string;role:'viewer'|'builder'|'editor'|'admin'}>> {
    const { data, error } = await this.client.from('grid_world_collaborators')
      .select('user_id,role').eq('world_id', worldId).order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(row => ({
      userId: String(row.user_id),
      role: row.role as 'viewer'|'builder'|'editor'|'admin',
    }));
  }

  async setCollaboratorRole(worldId: string, userId: string, role: 'viewer'|'builder'|'editor'|'admin') {
    const { data: auth } = await this.client.auth.getUser();
    if (!auth.user) return false;
    const { data: world, error: worldError } = await this.client.from('grid_worlds').select('owner_user_id').eq('id', worldId).maybeSingle();
    if (worldError) throw worldError;
    if (world?.owner_user_id !== auth.user.id) return false;
    const { error } = await this.client.from('grid_world_collaborators').upsert({ world_id: worldId, user_id: userId, role }, { onConflict: 'world_id,user_id' });
    if (error) throw error;
    return true;
  }

  async removeCollaborator(worldId: string, userId: string) {
    const { data: auth } = await this.client.auth.getUser();
    if (!auth.user) return false;
    const { data: world, error: worldError } = await this.client.from('grid_worlds').select('owner_user_id').eq('id', worldId).maybeSingle();
    if (worldError) throw worldError;
    if (world?.owner_user_id !== auth.user.id) return false;
    const { error } = await this.client.from('grid_world_collaborators').delete().eq('world_id', worldId).eq('user_id', userId);
    if (error) throw error;
    return true;
  }

  async loadPlayerState(worldId: string): Promise<GridWorldPlayerState | null> {
    const { data: auth } = await this.client.auth.getUser();
    if (!auth.user) return null;
    const { data, error } = await this.client.from('grid_world_player_state')
      .select('world_id,user_id,quests,discoveries,metadata')
      .eq('world_id', worldId).eq('user_id', auth.user.id).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      worldId: String(data.world_id),
      userId: String(data.user_id),
      quests: (data.quests && typeof data.quests === 'object' ? data.quests : {}) as Record<string, unknown>,
      discoveries: Array.isArray(data.discoveries) ? data.discoveries.map(String) : [],
      metadata: (data.metadata && typeof data.metadata === 'object' ? data.metadata : {}) as Record<string, unknown>,
    };
  }

  async savePlayerState(worldId: string, quests: Record<string, unknown>, discoveries: string[], metadata: Record<string, unknown> = {}) {
    const { data: auth } = await this.client.auth.getUser();
    if (!auth.user) return null;
    const { data, error } = await this.client.from('grid_world_player_state').upsert({
      world_id: worldId,
      user_id: auth.user.id,
      quests,
      discoveries,
      metadata,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'world_id,user_id' }).select('world_id,updated_at').single();
    if (error) throw error;
    return data;
  }

  async save(snapshot: GridWorldContentSnapshot) {
    const { data: auth } = await this.client.auth.getUser();
    if (!auth.user) return null;
    const { data: world, error: worldError } = await this.client.from('grid_worlds').select('owner_user_id').eq('id', snapshot.worldId).maybeSingle();
    if (worldError) throw worldError;
    if (!world?.owner_user_id) return null;
    const role = await this.getRole(snapshot.worldId);
    if (!role || role === 'viewer') return null;

    // Builders are allowed to persist their own builds, but they must not be able
    // to replace the entire shared world snapshot. Merge only their owned build
    // records into the authoritative snapshot and preserve every other field.
    let payload = snapshot;
    if (role === 'builder' && auth.user.id !== world.owner_user_id) {
      const current = await this.load(snapshot.worldId);
      const incomingOwned = snapshot.builds.filter(build => String(build.ownerUserId ?? '') === auth.user!.id);
      const incomingIds = new Set(incomingOwned.map(build => String(build.objectId ?? '')));
      const preservedOtherOwners = (current?.builds ?? []).filter(build => {
        const owner = String(build.ownerUserId ?? '');
        return owner !== auth.user!.id && !incomingIds.has(String(build.objectId ?? ''));
      });
      payload = {
        worldId: snapshot.worldId,
        builds: [...preservedOtherOwners, ...incomingOwned],
        terrain: current?.terrain ?? snapshot.terrain,
        quests: current?.quests ?? snapshot.quests,
        consequences: current?.consequences ?? snapshot.consequences,
        npcState: current?.npcState ?? snapshot.npcState,
        creatureState: current?.creatureState ?? snapshot.creatureState,
        metadata: current?.metadata ?? snapshot.metadata ?? {},
      };
    }

    const { data, error } = await this.client.from('grid_world_content').upsert({
      world_id: payload.worldId,
      owner_user_id: world.owner_user_id,
      builds: payload.builds,
      terrain: payload.terrain,
      quests: payload.quests,
      consequences: payload.consequences,
      npc_state: payload.npcState,
      creature_state: payload.creatureState,
      metadata: payload.metadata ?? {},
      updated_at: new Date().toISOString(),
    }, { onConflict: 'world_id' }).select('world_id,updated_at').single();
    if (error) throw error;
    return data;
  }
}

export interface GridWorldPlayerState {
  worldId: string;
  userId: string;
  quests: Record<string, unknown>;
  discoveries: string[];
  metadata?: Record<string, unknown>;
}
