import type { EcologyWorld } from '../world/CreatureEcologySystem';
import type { WorldConsequenceSnapshot } from '../world/WorldConsequenceSystem';
import type { WorldResourceNode } from '../world/WorldResourceSystem';
import { getWorlds } from '../world/GridWorldRegistry';



export function mountWorldAtlas(
 getState:()=>{world:EcologyWorld;event:string;consequences:WorldConsequenceSnapshot;resources:WorldResourceNode[];inventory?:Partial<Record<string,number>>;market?:Array<{world:string;item_id:string;unit_price:number;currency_id:string;scarcity:number;demand:number}>;transit?:Array<{nodeId:string;displayName:string;regionId:string;departures:number;arrivals:number;activity:number}>}
){
 const panel=document.createElement('section');
 panel.className='grid-atlas-panel';
 panel.innerHTML='<div class="grid-atlas-card"><button class="grid-atlas-close" type="button">×</button><div class="grid-atlas-kicker">GRID WORLD // ATLAS</div><h2>Many Worlds · One Living Foundation</h2><div class="grid-atlas-worlds"></div><div class="grid-atlas-history"></div></div>';
 document.body.appendChild(panel);
 const close=panel.querySelector<HTMLButtonElement>('.grid-atlas-close')!;
 const worlds=panel.querySelector<HTMLDivElement>('.grid-atlas-worlds')!;
 const history=panel.querySelector<HTMLDivElement>('.grid-atlas-history')!;
 const economy=document.createElement('div'); economy.className='grid-atlas-economy'; panel.querySelector('.grid-atlas-card')!.appendChild(economy);
 const render=()=>{
   const state=getState();
   const registry=getWorlds();
   worlds.innerHTML=registry.map(meta=>{
     const world=meta.id as EcologyWorld;
     const resource=state.resources.find(node=>node.world===world);
     const stability=Math.round((state.consequences.world===world?state.consequences.stability:1)*100);
     const active=world===state.world;
     return '<button class="grid-atlas-world '+(active?'active':'')+'" data-world="'+world+'"><b>'+meta.name+'</b><small>'+meta.tag+'</small><span>'+meta.description+'</span><em>'+stability+'% stability · '+(resource?.kind??'RESOURCE')+'</em></button>';
   }).join('');
   const transit = state.transit ?? [];
   const activeTransit = transit.filter(item=>item.activity>.05).sort((a,b)=>b.activity-a.activity).slice(0,8);
   economy.innerHTML='<div class="grid-atlas-kicker">TRANSIT NETWORK</div><div class="grid-atlas-transit">'+(activeTransit.length?activeTransit.map(item=>'<span><b>'+item.displayName+'</b><em>'+Math.round(item.activity*100)+'% activity · '+(item.departures+item.arrivals)+' passages</em></span>').join(''):'<span>NETWORK QUIET · awaiting travelers</span>')+'</div><div class="grid-atlas-kicker" style="margin-top:16px">YOUR MATERIALS</div><div class="grid-atlas-inventory">'+Object.entries(state.inventory??{}).filter(([,v])=>Number(v)>0).map(([k,v])=>'<span><b>'+k.replaceAll('_',' ')+'</b><em>'+Number(v)+'</em></span>').join('')+'</div><div class="grid-atlas-kicker" style="margin-top:16px">LIVING MARKET</div><div class="grid-atlas-market">'+(state.market??[]).map(m=>'<span><b>'+m.world+'</b> '+m.item_id.replaceAll('_',' ')+' · <em>'+m.unit_price+' '+m.currency_id.toUpperCase()+'</em></span>').join('')+'</div>'; history.innerHTML='<div class="grid-atlas-kicker">LIVE HISTORY</div>'+state.consequences.history.slice(-5).reverse().map(item=>'<div class="grid-atlas-event"><b>'+item.world+'</b><span>'+item.text+'</span></div>').join('');
 };
 const style=document.createElement('style');
 style.textContent='.grid-atlas-panel{position:fixed;inset:0;z-index:1000;display:none;place-items:center;background:rgba(4,7,12,.72);backdrop-filter:blur(8px)}.grid-atlas-panel.open{display:grid}.grid-atlas-card{width:min(920px,92vw);max-height:84vh;overflow:auto;padding:28px;border:1px solid rgba(120,220,255,.32);background:rgba(8,13,21,.96);color:#eaf8ff;box-shadow:0 20px 80px rgba(0,0,0,.5);font-family:system-ui}.grid-atlas-close{float:right;border:0;background:none;color:#b8dbe8;font-size:28px;cursor:pointer}.grid-atlas-kicker{font-size:11px;letter-spacing:.2em;color:#71dfff}.grid-atlas-card h2{font-weight:500;margin:8px 0 20px}.grid-atlas-worlds{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}.grid-atlas-world{min-height:150px;text-align:left;padding:14px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.035);color:inherit;cursor:pointer}.grid-atlas-world.active{border-color:rgba(120,220,255,.7);background:rgba(80,180,220,.1)}.grid-atlas-world b,.grid-atlas-world small,.grid-atlas-world span,.grid-atlas-world em{display:block}.grid-atlas-world small{margin-top:4px;color:#71dfff;font-size:10px}.grid-atlas-world span{margin:14px 0;font-size:12px;line-height:1.45;color:#a9bac4}.grid-atlas-world em{font-size:10px;color:#d4e3e9;font-style:normal}.grid-atlas-economy{margin-top:24px;padding:14px;border:1px solid rgba(120,220,255,.15);background:rgba(255,255,255,.025)}.grid-atlas-inventory{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}.grid-atlas-inventory span{padding:8px 10px;border:1px solid rgba(255,255,255,.1);font-size:11px}.grid-atlas-inventory b{margin-right:8px}.grid-atlas-inventory em{color:#71dfff;font-style:normal}.grid-atlas-market{display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-top:8px}.grid-atlas-market span{padding:7px 9px;border:1px solid rgba(255,255,255,.08);font-size:10px;color:#b9cbd3}.grid-atlas-market em{color:#71dfff;font-style:normal}.grid-atlas-transit{display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-top:10px}.grid-atlas-transit span{padding:8px;border:1px solid rgba(120,220,255,.12);font-size:10px}.grid-atlas-transit b,.grid-atlas-transit em{display:block}.grid-atlas-transit em{margin-top:3px;color:#71dfff;font-style:normal}.grid-atlas-history{margin-top:26px}.grid-atlas-event{display:flex;gap:12px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.08);font-size:12px}.grid-atlas-event b{min-width:70px;color:#71dfff}.grid-atlas-event span{color:#c2d0d6}@media(max-width:760px){.grid-atlas-worlds{grid-template-columns:1fr 1fr}}';
 document.head.appendChild(style);
 close.addEventListener('click',()=>panel.classList.remove('open'));
 const button=document.createElement('button'); button.className='toolbar-button'; button.textContent='ATLAS'; button.type='button'; button.addEventListener('click',()=>{render();panel.classList.add('open')}); document.body.appendChild(button);
 return {open:()=>{render();panel.classList.add('open')},close:()=>panel.classList.remove('open')};
}
