import type { SupabaseClient } from '@supabase/supabase-js';

export interface GridStarterGrantResult {
  ok:boolean;
  granted:boolean;
  currency_id?:string;
  amount?:number;
  remaining_reserve?:number;
  reason?:string;
}

export class GridOmniBankService {
  constructor(private readonly client:SupabaseClient) {}

  async claimStarterGrant():Promise<GridStarterGrantResult>{
    const {data,error}=await this.client.rpc('grid_claim_starter_currency');
    if(error) throw error;
    return data as GridStarterGrantResult;
  }

  async wallet(currencyId='grid'){
    const {data,error}=await this.client.from('grid_wallets').select('currency_id,balance,updated_at').eq('currency_id',currencyId).maybeSingle();
    if(error) throw error;
    return data;
  }
}
