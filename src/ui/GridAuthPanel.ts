import type { GridAuthService, GridAccountProfile } from '../auth/GridAuthService';
import { mountAvatarCreator, type AvatarSelection } from './GridAvatarCreator';

export function mountGridAuthPanel(auth:GridAuthService,onProfile:(profile:GridAccountProfile)=>void,onAvatar?:(selection:AvatarSelection)=>void){
  const root=document.createElement('section'); root.className='grid-auth-overlay';
  root.innerHTML='<div class="grid-auth-card grid-auth-card-wide"><button class="grid-auth-close" type="button">×</button><div class="grid-auth-kicker">GRID WORLD IDENTITY</div><h2>JOIN THE GRID</h2><p class="grid-auth-note">Create your account, define your identity, then choose your starter avatar before entering the living world.</p><div class="grid-auth-tabs"><button data-mode="login">LOGIN</button><button data-mode="join">JOIN</button><button data-mode="profile">PROFILE</button></div><div class="grid-auth-body"></div><div class="grid-auth-status"></div></div>';
  document.body.appendChild(root);
  const body=root.querySelector<HTMLDivElement>('.grid-auth-body')!,status=root.querySelector<HTMLDivElement>('.grid-auth-status')!;
  let mode='login';
  let cleanupAvatar:(()=>void)|null=null;

  function closeAvatar(){cleanupAvatar?.();cleanupAvatar=null;}
  function render(){
    closeAvatar();
    if(mode==='login') body.innerHTML='<label>Email<input id="ga-email" type="email" autocomplete="email"></label><label>Password<input id="ga-password" type="password" autocomplete="current-password"></label><button class="grid-auth-primary" id="ga-submit">LOGIN</button><button class="grid-auth-secondary" id="ga-reset">SEND PASSWORD RESET</button><p>Passwords are handled by Supabase Auth, not Grid World.</p>';
    else if(mode==='join') body.innerHTML='<label>Email<input id="ga-email" type="email" autocomplete="email"></label><label>Password<input id="ga-password" type="password" minlength="12" autocomplete="new-password"></label><p class="grid-auth-note">Use a unique password of at least 12 characters. Email confirmation is part of the production join flow.</p><button class="grid-auth-primary" id="ga-submit">CREATE ACCOUNT</button>';
    else if(mode==='avatar') {
      body.innerHTML='<div id="grid-avatar-host"></div>';
      const host=body.querySelector<HTMLDivElement>('#grid-avatar-host')!;
      const initial:AvatarSelection={style:'navigator',customization:{skin:0,hair:0,eyes:0,build:0,accent:0}};
      void auth.profile().then(p=>{
        if(p){ initial.style=p.avatar_style??initial.style; initial.customization={...initial.customization,...(p.avatar_customization??{})}; }
        cleanupAvatar=mountAvatarCreator(host,initial,async selection=>{
          status.textContent='Saving your avatar…';
          try{
            await auth.saveAvatar(selection);
            onAvatar?.(selection);
            const p=await auth.profile();
            if(p) onProfile(p);
            const grant=await auth.ensureStarterGrant();
            status.textContent=(grant as any)?.granted ? 'Avatar secured · 100 GRID + starter inventory issued.' : 'Avatar secured · starter package already claimed.';
            mode='profile'; render();
          }catch(e){status.textContent=e instanceof Error?e.message:'Avatar could not be saved.';}
        });
      });
    } else body.innerHTML='<div class="grid-name-grid"><label>First name<input id="ga-first" maxlength="60"></label><label>Middle name <small>optional</small><input id="ga-middle" maxlength="60"></label><label>Last name<input id="ga-last" maxlength="60"></label><label>Handle <small>3–32 chars</small><input id="ga-handle" maxlength="32" placeholder="yourname"></label><label>Display name<input id="ga-display" maxlength="80"></label><label>Name visibility<select id="ga-vis"><option value="display_only">Display name only</option><option value="public">Full name public</option><option value="private">Full name private</option></select></label></div><p class="grid-auth-note">Handles are globally unique. If one is taken, choose another handle; display names may be shared.</p><button class="grid-auth-primary" id="ga-profile">SAVE PROFILE & CHOOSE AVATAR</button><div class="grid-land-actions"><select id="ga-world"><option>HARBOR</option><option>GARDENS</option><option>ARTS</option><option>CITADEL</option><option>WILDS</option><option>SKYROOT</option></select><button id="ga-land">CLAIM FREE STARTER LAND</button><button id="ga-charter">EARN A WORLD CHARTER</button><button id="ga-starter">CLAIM OMNI BANK STARTER</button><button id="ga-signout">SIGN OUT</button></div>';

    const submit=body.querySelector<HTMLButtonElement>('#ga-submit');
    if(submit) submit.onclick=async()=>{
      status.textContent='Working…';
      try{
        if(mode==='login'){
          const r=await auth.signIn((body.querySelector<HTMLInputElement>('#ga-email')!).value,(body.querySelector<HTMLInputElement>('#ga-password')!).value);
          if(r.error) throw r.error;
          if(!r.data.user){status.textContent='Check your credentials.';return;}
          const p=await auth.profile();
          if(p){onProfile(p); mode=p.onboarding_complete?'avatar':'profile'; render(); if(p.onboarding_complete) status.textContent='Choose or update your avatar before entering the Grid.';}
        }else{
          const r=await auth.signUp((body.querySelector<HTMLInputElement>('#ga-email')!).value,(body.querySelector<HTMLInputElement>('#ga-password')!).value);
          if(r.error) throw r.error;
          status.textContent=r.data.session?'Account created. Complete your identity, then choose your avatar.':'Account created. Check your email to confirm it, then log in.';
          mode=r.data.session?'profile':'login';render();
        }
      }catch(e){status.textContent=e instanceof Error?e.message:'Authentication failed.';}
    };

    const reset=body.querySelector<HTMLButtonElement>('#ga-reset');
    if(reset) reset.onclick=async()=>{try{const email=(body.querySelector<HTMLInputElement>('#ga-email')!).value;const r=await auth.resetPassword(email);if(r.error)throw r.error;status.textContent='Password reset email requested.';}catch(e){status.textContent=e instanceof Error?e.message:'Password reset request failed.';}};

    const signout=body.querySelector<HTMLButtonElement>('#ga-signout');
    if(signout) signout.onclick=async()=>{const r=await auth.signOut();if(r.error){status.textContent=r.error.message;return;}status.textContent='Signed out.';root.classList.remove('open');};

    const save=body.querySelector<HTMLButtonElement>('#ga-profile');
    if(save) save.onclick=async()=>{
      status.textContent='Saving identity…';
      try{
        await auth.completeProfile({firstName:(body.querySelector<HTMLInputElement>('#ga-first')!).value,middleName:(body.querySelector<HTMLInputElement>('#ga-middle')!).value,lastName:(body.querySelector<HTMLInputElement>('#ga-last')!).value,handle:(body.querySelector<HTMLInputElement>('#ga-handle')!).value,displayName:(body.querySelector<HTMLInputElement>('#ga-display')!).value,nameVisibility:(body.querySelector<HTMLSelectElement>('#ga-vis')!).value});
        const p=await auth.profile();
        if(p) onProfile(p);
        mode='avatar'; render();
      }catch(e){status.textContent=e instanceof Error?e.message:'Profile update rejected.';}
    };

    const land=body.querySelector<HTMLButtonElement>('#ga-land');
    if(land) land.onclick=async()=>{try{await auth.claimFirstStarterLand((body.querySelector<HTMLSelectElement>('#ga-world')!).value);status.textContent='Starter land secured.';}catch(e){status.textContent=e instanceof Error?e.message:'Starter land claim failed.';}};
    const charter=body.querySelector<HTMLButtonElement>('#ga-charter');
    if(charter) charter.onclick=async()=>{try{await auth.earnWorld((body.querySelector<HTMLSelectElement>('#ga-world')!).value);status.textContent='World charter request submitted.';}catch(e){status.textContent=e instanceof Error?e.message:'World charter unavailable yet.';}};
    const starter=body.querySelector<HTMLButtonElement>('#ga-starter');
    if(starter) starter.onclick=async()=>{try{const g=await auth.ensureStarterGrant();status.textContent=(g as any)?.granted?'100 GRID + starter inventory secured.':'Starter package already secured.';}catch(e){status.textContent=e instanceof Error?e.message:'Starter package unavailable.';}};
  }

  root.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.mode!;render();});
  root.querySelector<HTMLButtonElement>('.grid-auth-close')!.onclick=()=>{closeAvatar();root.classList.remove('open');};
  render();
  async function open(next='login'){
    const p=await auth.profile().catch(()=>null);
    mode=next;
    if(p?.onboarding_complete && next==='login') mode='avatar';
    root.classList.add('open');render();
    if(mode==='profile'&&p){
      (body.querySelector<HTMLInputElement>('#ga-first')!).value=p.first_name??'';
      (body.querySelector<HTMLInputElement>('#ga-middle')!).value=p.middle_name??'';
      (body.querySelector<HTMLInputElement>('#ga-last')!).value=p.last_name??'';
      (body.querySelector<HTMLInputElement>('#ga-handle')!).value=(p.handle??'').replace(/^@/,'');
      (body.querySelector<HTMLInputElement>('#ga-display')!).value=p.display_name??'';
      (body.querySelector<HTMLSelectElement>('#ga-vis')!).value=p.name_visibility??'display_only';
    }
  }
  return {open,close:()=>{closeAvatar();root.classList.remove('open');}};
}
