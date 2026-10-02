import type { NPCProfileRecord } from '../world/NPCProfile';

const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c));

export interface GridProfileActions { onFriend?:()=>void; onFollow?:()=>void; onMessage?:()=>void; onPublicProfile?:()=>void; }

export function mountGridTargetProfile(){
  let root=document.getElementById('grid-target-profile');
  if(root) return root;
  root=document.createElement('section');
  root.id='grid-target-profile';
  root.className='grid-target-profile';
  root.innerHTML='<div class="grid-target-profile-card"><div class="grid-target-profile-actions"><button type="button" data-profile-action="friend">FRIEND</button><button type="button" data-profile-action="follow">FOLLOW</button><button type="button" data-profile-action="message">MESSAGE</button><button type="button" data-profile-action="public">PUBLIC PROFILE</button></div><button class="grid-target-profile-close" type="button">×</button><div class="grid-target-profile-kicker">GRID PROFILE</div><div class="grid-target-profile-identity"><div class="grid-target-profile-portrait"></div><div><div class="grid-target-profile-name"></div><div class="grid-target-profile-meta"></div></div></div><div class="grid-target-profile-bars"></div><div class="grid-target-profile-section"><b>TRAITS</b><div class="grid-target-profile-traits"></div></div><div class="grid-target-profile-section"><b>SKILLS</b><div class="grid-target-profile-skills"></div></div><div class="grid-target-profile-section"><b>RELATIONSHIPS</b><div class="grid-target-profile-relations"></div></div><div class="grid-target-profile-section"><b>CERTIFICATES</b><div class="grid-target-profile-certificates"></div></div></div>';
  document.body.appendChild(root);
  root.querySelector('.grid-target-profile-close')?.addEventListener('click',()=>root!.classList.remove('open'));
  return root;
}

export function showNPCProfile(profile:NPCProfileRecord, relationships:Array<{kind?:string;otherId?:string;affinity?:number;trust?:number}> = [], actions:GridProfileActions = {}){
  const root=mountGridTargetProfile();
  const set=(selector:string,value:string)=>{const el=root!.querySelector(selector);if(el)el.innerHTML=value;};
  // Deterministic varied portrait: initials on an id-hashed hue. Every NPC
  // reads as a distinct individual; no baked-in appearance assumptions.
  const seed = String((profile as {id?: unknown}).id ?? profile.displayName ?? '?');
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  const hue = hash % 360;
  const initials = profile.displayName.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
  set('.grid-target-profile-portrait',
    '<span style="background:conic-gradient(from ' + hue + 'deg,hsl(' + hue + ',65%,42%),hsl(' + ((hue + 50) % 360) + ',65%,30%),#0a1420">' + esc(initials) + '</span>');
  set('.grid-target-profile-name',esc(profile.displayName));
  set('.grid-target-profile-meta',esc(profile.role)+' · '+esc(profile.occupation.title)+' · LEVEL '+profile.level+' · '+esc(profile.world));
  const xp=Math.min(100,Math.round(profile.experience%100));
  set('.grid-target-profile-bars','<span>EXPERIENCE <i style="width:'+xp+'%"></i></span><span>SKILLS <i style="width:'+Math.min(100,Math.round(Object.values(profile.skills).reduce((a,b)=>a+b,0)*10))+'%"></i></span>');
  set('.grid-target-profile-traits',profile.traits.map(esc).join(' · ')||'UNSPECIFIED');
  const skills=Object.entries(profile.skills).map(([name,value])=>'<span>'+esc(name.toUpperCase())+' <b>'+Math.round(value)+'</b></span>').join('');
  set('.grid-target-profile-skills',skills||'NO RECORDED SKILLS');
  const certificates=(profile.certificates??[]).slice(0,8).map(c=>'<span>'+esc(c.title)+' · '+esc(c.issuer)+'</span>').join('');
  set('.grid-target-profile-certificates',certificates||'NO EARNED CERTIFICATES');
  const rel=relationships.slice(0,8).map(x=>'<span>'+esc(x.kind??'connection')+' · '+esc(x.otherId??'unknown')+'</span>').join('');
  set('.grid-target-profile-relations',rel||'NO RECORDED CONNECTIONS');
  const buttons=root.querySelectorAll<HTMLButtonElement>('[data-profile-action]'); buttons.forEach(button=>{ const kind=button.dataset.profileAction; button.onclick=()=>{ if(kind==='friend') actions.onFriend?.(); if(kind==='follow') actions.onFollow?.(); if(kind==='message') actions.onMessage?.(); if(kind==='public') actions.onPublicProfile?.(); }; });
  const actionsBox=root.querySelector<HTMLElement>('.grid-target-profile-actions'); if(actionsBox) actionsBox.style.display=actions.onFriend||actions.onFollow||actions.onMessage?'flex':'none';
  root.classList.add('open');
  return root;
}
