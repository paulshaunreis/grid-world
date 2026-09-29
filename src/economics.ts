import './economics.css';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, supabaseConfigured } from './persistence/config';

type Currency={id:string;code:string;name:string;category:string};
type Rate={quote_currency:string;rate:number;observed_at:string};
const app=document.querySelector<HTMLDivElement>('#economics')!;
const localRates=[['grid','GRD','Grid','core',1],['lumen','LUM','Lumen','creator',.82],['spark','SPK','Spark','creator',1.14],['root','RUT','Root','resource',.37],['tide','TDE','Tide','community',.64],['echo','ECO','Echo','community',1.31],['forge','FRG','Forge','creator',2.08],['orbit','ORB','Orbit','event',.91],['aether','AET','Aether','governance',3.44],['meridian','MRD','Meridian','collectible',5.2]] as const;
let currencies:Currency[]=localRates.map(([id,code,name,category])=>({id,code,name,category}));
let rates:Rate[]=localRates.map(([id,, , ,rate])=>({quote_currency:id,rate,observed_at:new Date().toISOString()}));
const history:Record<string,number[]>={};
for(const r of rates) history[r.quote_currency]=Array.from({length:24},(_,i)=>r.rate*(1+Math.sin(i*.55)*.018));

app.innerHTML=`
<header><a href="/" class="brand">◇ GRID WORLD</a><nav><a href="/docs.html">Docs</a><a href="/staff.html">Staff</a><a href="/play.html">Enter World</a></nav></header>
<main class="econ"><div class="eyebrow">GRID WORLD · ECONOMICS</div><div class="hero-row"><div><h1>A living<br><span>Grid economy.</span></h1><p>Internal simulated market data, exchange surfaces, creator value flows and a future-ready external payments boundary.</p></div><div class="market-status"><i></i><b>SIMULATION LIVE</b><small id="updated">Updating…</small></div></div>
<section class="market"><div class="section-head"><div><span>MARKET BOARD</span><h2>Currency worth</h2></div><small>Base: GRD · updates every 15 seconds</small></div><div class="currency-grid" id="currency-grid"></div></section>
<section class="chart-panel"><div class="section-head"><div><span>SELECTED MARKET</span><h2 id="chart-title">Grid / Lumen</h2></div><select id="currency-select"></select></div><div class="chart-wrap"><svg id="chart" viewBox="0 0 900 300" preserveAspectRatio="none"></svg></div><div class="chart-foot"><span>1 GRD = <b id="selected-rate">0.82 LUM</b></span><span>Simulation only · not a real-world exchange rate</span></div></section>
<section class="economy-grid"><article><span>WALLET</span><h2>Balances</h2><p>Wallet balances belong to authenticated Grid identities and are designed to live on the server ledger, not browser storage.</p><button id="wallet-demo">OPEN WALLET</button></article><article><span>TRADE</span><h2>Exchange + barter</h2><p>Exchange pairs, direct barter, creator sales, escrow-like holds and atomic settlement are planned as distinct transaction types.</p><button id="trade-demo">OPEN EXCHANGE</button></article><article><span>EXTERNAL RAIL</span><h2>Cash App-ready boundary</h2><p>Cash App Pay can become an external payment rail through a server-side adapter. Grid Currency remains separate until a real-money program is legally and operationally ready.</p><button id="cash-demo">VIEW RAIL</button></article></section>
<section class="principles"><span>MONETARY DESIGN NOTES</span><h2>What we borrow from money's history.</h2><div class="principle-grid"><div><b>Medium of exchange</b><p>Useful for buying, selling, paying creators and rewarding activity.</p></div><div><b>Unit of account</b><p>One stable reference unit makes prices and comparisons understandable.</p></div><div><b>Store of value</b><p>Some Grid currencies can be designed for retention, but their simulated value can move.</p></div><div><b>Trust + settlement</b><p>Ledger integrity, permissions, reconciliation and transparent transaction history matter more than visual tokens.</p></div></div></section>
<footer><a href="/">← Grid World</a><a href="/docs.html">Documentation</a></footer></main>`;

