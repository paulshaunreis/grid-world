import type { SupabaseClient } from '@supabase/supabase-js';
import type { GridPartyInviteAuthority, GridPartyInvite } from '../social/GridPartyInviteAuthority';

export function mountGridPartyInvitePanel(
  authority: GridPartyInviteAuthority,
  client: SupabaseClient,
  onAccepted?: (invite: GridPartyInvite) => void,
): { open(): void; close(): void; refresh(): Promise<void> } {
  const style = document.createElement('style');
  style.textContent = `
    .gw-party-invites{position:fixed;right:22px;top:132px;width:min(430px,calc(100vw - 28px));max-height:min(560px,calc(100vh - 160px));z-index:82;background:rgba(4,9,16,.97);border:1px solid rgba(116,221,255,.28);box-shadow:0 25px 100px rgba(0,0,0,.58);backdrop-filter:blur(18px);display:none;color:#eaf7ff;font:12px/1.45 'IBM Plex Mono',monospace}
    .gw-party-invites.open{display:block}
    .gw-party-invites header{display:flex;justify-content:space-between;align-items:center;padding:15px;border-bottom:1px solid #ffffff12}
    .gw-party-invites .kicker{font-size:8px;letter-spacing:.18em;color:#74ddff}
    .gw-party-invites h2{font:700 21px 'Space Grotesk',sans-serif;margin:4px 0 0}
    .gw-party-invites .body{padding:13px;overflow:auto;max-height:440px}
    .gw-party-invites .card{padding:13px;border:1px solid #ffffff12;background:#ffffff04;margin-bottom:8px}
    .gw-party-invites .head{display:flex;justify-content:space-between;gap:10px}
    .gw-party-invites strong{font-family:'Space Grotesk',sans-serif;font-size:15px}
    .gw-party-invites small{display:block;color:#7e92a1;margin-top:3px}
    .gw-party-invites .actions{display:flex;gap:7px;margin-top:11px}
    .gw-party-invites button{border:1px solid #ffffff18;background:#ffffff06;color:#cfe8f4;padding:7px 9px;font:700 9px 'IBM Plex Mono',monospace;cursor:pointer}
    .gw-party-invites button:hover{border-color:#74ddff55;color:#74ddff}
    .gw-party-invites .accept{border-color:#74ddff35;color:#74ddff}
    .gw-party-invites .empty{padding:28px 8px;text-align:center;color:#667b89}
  `;
  document.head.appendChild(style);

  const panel=document.createElement('section');
  panel.className='gw-party-invites';
  panel.setAttribute('aria-label','Grid World party invitations');
  panel.innerHTML=`
    <header><div><div class="kicker">GRID WORLD // PARTY NETWORK</div><h2>Party Invitations</h2></div><button type="button" data-close>CLOSE</button></header>
    <div class="body" data-list></div>
  `;
  document.body.appendChild(panel);

  const list=panel.querySelector<HTMLDivElement>('[data-list]')!;
  const close=()=>panel.classList.remove('open');

  async function render(rows:GridPartyInvite[]) {
    if(!rows.length){ list.innerHTML='<div class="empty">No pending party invitations.</div>'; return; }
    const ids=[...new Set(rows.map(row=>row.senderUserId))];
    let names=new Map<string,string>();
    try {
      const {data}=await client.from('grid_user_profiles').select('user_id,display_name,handle').in('user_id',ids);
      names=new Map((data??[]).map((profile:any)=>[String(profile.user_id),String(profile.display_name||profile.handle||'Grid Traveler')]));
    } catch {}
    list.innerHTML=rows.map(inv=>{
      const sender=names.get(inv.senderUserId)??'Grid Traveler';
      const expires=Math.max(0,Math.ceil((new Date(inv.expiresAt).getTime()-Date.now())/1000));
      return `<article class="card">
        <div class="head"><div><strong>${sender}</strong><small>invited you to join a party · expires in ${expires}s</small></div><span class="kicker">PARTY</span></div>
        <div class="actions"><button class="accept" data-action="accept" data-id="${inv.id}">ACCEPT & JOIN</button><button data-action="decline" data-id="${inv.id}">DECLINE</button></div>
      </article>`;
    }).join('');
  }

  async function refresh(){
    try { await render(await authority.pending()); }
    catch { list.innerHTML='<div class="empty">Party invitations are temporarily unavailable. Your world remains playable.</div>'; }
  }

  panel.addEventListener('click',async event=>{
    const target=(event.target as HTMLElement).closest<HTMLButtonElement>('button[data-action]');
    if(!target)return;
    const id=target.dataset.id;if(!id)return;
    target.disabled=true;
    try{
      const status=target.dataset.action==='accept'?'accepted':'declined';
      const invite=await authority.respond(id,status);
      if(status==='accepted'){
        onAccepted?.(invite);
        close();
      }
      await refresh();
    }catch(error){
      console.error('Party invitation response failed.',error);
      target.disabled=false;
      list.insertAdjacentHTML('afterbegin','<div class="empty">The invitation could not be updated. Please try again.</div>');
    }
  });
  panel.querySelector<HTMLButtonElement>('[data-close]')?.addEventListener('click',close);

  return {open:()=>{panel.classList.add('open');void refresh();},close,refresh};
}
