import type { SupabaseClient } from '@supabase/supabase-js';
import type { AvatarCustomization, AvatarSelection } from '../ui/GridAvatarCreator';

// Profile-system boundary (Phase 1, plan §F16 — decision, not a rewrite):
//   `profiles` = ACCOUNT identity (auth, handle, onboarding, avatar, beta).
//   Written only via the signup RPC (grid_complete_signup) and account
//   settings. `grid_user_profiles` = PUBLIC citizen profile (display, bio,
//   theme, mood), written only via grid_profile_upsert / GridProfileAuthority.
//   Do not cross the boundary: account writes never go to grid_user_profiles
//   and public-profile writes never go to profiles.

export interface GridAccountProfile {
  id:string;
  first_name:string;
  middle_name:string|null;
  last_name:string;
  handle:string;
  display_name:string;
  onboarding_complete:boolean;
  name_visibility:string;
  avatar_style: AvatarSelection['style'];
  avatar_customization: AvatarCustomization;
  avatar_ready:boolean;
  account_created_at:string;
}

export class GridAuthService {
  constructor(private readonly client: SupabaseClient) {}

  async currentUser(){
    const {data,error}=await this.client.auth.getUser();
    if(error && error.name!=='AuthSessionMissingError') throw error;
    return data.user;
  }

  async signUp(email:string,password:string,redirectTo?:string){
    return this.client.auth.signUp({
      email:email.trim().toLowerCase(),
      password,
      options: redirectTo ? {emailRedirectTo:redirectTo} : undefined,
    });
  }

  async signIn(email:string,password:string){
    return this.client.auth.signInWithPassword({email:email.trim().toLowerCase(),password});
  }

  // Global scope revokes all refresh tokens — a real sign-out. The old
  // 'local' scope only cleared the browser session and left the server-side
  // refresh token valid. Signing out signs out everywhere (see account.ts).
  async signOut(){ return this.client.auth.signOut({scope:'global'}); }

  // All password-reset emails point at /reset.html, the only page that
  // completes a reset (set-new-password form -> updateUser). The site root
  // and /enter.html have no recovery handling — never redirect there.
  async resetPassword(email:string){ return this.client.auth.resetPasswordForEmail(email.trim().toLowerCase(),{redirectTo:`${window.location.origin}/reset.html`}); }

  async claimStarterGrant(){ const {data,error}=await this.client.rpc('grid_claim_starter_currency'); if(error) throw error; return data; }

  async ensureStarterGrant(){ return this.claimStarterGrant(); }

  async saveAvatar(selection:AvatarSelection){
    const {data,error}=await this.client.rpc('grid_save_avatar_appearance',{p_style:selection.style,p_customization:selection.customization});
    if(error) throw error;
    return data;
  }

  async completeProfile(input:{firstName:string;middleName:string;lastName:string;handle:string;displayName:string;nameVisibility:string}){
    const {data,error}=await this.client.rpc('grid_complete_profile',{
      p_first_name:input.firstName,p_middle_name:input.middleName,p_last_name:input.lastName,
      p_handle:input.handle,p_display_name:input.displayName,p_name_visibility:input.nameVisibility,
    });
    if(error) throw error;
    return data;
  }

  /**
   * Complete signup atomically (Phase 1 §F2). One SECURITY DEFINER RPC writes
   * profiles + private_profiles + grid_security_questions (v2 bcrypt) in a
   * single transaction — any failure rolls everything back, so a failed
   * signup never leaves a partial account. The caller keeps its pending
   * payload and offers retry on failure. The starter grant stays best-effort
   * OUTSIDE this RPC (see ensureStarterGrant).
   */
  async completeSignup(input:{
    handle:string; displayName:string;
    firstName:string; middleName:string; lastName:string; nameVisibility:string;
    language:string; avatarStyle:string; avatarCustomization?:AvatarCustomization|null;
    firstNameIrl:string; lastNameIrl:string; countryCode:string; dob:string;
    q1Text:string; q1Answer:string; q2Text:string; q2Answer:string;
    q3Text:string; q3Answer:string;
  }){
    const {data,error}=await this.client.rpc('grid_complete_signup',{
      p_handle:input.handle,
      p_display_name:input.displayName,
      p_first_name:input.firstName,
      p_middle_name:input.middleName,
      p_last_name:input.lastName,
      p_name_visibility:input.nameVisibility,
      p_language:input.language,
      p_avatar_style:input.avatarStyle,
      p_avatar_customization:input.avatarCustomization ?? null,
      p_first_name_irl:input.firstNameIrl,
      p_last_name_irl:input.lastNameIrl,
      p_country_code:input.countryCode,
      p_date_of_birth:input.dob || null,
      p_q1_text:input.q1Text, p_q1_answer:input.q1Answer,
      p_q2_text:input.q2Text, p_q2_answer:input.q2Answer,
      p_q3_text:input.q3Text, p_q3_answer:input.q3Answer,
    });
    if(error) throw error;
    return data;
  }

  /**
   * Live handle-availability check (Phase 1 §F9 step 4). Debounced, on-blur
   * only — never per keystroke. Returns true when no account holds the
   * handle (case-insensitive via handle_normalized).
   */
  async checkHandleAvailable(handle:string):Promise<boolean>{
    const {data,error}=await this.client.rpc('grid_handle_available',{p_handle:handle});
    if(error) throw error;
    return data === true;
  }

  async profile(){
    const user=await this.currentUser();
    if(!user) return null;
    const {data,error}=await this.client.from('profiles').select('id,first_name,middle_name,last_name,handle,display_name,onboarding_complete,name_visibility,avatar_style,avatar_customization,avatar_ready,account_created_at').eq('id',user.id).maybeSingle();
    if(error) throw error;
    return data as GridAccountProfile|null;
  }

  async claimFirstStarterLand(worldId:string){ const {data,error}=await this.client.rpc('grid_claim_first_starter_land',{p_world_id:worldId}); if(error) throw error; return data; }

  async claimStarterLand(worldId:string,parcelKey:string){
    const {data,error}=await this.client.rpc('grid_claim_starter_land',{p_world_id:worldId,p_parcel_key:parcelKey});
    if(error) throw error;
    return data;
  }

  async claimEarnedLand(worldId:string,parcelKey:string){ const {data,error}=await this.client.rpc('grid_claim_earned_land',{p_world_id:worldId,p_parcel_key:parcelKey}); if(error) throw error; return data; }

  async earnWorld(worldId:string){
    const {data,error}=await this.client.rpc('grid_earn_world_charter',{p_world_id:worldId});
    if(error) throw error;
    return data;
  }
}
