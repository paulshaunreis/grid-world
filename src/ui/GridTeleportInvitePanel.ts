import type { GridTeleportInviteAuthority, GridTeleportInvite } from '../social/GridTeleportInviteAuthority';
import type { GridLandmarkItem } from '../social/GridLandmarkAuthority';
import type { GridTeleportDestination } from '../engine/GridTeleport';
export function mountGridTeleportInvitePanel(authority:GridTeleportInviteAuthority,onAccepted:(invite:GridTeleportInvite)=>void){
 const root=document.createElement('section');root.className='grid-teleport-invites';root.innerHTML='<header><b>TRANSIT INVITATIONS</b><button data-close>×</button></header><div data-body></div>';document.body.appendChild(root);
 const body=root.querySelector('[data-body]') as HTMLElement;
 const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c));
 const render=(rows:GridTeleportInvite[])=>{body.innerHTML=rows.length?rows.map(x=>'<article><div class="invite-preview"><img src="'+esc(x.previewImageUrl||'/art/hero-worlds.svg')+'"><div><b>'+esc(x.destinationName)+'</b><small>FROM '+esc(x.senderUserId)+'</small></div></div><div class="invite-actions"><button data-id="'+x.id+'" data-action="accept">ACCEPT</button><button data-id="'+x.id+'" data-action="decline">DECLINE</button></div></article>').join(''):'<p class="invite-empty">No pending transit invitations.</p>';};
 const refresh=()=>authority.pending().then(render).catch(()=>{body.innerHTML='<p class="invite-empty">Transit invitations unavailable.</p>';});
 root.querySelector('[data-close]')?.addEventListener('click',()=>root.remove());
 root.addEventListener('click',async e=>{const b=(e.target as HTMLElement).closest<HTMLButtonElement>('button[data-action]');if(!b)return;try{const row=await authority.respond(b.dataset.id!,b.dataset.action as 'accepted'|'declined');if(row.status==='accepted')onAccepted(row);await refresh();}catch{body.innerHTML='<p class="invite-empty">That invitation is no longer available.</p>';}});
 refresh(); return {root,refresh,open:()=>{root.classList.add('open');void refresh();}};
}
export function openTeleportDestinationPicker(destinations:GridTeleportDestination[],landmarks:GridLandmarkItem[],onSelect:(destination:GridTeleportDestination)=>void){
 const root=document.createElement('section');root.className='grid-destination-picker';root.innerHTML='<div class="picker-card"><div class="picker-kicker">PARTY TRANSIT // DESTINATION SELECTION</div><h2>Choose where to travel</h2><div class="picker-list"></div><button data-cancel>CANCEL</button></div>';document.body.appendChild(root);
 const list=root.querySelector('.picker-list') as HTMLElement;
 const items=destinations.map(d=>({d,label:d.displayName}));const landmarkById=new Map(landmarks.map(x=>[x.metadata.destinationId as string,x.label]));
 list.innerHTML=items.map(({d})=>'<button data-id="'+d.id+'"><b>'+d.displayName+'</b><small>'+d.regionId+(landmarkById.has(d.id)?' · SAVED WAYPOINT':'')+'</small></button>').join('');
 list.querySelectorAll<HTMLButtonElement>('button[data-id]').forEach(b=>b.onclick=()=>{const d=destinations.find(x=>x.id===b.dataset.id);if(d){onSelect(d);root.remove();}});
 root.querySelector('[data-cancel]')?.addEventListener('click',()=>root.remove());
 return root;
}