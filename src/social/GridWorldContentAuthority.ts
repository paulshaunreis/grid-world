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
    const { data, error } = await this.client.from('grid_world_content').upsert({
      world_id: snapshot.worldId,
      owner_user_id: auth.user.id,
      builds: snapshot.builds,
      terrain: snapshot.terrain,
      quests: snapshot.quests,
      consequences: snapshot.consequences,
      npc_state: snapshot.npcState,
      creature_state: snapshot.creatureState,
      metadata: snapshot.metadata ?? {},
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

