import type { NPCProfileRecord } from '../world/NPCProfile';

const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c));

export interface GridProfileActions { onFriend?:()=>void; onFollow?:()=>void; onMessage?:()=>void; onPublicProfile?:()=>void; }

export function mountGridTargetProfile(){
  let root=document.getElementById('grid-target-profile');
  if(root) return root;
  root=document.createElement('section');
  root.id='grid-target-profile';
  root.className='grid-target-profile';
  root.innerHTML='<div class="grid-target-profile-card"><div class="grid-target-profile-actions"><button type="button" data-profile-action="friend">FRIEND</button><button type="button" data-profile-action="follow">FOLLOW</button><button type="button" data-profile-action="message">MESSAGE</button><button type="button" data-profile-action="public">PUBLIC PROFILE</button></div><button class="grid-target-profile-close" type="button">×</button><div class="grid-target-profile-kicker">GRID PROFILE</div><div class="grid-target-profile-name"></div><div class="grid-target-profile-meta"></div><div class="grid-target-profile-bars"></div><div class="grid-target-profile-section"><b>TRAITS</b><div class="grid-target-profile-traits"></div></div><div class="grid-target-profile-section"><b>SKILLS</b><div class="grid-target-profile-skills"></div></div><div class="grid-target-profile-section"><b>RELATIONSHIPS</b><div class="grid-target-profile-relations"></div></div></div>';
  document.body.appendChild(root);
  root.querySelector('.grid-target-profile-close')?.addEventListener('click',()=>root!.classList.remove('open'));
  return root;
}

export function showNPCProfile(profile:NPCProfileRecord, relationships:Array<{kind?:string;otherId?:string;affinity?:number;trust?:number}> = [], actions:GridProfileActions = {}){
  const root=mountGridTargetProfile();
  const set=(selector:string,value:string)=>{const el=root!.querySelector(selector);if(el)el.innerHTML=value;};
  set('.grid-target-profile-name',esc(profile.displayName));
  set('.grid-target-profile-meta',esc(profile.role)+' · '+esc(profile.occupation.title)+' · LEVEL '+profile.level+' · '+esc(profile.world));
  const xp=Math.min(100,Math.round(profile.experience%100));
  set('.grid-target-profile-bars','<span>EXPERIENCE <i style="width:'+xp+'%"></i></span><span>SKILLS <i style="width:'+Math.min(100,Math.round(Object.values(profile.skills).reduce((a,b)=>a+b,0)*10))+'%"></i></span>');
  set('.grid-target-profile-traits',profile.traits.map(esc).join(' · ')||'UNSPECIFIED');
  const skills=Object.entries(profile.skills).map(([name,value])=>'<span>'+esc(name.toUpperCase())+' <b>'+Math.round(value)+'</b></span>').join('');
  set('.grid-target-profile-skills',skills||'NO RECORDED SKILLS');
  const rel=relationships.slice(0,8).map(x=>'<span>'+esc(x.kind??'connection')+' · '+esc(x.otherId??'unknown')+'</span>').join('');
  set('.grid-target-profile-relations',rel||'NO RECORDED CONNECTIONS');
  const buttons=root.querySelectorAll<HTMLButtonElement>('[data-profile-action]'); buttons.forEach(button=>{ const kind=button.dataset.profileAction; button.onclick=()=>{ if(kind==='friend') actions.onFriend?.(); if(kind==='follow') actions.onFollow?.(); if(kind==='message') actions.onMessage?.(); if(kind==='public') actions.onPublicProfile?.(); }; });
  const actionsBox=root.querySelector<HTMLElement>('.grid-target-profile-actions'); if(actionsBox) actionsBox.style.display=actions.onFriend||actions.onFollow||actions.onMessage?'flex':'none';
  root.classList.add('open');
  return root;
}
