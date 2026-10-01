import type { SupabaseClient } from '@supabase/supabase-js';

export class GridBarterService {
  constructor(private readonly client: SupabaseClient) {}

  async createOffer(worldId:string, offerItemId:string, offerQuantity:number, wantItemId:string, wantQuantity:number){
    const {data,error}=await this.client.rpc('grid_barter_create_offer',{
      p_world_id:worldId,p_offer_item_id:offerItemId,p_offer_quantity:offerQuantity,
      p_want_item_id:wantItemId,p_want_quantity:wantQuantity
    });
    if(error) throw error;
    return data;
  }

  async acceptOffer(offerId:string){
    const {data,error}=await this.client.rpc('grid_barter_accept',{p_offer_id:offerId});
    if(error) throw error;
    return data;
  }

  async openOffers(){
    const {data,error}=await this.client.from('grid_barter_offers')
      .select('id,world_id,seller_user_id,offer_item_id,offer_quantity,want_item_id,want_quantity,created_at')
      .eq('status','OPEN').order('created_at',{ascending:false});
    if(error) throw error;
    return data ?? [];
  }
}
