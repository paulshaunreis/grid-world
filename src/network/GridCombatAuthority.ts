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
  memories?: Array<Record<string,unknown>>;
  memory?: Record<string,unknown>;
  wallets?: Array<{user_id:string;currency_id:string;currency_code:string;currency_name:string;balance:number}>;
  transactions?: Array<Record<string,unknown>>;
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

  async walletRead(): Promise<CombatServerResult | null> {
    const { data, error } = await this.client.functions.invoke<CombatServerResult>('grid-combat', { body:{action:'wallet_read'} });
    if(error) throw error;
    return data;
  }

  async economicsRead(hours=24): Promise<CombatServerResult | null> {
    const { data, error } = await this.client.functions.invoke<CombatServerResult>('grid-combat', { body:{action:'economics_read',hours} });
    if(error) throw error;
    return data;
  }

  async ledgerRead(limit=25): Promise<CombatServerResult | null> {
    const { data, error } = await this.client.functions.invoke<CombatServerResult>('grid-combat', { body:{action:'ledger_read',limit} });
    if(error) throw error;
    return data;
  }

  async inventoryRead(): Promise<CombatServerResult | null> {
    const { data, error } = await this.client.functions.invoke<CombatServerResult>('grid-combat', { body:{action:'inventory_read'} });
    if(error) throw error;
    return data;
  }

  async gatherResource(resourceId:string): Promise<CombatServerResult | null> {
    const { data, error } = await this.client.functions.invoke<CombatServerResult>('grid-combat', { body:{action:'resource_gather',resourceId} });
    if(error) throw error;
    return data;
  }

  async craft(recipeId:string): Promise<CombatServerResult | null> {
    const { data, error } = await this.client.functions.invoke<CombatServerResult>('grid-combat', { body:{action:'craft',recipeId} });
    if(error) throw error;
    return data;
  }

  async marketQuote(world:string,item_id:string,amount=1): Promise<CombatServerResult | null> {
    const { data, error } = await this.client.functions.invoke<CombatServerResult>('grid-combat', { body:{action:'market_quote',world,item_id,amount} });
    if(error) throw error;
    return data;
  }

  async marketSell(world:string,item_id:string,amount=1): Promise<CombatServerResult | null> {
    const { data, error } = await this.client.functions.invoke<CombatServerResult>('grid-combat', { body:{action:'market_sell',world,item_id,amount} });
    if(error) throw error;
    return data;
  }

  async marketTick(): Promise<CombatServerResult | null> {
    const { data, error } = await this.client.functions.invoke<CombatServerResult>('grid-combat', { body:{action:'market_tick'} });
    if(error) throw error;
    return data;
  }

  async marketMerchants(): Promise<CombatServerResult | null> {
    const { data, error } = await this.client.functions.invoke<CombatServerResult>('grid-combat', { body:{action:'market_merchants'} });
    if(error) throw error;
    return data;
  }

  async vaultRead(): Promise<CombatServerResult | null> {
    const { data, error } = await this.client.functions.invoke<CombatServerResult>('grid-combat', { body:{action:'vault_read'} });
    if(error) throw error;
    return data;
  }

  async bazaarList(): Promise<CombatServerResult | null> {
    const { data, error } = await this.client.functions.invoke<CombatServerResult>('grid-combat', { body:{action:'bazaar_list'} });
    if(error) throw error;
    return data;
  }

  async bazaarCreate(world:string,item_id:string,amount:number,currency_id:string,unit_price:number): Promise<CombatServerResult | null> {
    const { data, error } = await this.client.functions.invoke<CombatServerResult>('grid-combat', { body:{action:'bazaar_create',world,item_id,amount,currency_id,unit_price} });
    if(error) throw error;
    return data;
  }

  async bazaarBuy(listing_id:string,amount=1): Promise<CombatServerResult | null> {
    const { data, error } = await this.client.functions.invoke<CombatServerResult>('grid-combat', { body:{action:'bazaar_buy',listing_id,amount} });
    if(error) throw error;
    return data;
  }

  async npcProfile(npc_id:string): Promise<CombatServerResult | null> {
    const { data, error } = await this.client.functions.invoke<CombatServerResult>('grid-combat', { body:{action:'npc_profile',npc_id} });
    if(error) throw error;
    return data;
  }

  async transmuteElement(recipe_id:string): Promise<CombatServerResult | null> {
    const { data, error } = await this.client.functions.invoke<CombatServerResult>('grid-combat', { body:{action:'transmute_element',recipe_id} });
    if(error) throw error;
    return data;
  }

  async npcMemoryRead(npcId:string, limit=12): Promise<CombatServerResult | null> {
    const { data, error } = await this.client.functions.invoke<CombatServerResult>('grid-combat', { body:{action:'npc_memory_read',npc_id:npcId,limit} });
    if(error) throw error;
    return data;
  }

  async npcMemoryWrite(memory:{npc_id:string;subject_type?:string;subject_id?:string;event_type?:string;summary:string;valence?:number;importance?:number;confidence?:number;visibility?:string}): Promise<CombatServerResult | null> {
    const { data, error } = await this.client.functions.invoke<CombatServerResult>('grid-combat', { body:{action:'npc_memory_write',...memory} });
    if(error) throw error;
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
