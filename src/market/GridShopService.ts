import type { SupabaseClient } from '@supabase/supabase-js';
export class GridShopService{
 constructor(private readonly client:SupabaseClient){}
 async mine(){const {data,error}=await this.client.from('grid_shops').select('*').order('created_at',{ascending:false});if(error)throw error;return data??[];}
 async create(input:{id:string;owner_id:string;name:string;slug:string;shop_type:string;description?:string}){const {data,error}=await this.client.from('grid_shops').insert(input).select().single();if(error)throw error;return data;}
 async updateAppearance(id:string,appearance:Record<string,unknown>){const {data,error}=await this.client.from('grid_shops').update({appearance,updated_at:new Date().toISOString()}).eq('id',id).select().single();if(error)throw error;return data;}
 async publicShop(slug:string){const {data,error}=await this.client.from('grid_shops').select('*,grid_shop_listings(*)').eq('slug',slug).maybeSingle();if(error)throw error;return data;}
}