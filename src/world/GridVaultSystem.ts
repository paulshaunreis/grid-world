import type { SupabaseClient } from '@supabase/supabase-js';

export interface GridVaultItem { item_id:string; quantity:number; mined_quantity:number; updated_at:string; }

export class GridVaultSystem {
  constructor(private readonly client?:SupabaseClient){}
  async read():Promise<GridVaultItem[]>{
    if(!this.client) return [];
    const {data,error}=await this.client.from('grid_vault_inventory').select('item_id,quantity,mined_quantity,updated_at').order('item_id');
    if(error) return [];
    return data??[];
  }
  async inventory():Promise<Array<{item_id:string;quantity:number}>>{
    if(!this.client) return [];
    const {data,error}=await this.client.functions.invoke('grid-combat',{body:{action:'inventory_read'}});
    if(error) return [];
    return ((data as {inventory?:Array<{item_id:string;quantity:number}>}|null)?.inventory??[]);
  }
}