function render(){
  const grid=document.querySelector('#currency-grid')!;
  grid.innerHTML=rates.map(rate=>{
    const c=currencies.find(x=>x.id===rate.quote_currency)!;
    const change=((history[c.id]?.at(-1)!/(history[c.id]?.at(-2)??history[c.id]?.at(-1)!))-1)*100;
    return '<button class="currency-card" data-currency="'+c.id+'"><b>'+c.code+'</b><strong>'+rate.rate.toFixed(3)+'</strong><small>1 GRD</small><em class="'+(change>=0?'up':'down')+'">'+(change>=0?'+':'')+change.toFixed(2)+'%</em></button>';
  }).join('');
  document.querySelectorAll<HTMLButtonElement>('[data-currency]').forEach(b=>b.addEventListener('click',()=>select(b.dataset.currency!)));
}
function select(id:string){
  const rate=rates.find(x=>x.quote_currency===id)!; const c=currencies.find(x=>x.id===id)!;
  (document.querySelector('#chart-title') as HTMLElement).textContent='Grid / '+c.name;
  (document.querySelector('#selected-rate') as HTMLElement).textContent='1 GRD = '+rate.rate.toFixed(3)+' '+c.code;
  const selectEl=document.querySelector<HTMLSelectElement>('#currency-select')!; selectEl.value=id;
  draw(history[id]??[rate.rate]);
}
function draw(values:number[]){
  const svg=document.querySelector<SVGSVGElement>('#chart')!;
  const min=Math.min(...values)*.985,max=Math.max(...values)*1.015;
  const points=values.map((v,i)=>{const x=i/(values.length-1)*900;const y=285-(v-min)/(max-min||1)*250;return x.toFixed(1)+','+y.toFixed(1)}).join(' ');
  svg.innerHTML='<polyline points="'+points+'" fill="none" stroke="#48e7ff" stroke-width="3"/><line x1="0" y1="285" x2="900" y2="285" stroke="rgba(140,180,220,.2)"/>';
}
function drift(){
  rates=rates.map(r=>({...r,rate:r.rate*(1+(Math.random()-.5)*.012),observed_at:new Date().toISOString()}));
  for(const r of rates){history[r.quote_currency]??=[];history[r.quote_currency].push(r.rate);if(history[r.quote_currency].length>36)history[r.quote_currency].shift();}
  render(); select((document.querySelector('#currency-select') as HTMLSelectElement).value||'lumen');
  (document.querySelector('#updated') as HTMLElement).textContent='Updated '+new Date().toLocaleTimeString();
}
const selectEl=document.querySelector<HTMLSelectElement>('#currency-select')!;
selectEl.innerHTML=currencies.filter(c=>c.id!=='grid').map(c=>'<option value="'+c.id+'">'+c.code+' · '+c.name+'</option>').join('');
selectEl.addEventListener('change',()=>select(selectEl.value));
document.querySelector('#wallet-demo')?.addEventListener('click',()=>alert('Wallet service surface: server ledger + authenticated balances.'));
document.querySelector('#trade-demo')?.addEventListener('click',()=>alert('Exchange surface: simulated pairs + barter workflows.'));
document.querySelector('#cash-demo')?.addEventListener('click',()=>alert('External rail boundary: server-side Cash App Pay adapter, not connected to production funds.'));
render();select('lumen');drift();window.setInterval(drift,15000);
if(supabaseConfigured){
  const client=createClient(SUPABASE_URL!,SUPABASE_PUBLISHABLE_KEY!);
  client.from('grid_currency_types').select('id,code,name,category').then(({data})=>{if(data?.length){currencies=data as Currency[];render();}});
  client.from('grid_currency_rates').select('quote_currency,rate,observed_at').eq('base_currency','grid').then(({data})=>{if(data?.length){rates=data as Rate[];for(const r of rates)history[r.quote_currency]=[r.rate];render();select('lumen');}});
}
