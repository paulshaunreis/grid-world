import type { SupabaseClient } from '@supabase/supabase-js';
import type { PlayerTransform } from '../core/PlayerController';

export type AuthoritativeCombatMode = 'PVE' | 'PVP' | 'SAFE';

export interface AuthoritativeCombatState {
  user_id: string;
  region_id: string;
  mode: AuthoritativeCombatMode;
  x: number;
  y: number;
  z: number;
  yaw: number;
  health: number;
  max_health: number;
  last_attack_at: string | null;
  updated_at: string;
}

export interface CombatServerResult {
  ok: boolean;
  action: string;
  zone?: 'SAFE' | 'PVP_ARENA' | 'PVE';
  mode?: AuthoritativeCombatMode;
  state?: AuthoritativeCombatState;
  attacker?: AuthoritativeCombatState;
  target?: AuthoritativeCombatState;
  targetId?: string;
  damage?: number;
  defeated?: boolean;
  accepted?: boolean;
  error?: string;
  retryAfterMs?: number;
  range?: number;
}

export class GridCombatAuthority {
  private syncInFlight = false;
  private attackInFlight = false;

  constructor(private readonly client: SupabaseClient) {}

  async sync(transform: PlayerTransform, regionId = 'first-light'): Promise<CombatServerResult | null> {
    if (this.syncInFlight) return null;
    this.syncInFlight = true;
    try {
      const { data, error } = await this.client.functions.invoke<CombatServerResult>('grid-combat', {
        body: { action: 'sync', transform, regionId },
      });
      if (error) throw error;
      return data;
    } finally {
      this.syncInFlight = false;
    }
  }

  async setMode(mode: AuthoritativeCombatMode): Promise<CombatServerResult | null> {
    const { data, error } = await this.client.functions.invoke<CombatServerResult>('grid-combat', {
      body: { action: 'set_mode', mode },
    });
    if (error) throw error;
    return data;
  }

  async attack(targetId: string): Promise<CombatServerResult | null> {
    if (this.attackInFlight) return null;
    this.attackInFlight = true;
    try {
      const { data, error } = await this.client.functions.invoke<CombatServerResult>('grid-combat', {
        body: { action: 'attack', targetId },
      });
      if (error) {
        const response = (error as { context?: Response }).context;
        if (response) {
          try { return await response.json() as CombatServerResult; } catch { /* fall through */ }
        }
        throw error;
      }
      return data;
    } finally {
      this.attackInFlight = false;
    }
  }

  async state(): Promise<CombatServerResult | null> {
    const { data, error } = await this.client.functions.invoke<CombatServerResult>('grid-combat', {
      body: { action: 'state' },
    });
    if (error) throw error;
    return data;
  }
}
