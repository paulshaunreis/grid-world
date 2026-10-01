import type { GridPartyMember } from '../social/GridPartySystem';
import type { SupabaseClient } from '@supabase/supabase-js';

export function mountGridPartyHud(client?:SupabaseClient){
  const el=document.createElement('section'); el.className='grid-party-hud'; el.setAttribute('aria-label','Party roster');
  el.innerHTML='<div class="grid-party-head"><span>PARTY LINK</span><b data-party-count>0</b></div><div class="grid-party-list" data-party-list></div>';
  document.body.appendChild(el);
  const style=document.createElement('style'); style.textContent=`.grid-party-hud{position:fixed;left:24px;top:120px;width:270px;z-index:42;display:none;padding:10px;background:rgba(3,9,16,.72);border:1px solid rgba(120,220,255,.2);backdrop-filter:blur(14px);font:10px/1.3 'IBM Plex Mono',monospace;color:#eff8ff}.grid-party-head{display:flex;justify-content:space-between;color:#7fdfff;font-size:9px;letter-spacing:.14em;margin-bottom:8px}.grid-party-list{display:grid;gap:7px}.grid-party-row{display:grid;grid-template-columns:34px 1fr;gap:8px;padding:7px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.025)}.grid-party-avatar{width:34px;height:34px;object-fit:cover;border:1px solid rgba(120,220,255,.22);background:rgba(255,255,255,.05)}.grid-party-name{display:flex;justify-content:space-between;gap:8px}.grid-party-role{font-size:8px;letter-spacing:.1em;color:#74ddff}.grid-party-bar{height:5px;margin-top:5px;background:rgba(0,0,0,.45);border:1px solid rgba(255,255,255,.08)}.grid-party-bar i{display:block;height:100%;background:linear-gradient(90deg,#61e69b,#54dfff);transition:width .2s}.grid-party-meta{display:flex;justify-content:space-between;margin-top:4px;color:#7e92a1;font-size:8px}`;
  document.head.appendChild(style);
  const list=el.querySelector<HTMLDivElement>('[data-party-list]')!, count=el.querySelector<HTMLElement>('[data-party-count]')!;
  const profileCache=new Map<string,{name:string;avatar?:string}>();

  async function hydrate(members:GridPartyMember[]){
    if(!client)return;
    const ids=members.map(m=>m.userId).filter(id=>!profileCache.has(id));
    if(!ids.length)return;
    try{
      const {data}=await client.from('grid_user_profiles').select('user_id,display_name,handle,avatar_url').in('user_id',ids);
      for(const p of data??[]) profileCache.set(String(p.user_id),{name:String(p.display_name||p.handle||'Grid Traveler'),avatar:p.avatar_url?String(p.avatar_url):undefined});
    }catch{}
  }

  function render(members:GridPartyMember[],names:Record<string,string>={}){
    el.style.display=members.length?'block':'none'; count.textContent=String(members.length);
    list.innerHTML=members.map(m=>{
      const profile=profileCache.get(m.userId); const name=profile?.name??names[m.userId]??'Grid Traveler';
      const pct=Math.max(0,Math.min(100,m.healthMax?m.healthCurrent/m.healthMax*100:0));
      const avatar=profile?.avatar ? `<img class="grid-party-avatar" src="${profile.avatar}" alt="">` : '<div class="grid-party-avatar" aria-hidden="true"></div>';
      return `<div class="grid-party-row">${avatar}<div><div class="grid-party-name"><span>${name}</span><b>${Math.round(m.healthCurrent)}/${Math.round(m.healthMax)} HP</b></div><div class="grid-party-role">${m.role==='LEADER'?'PARTY LEADER':'PARTY MEMBER'}</div><div class="grid-party-bar"><i style="width:${pct}%"></i></div><div class="grid-party-meta"><span>LV ${m.level}</span><span>${m.worldId??'WORLD SYNC'}</span></div></div></div>`;
    }).join('');
  }

  async function update(members:GridPartyMember[],names:Record<string,string>={}){
    await hydrate(members); render(members,names);
  }
  return {element:el,render,update};
}
