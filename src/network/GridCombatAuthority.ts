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

export interface AuthoritativeCreatureState {
  creature_id:string;
  species:string;
  world:string;
  x:number;
  y:number;
  z:number;
  health:number;
  max_health:number;
  last_attack_at:string|null;
  respawn_at:string|null;
  updated_at:string;
  ai_state?: 'ROAM'|'PURSUIT'|'ATTACK';
  target_user_id?: string | null;
  last_ai_at?: string | null;
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
  allowed?: boolean;
  error?: string;
  retryAfterMs?: number;
  range?: number;
  creatures?: AuthoritativeCreatureState[];
  creature?: AuthoritativeCreatureState;
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

  async syncCreatures(creatures:Array<{id:string;species:string;x:number;y:number;z:number}>): Promise<CombatServerResult | null> {
    const { data, error } = await this.client.functions.invoke<CombatServerResult>('grid-combat', {
      body: { action:'sync_creatures', creatures },
    });
    if (error) throw error;
    return data;
  }

  async creatureState(creatureIds:string[]): Promise<CombatServerResult | null> {
    const { data, error } = await this.client.functions.invoke<CombatServerResult>('grid-combat', {
      body: { action:'creature_state', creatureIds },
    });
    if (error) throw error;
    return data;
  }

  async tickCreatures(): Promise<CombatServerResult | null> {
    const { data, error } = await this.client.functions.invoke<CombatServerResult>('grid-combat', {
      body: { action:'tick_creatures' },
    });
    if (error) throw error;
    return data;
  }

  async attackCreature(creatureId:string): Promise<CombatServerResult | null> {
    if (this.attackInFlight) return null;
    this.attackInFlight = true;
    try {
      const { data, error } = await this.client.functions.invoke<CombatServerResult>('grid-combat', {
        body: { action:'attack_creature', creatureId },
      });
      if (error) {
        const response = (error as { context?: Response }).context;
        if (response) { try { return await response.json() as CombatServerResult; } catch { /* fall through */ } }
        throw error;
      }
      return data;
    } finally {
      this.attackInFlight = false;
    }
  }

  async creatureAttack(creatureId:string): Promise<CombatServerResult | null> {
    const { data, error } = await this.client.functions.invoke<CombatServerResult>('grid-combat', {
      body: { action:'creature_attack', creatureId },
    });
    if (error) {
      const response = (error as { context?: Response }).context;
      if (response) { try { return await response.json() as CombatServerResult; } catch { /* fall through */ } }
      throw error;
    }
    return data;
  }

  async state(): Promise<CombatServerResult | null> {
    const { data, error } = await this.client.functions.invoke<CombatServerResult>('grid-combat', {
      body: { action: 'state' },
    });
    if (error) throw error;
    return data;
  }
}
