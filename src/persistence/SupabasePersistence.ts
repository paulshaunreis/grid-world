import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { PersistedPlayerState } from '../core/Persistence';
import type { PlayerIdentity } from '../core/PlayerIdentity';

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
      ...state,
    });
    if (error) throw error;
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
