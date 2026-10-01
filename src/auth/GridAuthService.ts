import type { SupabaseClient } from '@supabase/supabase-js';

export interface GridAccountProfile {
  id:string;
  first_name:string;
  middle_name:string|null;
  last_name:string;
  handle:string;
  display_name:string;
  onboarding_complete:boolean;
  name_visibility:string;
}

export class GridAuthService {
  constructor(private readonly client: SupabaseClient) {}

  async currentUser(){
    const {data,error}=await this.client.auth.getUser();
    if(error && error.name!=='AuthSessionMissingError') throw error;
    return data.user;
  }

  async signUp(email:string,password:string){
    return this.client.auth.signUp({email:email.trim().toLowerCase(),password});
  }

  async signIn(email:string,password:string){
    return this.client.auth.signInWithPassword({email:email.trim().toLowerCase(),password});
  }

  async signOut(){ return this.client.auth.signOut({scope:'local'}); }

  async completeProfile(input:{firstName:string;middleName:string;lastName:string;handle:string;displayName:string;nameVisibility:string}){
    const {data,error}=await this.client.rpc('grid_complete_profile',{
      p_first_name:input.firstName,p_middle_name:input.middleName,p_last_name:input.lastName,
      p_handle:input.handle,p_display_name:input.displayName,p_name_visibility:input.nameVisibility,
    });
    if(error) throw error;
    return data;
  }

  async profile(){
    const user=await this.currentUser();
    if(!user) return null;
    const {data,error}=await this.client.from('profiles').select('id,first_name,middle_name,last_name,handle,display_name,onboarding_complete,name_visibility').eq('id',user.id).maybeSingle();
    if(error) throw error;
    return data as GridAccountProfile|null;
  }

  async claimStarterLand(worldId:string,parcelKey:string){
    const {data,error}=await this.client.rpc('grid_claim_starter_land',{p_world_id:worldId,p_parcel_key:parcelKey});
    if(error) throw error;
    return data;
  }

  async earnWorld(worldId:string){
    const {data,error}=await this.client.rpc('grid_earn_world_charter',{p_world_id:worldId});
    if(error) throw error;
    return data;
  }
}
