import type { GridCombatAuthority } from '../network/GridCombatAuthority';
import { GRID_COIN_DENOMINATIONS } from '../economy/GridCurrencySystem';
import { marketplaceItemMetadata } from '../economy/GridMarketplaceItem';

export function mountGridEconomyPanel(authority:()=>GridCombatAuthority|null){
  const panel=document.createElement('section');
  panel.className='grid-economy-panel';
  panel.innerHTML='<div class="grid-economy-card"><button class="grid-economy-close">×</button><div class="grid-economy-kicker">GRID OMNI ECONOMY</div><h2>Inventory · Wallet · Vault · Bazaar · Elements</h2><div class="grid-economy-tabs"><button data-tab="wallet">WALLET</button><button data-tab="inventory">INVENTORY</button><button data-tab="vault">VAULT</button><button data-tab="bazaar">BAZAAR</button><button data-tab="elements">ELEMENTS</button><button data-tab="npc">NPC PROFILE</button></div><div class="grid-economy-content"></div><div class="grid-economy-status"></div></div></section>';
  document.body.appendChild(panel);
  const contentBox=panel.querySelector<HTMLDivElement>('.grid-economy-content')!,status=panel.querySelector<HTMLDivElement>('.grid-economy-status')!;
  let current='inventory';
  const esc=(s:string)=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]!));
  async function render(){
    const a=authority(); if(!a){contentBox.innerHTML='<p>Grid authority unavailable.</p>';return;}
    try{
      if(current==='wallet'){
        const [r,ledger]=await Promise.all([a.walletRead(),a.ledgerRead(8)]);
        const rows=(r as any)?.wallets??(r as any)?.wallet??[];
        const entries=(ledger as any)?.transactions??[];
        contentBox.innerHTML=
          '<div class="grid-economy-list">'+
          rows.map((x:any)=>'<div class="grid-economy-row"><div><b>'+esc(String(x.currency_code??x.currency_id).toUpperCase())+'</b><small>'+esc(String(x.currency_name??x.currency_id))+'</small></div><strong>'+Number(x.balance).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})+'</strong><span>server wallet</span></div>').join('')+
          '</div>'+
          '<div class="grid-economy-subhead">GRID COIN DENOMINATIONS</div>'+
          '<div class="grid-economy-list">'+GRID_COIN_DENOMINATIONS.map(d=>'<div class="grid-economy-row"><b>'+esc(d.name)+'</b><strong>'+esc(d.symbol)+'</strong><small>configurable denomination of Grid Coin</small></div>').join('')+'</div>'+
          '<div class="grid-economy-subhead">RECENT LEDGER ENTRIES</div>'+
          '<div class="grid-economy-list">'+
          entries.map((x:any)=>'<div class="grid-economy-row"><div><b>'+esc(String(x.transaction_type??'TRANSACTION'))+'</b><small>'+esc(String(x.memo??''))+'</small></div><strong>'+((Number(x.entry?.amount??0)>=0)?'+':'')+Number(x.entry?.amount??0).toFixed(2)+'</strong><span>'+esc(String(x.entry?.currency_id??''))+'</span></div>').join('')+
          (entries.length?'':'<p>No ledger entries yet.</p>')+'</div>';
      }
      else if(current==='inventory'){
        const r=await a.inventoryRead(); const rows=(r as any)?.inventory??[];
        contentBox.innerHTML='<div class="grid-economy-list">'+rows.map((x:any)=>{const m=x.marketplace??{};return '<div class="grid-economy-row"><div><b>'+esc(String(m.display_name??x.item_id))+'</b><small>'+esc(String(m.category??'MATERIAL'))+' · 3D: '+esc(String(m.model_key??''))+'</small></div><strong>'+Number(x.quantity).toLocaleString()+'</strong><button data-list="'+esc(String(x.item_id))+'">LIST 1</button></div>';}).join('')+'</div>';
        contentBox.querySelectorAll<HTMLButtonElement>('[data-list]').forEach(b=>b.onclick=async()=>{const price=Number(window.prompt('Unit price in Grid currency:', '5')??'0');if(!Number.isFinite(price)||price<=0)return;b.disabled=true;try{const rr=await a.bazaarCreate('GRID_BAZAAR',b.dataset.list!,1,'grid',price);status.textContent=(rr as any)?.ok?'Asset listed in Grid Bazaar.':'Listing rejected.';await render();}catch{status.textContent='Listing rejected by Grid authority.'}b.disabled=false;});
      } else if(current==='vault'){
        const r=await a.vaultRead(); const rows=(r as any)?.vault??[];
        contentBox.innerHTML='<div class="grid-economy-list">'+rows.map((x:any)=>'<div class="grid-economy-row"><b>'+esc(String(x.item_id))+'</b><strong>'+Number(x.quantity).toLocaleString()+'</strong><small>mined '+Number(x.mined_quantity).toLocaleString()+'</small></div>').join('')+'</div>';
      } else if(current==='bazaar'){
        const r=await a.bazaarList(); const rows=(r as any)?.listings??[];
        contentBox.innerHTML='<div class="grid-economy-list">'+rows.map((x:any)=>{const m=x.metadata??marketplaceItemMetadata(String(x.item_id),x.quality);return '<div class="grid-economy-row"><div><b>'+esc(String(x.item_name??m.displayName??x.item_id))+'</b><small>'+esc(String(x.category??m.category))+' · '+esc(String(x.seller_type==='NPC'?x.seller_npc_id:'USER'))+' · '+esc(String(x.currency_id))+'</small><small>3D: '+esc(String(x.model_key??m.modelKey))+' · Art: '+esc(String(x.art_key??m.artKey))+'</small></div><strong>'+Number(x.unit_price).toFixed(2)+'</strong><button data-buy="'+esc(String(x.id))+'">BUY 1</button><span>'+Number(x.remaining).toLocaleString()+' left</span></div>';}).join('')||'<p>No active Bazaar listings.</p>';
        contentBox.querySelectorAll<HTMLButtonElement>('[data-buy]').forEach(b=>b.onclick=async()=>{b.disabled=true;try{const rr=await a.bazaarBuy(b.dataset.buy!,1);status.textContent=(rr as any)?.ok?'Purchase secured in your inventory and Vault.':'Purchase rejected.';await render();}catch(e){status.textContent='Purchase rejected by Grid authority.'}b.disabled=false;});
      } else if(current==='elements'){
        contentBox.innerHTML='<div class="grid-element-card"><b>STARFORGE-119</b><span>Au + Ag + C → Aurorium (Ao), Grid synthetic element 119</span><button data-trans="STARFORGE-119">TRANSMUTE</button></div><div class="grid-element-card"><b>STARFORGE-120</b><span>Cu + Si + O → Luminite (LuG), Grid synthetic element 120</span><button data-trans="STARFORGE-120">TRANSMUTE</button></div><div class="grid-element-card"><b>STARFORGE-121</b><span>Fe + C + Si + O → Verdanium (Vd), Grid synthetic element 121</span><button data-trans="STARFORGE-121">TRANSMUTE</button></div>';
        contentBox.querySelectorAll<HTMLButtonElement>('[data-trans]').forEach(b=>b.onclick=async()=>{b.disabled=true;try{const rr=await a.transmuteElement(b.dataset.trans!);status.textContent=(rr as any)?.result?.ok?'New Grid element created and stored.':String((rr as any)?.result?.error??'Transmutation rejected.');await render();}catch{status.textContent='Transmutation rejected by Grid authority.'}b.disabled=false;});
      } else {
        const npcId='npc.merchant.mara';
        const r=await a.npcProfile(npcId); const p=(r as any)?.profile;
        contentBox.innerHTML=p?'<div class="grid-npc-profile"><div class="grid-npc-avatar">M</div><div><h3>'+esc(p.display_name)+'</h3><b>'+esc(p.role)+' · '+esc(p.archetype)+'</b><p>Personality: '+esc(JSON.stringify(p.personality))+'</p><p>Autonomy: '+esc(JSON.stringify(p.autonomy_profile))+'</p><button data-memory="1">OPEN MEMORY LOG</button></div></div>':'<p>NPC profile unavailable.</p>';
        const memBtn=contentBox.querySelector<HTMLButtonElement>('[data-memory]'); if(memBtn) memBtn.onclick=async()=>{const memories=await a.npcMemoryRead(npcId,20); status.textContent=((memories as any)?.memories??[]).map((m:any)=>m.summary).join(' · ')||'No public memories yet.';};
      }
    }catch{contentBox.innerHTML='<p>Grid service unavailable.</p>';}
  }
  panel.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach(b=>b.onclick=()=>{current=b.dataset.tab!;void render();});
  panel.querySelector<HTMLButtonElement>('.grid-economy-close')!.onclick=()=>panel.classList.remove('open');
  const style=document.createElement('style');style.textContent='.grid-economy-panel{position:fixed;inset:0;z-index:1200;display:none;place-items:center;background:rgba(2,5,10,.78);backdrop-filter:blur(10px)}.grid-economy-panel.open{display:grid}.grid-economy-card{width:min(820px,94vw);max-height:86vh;overflow:auto;padding:26px;border:1px solid rgba(113,223,255,.34);background:rgba(7,12,20,.98);color:#eaf8ff;font-family:system-ui;box-shadow:0 25px 100px rgba(0,0,0,.6)}.grid-economy-close{float:right;background:none;border:0;color:#9bb4c1;font-size:28px}.grid-economy-kicker{font-size:11px;letter-spacing:.2em;color:#71dfff}.grid-economy-tabs{display:flex;flex-wrap:wrap;gap:7px;margin:18px 0}.grid-economy-tabs button,.grid-economy-content button{border:1px solid rgba(113,223,255,.3);background:rgba(113,223,255,.07);color:#eaf8ff;padding:8px 11px;cursor:pointer}.grid-economy-list{display:grid;gap:7px}.grid-economy-subhead{margin:16px 0 7px;color:#71dfff;font-size:10px;letter-spacing:.18em}.grid-economy-row{display:grid;grid-template-columns:1fr auto auto auto;gap:12px;align-items:center;padding:12px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.025)}.grid-economy-row small,.grid-economy-row span{color:#8297a2;font-size:10px}.grid-economy-row strong{color:#71dfff}.grid-element-card,.grid-npc-profile{display:grid;gap:9px;padding:15px;margin-bottom:8px;border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.025)}.grid-element-card span,.grid-npc-profile p{color:#9fb2bb;font-size:12px}.grid-npc-avatar{width:48px;height:48px;display:grid;place-items:center;border:1px solid rgba(113,223,255,.4);border-radius:50%;color:#71dfff;font-size:20px}.grid-economy-status{margin-top:15px;color:#71dfff;font-size:12px}@media(max-width:650px){.grid-economy-row{grid-template-columns:1fr auto}.grid-economy-row span{grid-column:1/-1}}';document.head.appendChild(style);
  async function openNpc(npcId:string){ current='npc'; panel.classList.add('open'); const a=authority(); if(!a)return; try{ const rr=await a.npcProfile(npcId); const p=(rr as any)?.profile; if(p){ contentBox.innerHTML='<div class="grid-npc-profile"><div class="grid-npc-avatar">'+esc(String(p.display_name).slice(0,1))+'</div><div><h3>'+esc(String(p.display_name))+'</h3><b>'+esc(String(p.role))+' · '+esc(String(p.archetype))+'</b><p>Personality: '+esc(JSON.stringify(p.personality))+'</p><p>Autonomy: '+esc(JSON.stringify(p.autonomy_profile))+'</p><button data-memory="1">OPEN MEMORY LOG</button></div></div>'; contentBox.querySelector<HTMLButtonElement>('[data-memory]')?.addEventListener('click',async()=>{const m=await a.npcMemoryRead(npcId,20);status.textContent=((m as any)?.memories??[]).map((x:any)=>String(x.summary)).join(' · ')||'No public memories yet.';}); }}catch{status.textContent='NPC profile unavailable.'}}
  return {open:()=>{panel.classList.add('open');void render();},openNpc,close:()=>panel.classList.remove('open')};
}
