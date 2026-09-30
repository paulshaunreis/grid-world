import type { GridCombatAuthority } from '../network/GridCombatAuthority';

type MarketItem={world:string;item_id:string;unit_price:number;currency_id:string;scarcity:number;demand:number};

export function mountMarketPanel(getInventory:()=>Partial<Record<string,number>>,getItems:()=>MarketItem[],authority:()=>GridCombatAuthority|null){
  const panel=document.createElement('section'); panel.className='grid-market-panel';
  panel.innerHTML='<div class="grid-market-card"><button class="grid-market-close">×</button><div class="grid-market-kicker">WORLD MARKET // LIVE</div><h2>Merchant Exchange</h2><p class="grid-market-sub">Local merchants respond to supply, demand and the living world.</p><div class="grid-market-items"></div><div class="grid-market-status"></div></div>';
  document.body.appendChild(panel);
  const items=panel.querySelector<HTMLDivElement>('.grid-market-items')!,status=panel.querySelector<HTMLDivElement>('.grid-market-status')!;
  const render=()=>{
    const inv=getInventory(), quotes=getItems();
    items.innerHTML=quotes.map(q=>{
      const have=Number(inv[q.item_id]??0);
      return '<div class="grid-market-item"><div><b>'+q.item_id.replaceAll('_',' ')+'</b><small>'+q.world+' · '+q.currency_id.toUpperCase()+' · demand '+q.demand.toFixed(2)+'</small></div><strong>'+q.unit_price.toFixed(2)+'</strong><button data-sell="'+q.item_id+'" data-world="'+q.world+'">SELL 1</button><span>'+have+' held</span></div>';
    }).join('');
    items.querySelectorAll<HTMLButtonElement>('[data-sell]').forEach(btn=>btn.onclick=async()=>{
      const item=btn.dataset.sell!,world=btn.dataset.world!,a=authority();
      if(!a){status.textContent='Market authority unavailable.';return;}
      btn.disabled=true;
      try{
        const r=await a.marketSell(world,item,1);
        if(r?.ok){status.textContent='Sold 1 '+item.replaceAll('_',' ')+' for '+String((r as any).quote?.total??'')+' '+String((r as any).quote?.currency_id??'').toUpperCase()+'.';render();}
        else status.textContent=String((r as any)?.error??'Sale rejected.');
      }catch{status.textContent='Merchant network unavailable.'}
      btn.disabled=false;
    });
  };
  const open=()=>{render();panel.classList.add('open')}; const close=()=>panel.classList.remove('open');
  panel.querySelector<HTMLButtonElement>('.grid-market-close')!.onclick=close;
  const style=document.createElement('style'); style.textContent='.grid-market-panel{position:fixed;inset:0;z-index:1100;display:none;place-items:center;background:rgba(4,7,12,.76);backdrop-filter:blur(9px)}.grid-market-panel.open{display:grid}.grid-market-card{width:min(720px,92vw);padding:28px;border:1px solid rgba(120,220,255,.35);background:rgba(8,13,21,.97);color:#eaf8ff;font-family:system-ui;box-shadow:0 25px 90px rgba(0,0,0,.55)}.grid-market-close{float:right;border:0;background:none;color:#b8dbe8;font-size:28px}.grid-market-kicker{font-size:11px;letter-spacing:.2em;color:#71dfff}.grid-market-card h2{margin:8px 0}.grid-market-sub{color:#9fb2bb;font-size:13px}.grid-market-items{display:grid;gap:8px;margin-top:20px}.grid-market-item{display:grid;grid-template-columns:1fr auto auto auto;gap:12px;align-items:center;padding:12px;border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.025)}.grid-market-item b,.grid-market-item small{display:block}.grid-market-item small{color:#8199a5;font-size:10px;margin-top:4px}.grid-market-item strong{color:#71dfff}.grid-market-item button{border:1px solid rgba(113,223,255,.35);background:rgba(113,223,255,.08);color:#eaf8ff;padding:7px 10px;cursor:pointer}.grid-market-item span{font-size:10px;color:#8498a0}.grid-market-status{margin-top:14px;color:#71dfff;font-size:12px}@media(max-width:650px){.grid-market-item{grid-template-columns:1fr auto}.grid-market-item span{grid-column:1/-1}}'; document.head.appendChild(style);
  return {open,close};
}