import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import type { PlayerIdentity } from '../core/PlayerIdentity';
import type { PlayerTransform } from '../core/PlayerController';
import type { PresenceCallbacks, RemotePlayerState } from './Presence';

interface PresencePayload {
  id: string;
  displayName: string;
  avatarStyle: 'azure' | 'sunset' | 'forest' | 'violet';
  x: number;
  y: number;
  z: number;
  yaw: number;
  updatedAt: number;
}

export class SupabasePresence {
  private channel?: RealtimeChannel;
  private readonly remote = new Map<string, RemotePlayerState>();

  constructor(
    private readonly client: SupabaseClient,
    private identity: PlayerIdentity,
    private readonly callbacks: PresenceCallbacks,
    private readonly regionId = 'first-light',
  ) {}

  setIdentity(identity: PlayerIdentity) { this.identity = identity; }

  async connect(initialTransform: PlayerTransform) {
    this.callbacks.onStatus?.('CONNECTING');
    this.channel = this.client.channel(`region:${this.regionId}`, {
      config: { presence: { key: this.identity.id } },
    });

    this.channel.on('presence', { event: 'sync' }, () => {
      const state = this.channel!.presenceState<PresencePayload>();
      const seen = new Set<string>();

      for (const [key, entries] of Object.entries(state)) {
        const entry = entries[0];
        if (!entry || key === this.identity.id) continue;
        const player: RemotePlayerState = {
          id: key,
          displayName: entry.displayName,
          avatarStyle: entry.avatarStyle ?? 'azure',
          x: entry.x, y: entry.y, z: entry.z, yaw: entry.yaw, updatedAt: entry.updatedAt,
        };
        seen.add(key);
        if (this.remote.has(key)) this.callbacks.onUpdate?.(player);
        else this.callbacks.onJoin?.(player);
        this.remote.set(key, player);
      }

      for (const id of [...this.remote.keys()]) {
        if (!seen.has(id)) {
          this.remote.delete(id);
          this.callbacks.onLeave?.(id);
        }
      }
    });

    this.channel.on('presence', { event: 'join' }, ({ newPresences }) => {
      for (const entry of newPresences as unknown as PresencePayload[]) {
        if (entry.id === this.identity.id) continue;
        const player: RemotePlayerState = { ...entry, avatarStyle: entry.avatarStyle ?? 'azure' };
        this.remote.set(player.id, player);
        this.callbacks.onJoin?.(player);
      }
    });

    this.channel.on('presence', { event: 'leave' }, ({ leftPresences }) => {
      for (const entry of leftPresences as unknown as PresencePayload[]) {
        if (this.remote.delete(entry.id)) this.callbacks.onLeave?.(entry.id);
      }
    });

    return new Promise<void>((resolve, reject) => {
      this.channel!.subscribe(async (status, error) => {
        if (status === 'SUBSCRIBED') {
          try {
            await this.update(initialTransform);
            this.callbacks.onStatus?.('CONNECTED');
            resolve();
          } catch (trackError) {
            this.callbacks.onStatus?.('ERROR', trackError);
            reject(trackError);
          }
        } else if (status === 'CHANNEL_ERROR') {
          this.callbacks.onStatus?.('ERROR', error);
          reject(error ?? new Error(status));
        } else if (status === 'TIMED_OUT') {
          this.callbacks.onStatus?.('TIMED_OUT', error);
          reject(error ?? new Error(status));
        }
      });
    });
  }

  async update(transform: PlayerTransform) {
    if (!this.channel) return;
    await this.channel.track({
      id: this.identity.id,
      displayName: this.identity.displayName,
      avatarStyle: this.identity.avatarStyle,
      ...transform,
      updatedAt: Date.now(),
    } satisfies PresencePayload);
  }

  async disconnect() {
    if (this.channel) {
      await this.client.removeChannel(this.channel);
      this.channel = undefined;
    }
  }
}
