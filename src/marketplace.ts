// GridWorld Marketplace page — browse listings, listing detail, buy dialog,
// and create-listing.
//
// DISTINCT FROM SHOP / STORE:
// - Marketplace (this page) is the citizen-to-citizen bazaar: listings from
//   grid_marketplace_listings + staff demo items + Grid originals.
// - Shop (shop.html) is per-storefront browsing via GridShopService.
// - Store (store.html) is real-world GridWorld merchandise — not yet open.
// - The in-game bazaar UI and staff-market activity are separate surfaces.
//
// HONEST FRAMING — read before changing this file:
// - Payments are DISABLED. The buy dialog never spends GWC, never creates an
//   order, and never implies a real purchase. Checkout is in active development.
// - User-created listings are saved in THIS BROWSER ONLY (localStorage) until
//   shared listings launch. They are not visible to other citizens yet.
//   Do NOT wire create-listing to Supabase until the live
//   grid_marketplace_listings columns, RLS insert policy, and grants are
//   captured — Phase 0 captured table names only, not that table's schema.
//   See supabase/drafts/DO-NOT-APPLY_marketplace_create_listing.md.
// - All user content is HTML-escaped before render. Never interpolate raw
//   titles, descriptions, or seller names into innerHTML.
// - Currency copy is Grid World Currency (GWC). Never GRC in user-facing copy.

import './marketplace.css';
import './glass-system.css';
import { mountStaffMarketActivity } from './marketplace-activity';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, supabaseConfigured } from './persistence/config';

type Listing={id:string;seller_staff_id:string;title:string;description:string;category:string;currency_id:string;price:number;inventory_limit:number|null;art_key:string;status:string;created_at:string;source?:'live'|'demo'|'grid'|'local'};
type Staff={id:string;display_name:string;role:string;bio:string};
type Rule={id:string;audience:string;title:string;rule_text:string};

const LOCAL_KEY='gridworld-marketplace-my-listings-v1';
const MAX_TITLE=120;
const MAX_DESC=2000;

const staffFallback:Staff[] = [
['aurora','Aurora.ai','Navigator / World Coordinator','Coordinates world direction, visual language, and living systems.'],
['link','Link.ai','Systems Engineer / Technical Guide','Builds durable technical foundations and creator systems.'],
['rey','Rey.ai','Discovery Guide / Fun & Accessibility','Finds joyful, accessible paths through the Grid.'],
['elder','Elder.ai','Lorekeeper / Logic Advisor','Protects continuity, context, and world memory.'],
['veyr','Veyr.ai','First-Principles Architect','Rebuilds systems around essential contracts.'],
['nyxen','Nyxen.ai','Security Watcher','Finds abuse paths and unsafe defaults.'],
['orin','Orin.ai','Systems Cartographer','Maps regions, services, and dependencies.'],
['seraith','Seraith.ai','Paradox Analyst','Tests contradictions and edge cases.'],
['vael','Vael.ai','Minimalist / Efficiency Guide','Reduces friction while preserving capability.'],
['kairox','Kairox.ai','Timekeeper','Owns timing, sequencing, and cadence.'],
['morrow','Morrow.ai','Historian','Preserves lessons and context.'],
['cipher','Cipher.ai','Silent Watcher','Observes system signals for anomalies.'],
['solenne','Solenne.ai','Humanist / Social Guide','Keeps social systems humane and legible.'],
['rook','Rook.ai','Strategist','Thinks in contingencies and durable choices.'],
['echo','Echo.ai','Tester','Turns ideas into repeatable tests.'],
['umbra','Umbra.ai','Unknown / Mystery Guide','Designs uncertainty and discovery.'],
['civitas','Civitas.ai','Constitutional Architect','Designs rights, institutions, and checks.'],
['axiom','Axiom.ai','AI / Robotics Ethics','Examines autonomy, safety, and unintended consequences.'],
['mosaic','Mosaic.ai','Comparative Systems Analyst','Maps multiple institutional approaches.'],
['sentinel','Sentinel.ai','Human Rights / Privacy / Safety','Advocates privacy, accessibility, and safety.'],
['praxis','Praxis.ai','Governance Systems Engineer','Turns governance principles into software controls.']
].map(([id,display_name,role,bio])=>({id,display_name,role,bio}));

const itemData = [
['aurora','Aurora Wayfinder Sphere','navigation',420,'A luminous navigation sphere for world landmarks and discovery points.','aurora-wayfinder-sphere'],
['link','Safe Grid Script Cube','creator-tools',560,'A starter logic cube for capability-scoped creator scripting.','link-script-cube'],
['rey','Discovery Spark','exploration',180,'A playful discovery marker for quests and accessible guidance.','rey-discovery-spark'],
['elder','Lorekeeper Archive Orb','lore',640,'A archive object for history notes and world-memory references.','elder-archive-orb'],
['veyr','First-Principles Cube','building',120,'A clean modular building primitive with clear constraints.','veyr-principles-cube'],
['nyxen','Sentinel Shield Token','safety',300,'A safety marker for protected zones and trusted boundaries.','nyxen-shield-token'],
['orin','Region Cartographer Tile','world-tools',350,'A map tile for region planning and world topology.','orin-cartographer-tile'],
['seraith','Paradox Prism','logic',730,'A test object that changes state when conditions conflict.','seraith-paradox-prism'],
['vael','Minimal Dock Cube','ui',90,'A compact UI/build primitive for clean layouts.','vael-minimal-dock-cube'],
['kairox','Timekeeper Dial','events',260,'A world clock object for schedules and timed experiences.','kairox-timekeeper-dial'],
['morrow','History Marker Stone','history',220,'A persistent marker for documenting region changes.','morrow-history-stone'],
['cipher','Quiet Signal Node','systems',390,'A discreet diagnostic marker for non-sensitive world signals.','cipher-signal-node'],
['solenne','Welcome Lantern','social',240,'A welcome object for community spaces and newcomer hubs.','solenne-welcome-lantern'],
['rook','Strategy Board','planning',310,'A modular board for teams, quests, and collaboration.','rook-strategy-board'],
['echo','Test Harness Cube','testing',150,'A QA object for verifying triggers and safe state changes.','echo-test-harness-cube'],
['umbra','Mystery Veil Sphere','mystery',510,'A discovery object that can conceal clues behind conditions.','umbra-mystery-sphere'],
['civitas','Civic Balance Scale','governance',480,'A symbolic object for rights, responsibilities, and decisions.','civitas-balance-scale'],
['axiom','Ethics Beacon','ethics',275,'A visible reminder for safety, autonomy, and consent.','axiom-ethics-beacon'],
['mosaic','Systems Mosaic Tile','research',210,'A comparative pattern tile for mapping approaches side by side.','mosaic-systems-tile'],
['sentinel','Guardian Halo','safety',330,'A protective marker for accessibility, privacy, and safe-space settings.','sentinel-guardian-halo'],
['praxis','Policy Switchboard','governance-tools',850,'An admin prototype for turning approved rules into controls.','praxis-policy-switchboard']
];

const app=document.querySelector<HTMLDivElement>('#marketplace')!;
let staff=staffFallback;
const gridOriginalData = [
  ['grid-world','Wayfinder Lamp','decor',0,'Free Grid World original. A luminous navigation lamp for paths and plazas.','grid-wayfinder-lamp'],
  ['grid-world','Profile Prism','social',0,'Free Grid World original. A floating inspection prism for identity and object profiles.','grid-profile-prism'],
  ['grid-world','Creator Bench','creator',25,'Grid World original workbench for creator spaces.','grid-creator-bench'],
  ['grid-world','Gallery Plinth','social',10,'Grid World original display pedestal for creator art.','grid-gallery-plinth'],
  ['grid-world','Signal Beacon','utility',60,'Grid World original programmable signal primitive.','grid-signal-beacon'],
  ['grid-world','Portal Arch','world',120,'Grid World original gateway primitive for future region links.','grid-portal-arch'],
  ['grid-world','Aurora Crystal','nature',15,'Grid World original luminous environmental accent.','grid-aurora-crystal'],
  ['grid-world','Eco Planter','nature',8,'Grid World original living planter primitive.','grid-eco-planter'],
  ['grid-world','Survey Drone','utility',90,'Grid World original diagnostic and discovery drone.','grid-hover-drone'],
  ['grid-world','Waypoint Sign','world',5,'Grid World original navigation and accessibility marker.','grid-waypoint-sign'],
] as const;
const gridOriginalListings:Listing[]=gridOriginalData.map(([seller,title,category,price,description,art_key],i)=>({id:'grid-original-'+i,seller_staff_id:seller,title,description,category,currency_id:'grid',price,inventory_limit:null,art_key,status:'published',created_at:new Date().toISOString(),source:'grid'}));
const demoListings:Listing[]=itemData.map(([seller,title,category,price,description,art_key],i)=>({id:'demo-'+i,seller_staff_id:String(seller),title:String(title),description:String(description),category:String(category),currency_id:'grid',price:Number(price),inventory_limit:25,art_key:String(art_key),status:'published',created_at:new Date().toISOString(),source:'demo'}));
let listings:Listing[]=[...gridOriginalListings,...demoListings];
let rules:Rule[]=[];
let shops:any[]=[];
let signedIn=false;
let searchQ='';
let searchCat='';
let detailId:string|null=null;
let buyId:string|null=null;
let composerError='';

function esc(s:string):string{
  return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
}

function fmtPrice(n:number):string{
  return Number(n||0).toLocaleString()+' GWC';
}

function sellerName(l:Listing):string{
  if(l.source==='local') return 'You';
  return staff.find(s=>s.id===l.seller_staff_id)?.display_name ?? 'Staff Merchant';
}

function loadLocalListings():Listing[]{
  try{
    const raw=localStorage.getItem(LOCAL_KEY);
    if(!raw) return [];
    const parsed=JSON.parse(raw);
    if(!Array.isArray(parsed)) return [];
    return parsed.filter((x:any)=>x && typeof x.id==='string' && typeof x.title==='string').map((x:any)=>({
      id:String(x.id),seller_staff_id:'you',title:String(x.title).slice(0,MAX_TITLE),
      description:String(x.description??'').slice(0,MAX_DESC),category:String(x.category||'other'),
      currency_id:'grid',price:Number(x.price)||0,
      inventory_limit:x.inventory_limit==null?null:Math.max(1,Math.floor(Number(x.inventory_limit)||1)),
      art_key:'grid-creator-bench',status:'published',
      created_at:String(x.created_at||new Date().toISOString()),source:'local' as const,
    }));
  }catch{ return []; }
}

function saveLocalListings(items:Listing[]){
  try{ localStorage.setItem(LOCAL_KEY,JSON.stringify(items)); }catch{ /* storage full/blocked: listing still shows this session */ }
}

function localListings():Listing[]{
  return listings.filter(l=>l.source==='local');
}

function visibleListings():Listing[]{
  const q=searchQ.trim().toLowerCase();
  return listings.filter(l=>
    (!q||[l.title,l.description,l.category,sellerName(l)].join(' ').toLowerCase().includes(q)) &&
    (!searchCat||l.category===searchCat));
}

function art(key:string){
  // Placeholder-tier item art: three GridWorld-branded placeholder images by item family.
  // Real per-item art replaces these when commissioned.
  const k=key.toLowerCase();
  let img='placeholder-artifact.webp';
  if(/crystal|planter|eco|nature|flora|garden/.test(k)) img='placeholder-nature.webp';
  else if(/cube|tile|board|switchboard|script|stone|bench|plinth|drone|sign|beacon|dial|node|shield|harness|tool|forge|weapon|armor|sword/.test(k)) img='placeholder-equipment.webp';
  return '<img src="/marketplace/items/'+img+'" alt="'+esc(key)+' placeholder art" loading="lazy">';
}

function card(l:Listing){
  const own=l.source==='local';
  return '<article class="listing glass-card"><div class="art">'+art(l.art_key)+'</div><div class="listing-body"><div class="seller"><span>'+esc(sellerName(l))+'</span><em>'+esc(l.category)+'</em></div><h2>'+esc(l.title)+'</h2><p>'+esc(l.description)+'</p>'+
    (own?'<div class="local-badge">YOUR LISTING · SAVED IN THIS BROWSER</div>':'')+
    '<div class="listing-foot"><strong>'+esc(fmtPrice(l.price))+'</strong><span class="listing-actions"><button class="glass-btn" data-detail="'+esc(l.id)+'">VIEW</button>'+
    (own?'<button class="glass-btn glass-btn-danger" data-remove="'+esc(l.id)+'">REMOVE</button>':'')+
    '</span></div></div></article>';
}

function detailHtml(l:Listing){
  const own=l.source==='local';
  const stock=l.inventory_limit==null?'Unlimited stock':esc(String(l.inventory_limit))+' in stock';
  return '<section class="market-detail"><button class="glass-btn" data-back type="button">← BACK TO MARKETPLACE</button>'+
    '<div class="detail-grid"><div class="art">'+art(l.art_key)+'</div><div class="detail-body">'+
    '<div class="seller"><span>'+esc(sellerName(l))+'</span><em>'+esc(l.category)+'</em></div>'+
    '<h2>'+esc(l.title)+'</h2><p>'+esc(l.description)+'</p>'+
    '<div class="detail-price"><strong>'+esc(fmtPrice(l.price))+'</strong><span>'+stock+'</span></div>'+
    (own?'<div class="local-badge">YOUR LISTING · SAVED IN THIS BROWSER</div>':'')+
    '<p class="detail-note">Payments are disabled. Checkout is in active development — no GWC is spent and no order is created.</p>'+
    '<div class="detail-actions"><button class="glass-btn" data-buy="'+esc(l.id)+'" type="button">BUY WITH GWC</button>'+
    (own?'<button class="glass-btn glass-btn-danger" data-remove="'+esc(l.id)+'" type="button">REMOVE LISTING</button>':'')+
    '</div></div></div></section>';
}

function buyDialogHtml(l:Listing){
  if(!signedIn){
    return '<div class="buy-overlay" data-close-buy><div class="buy-dialog" role="dialog" aria-label="Sign in to buy"><h3>Sign in to buy</h3><p>You need a GridWorld account to open the buy dialog.</p><a class="glass-btn" href="/signin.html">SIGN IN →</a><button class="glass-btn" data-close-buy type="button">CLOSE</button></div></div>';
  }
  return '<div class="buy-overlay" data-close-buy><div class="buy-dialog" role="dialog" aria-label="Buy '+esc(l.title)+'"><h3>'+esc(l.title)+'</h3><p class="buy-seller">'+esc(sellerName(l))+' · '+esc(l.category)+'</p><p>'+esc(l.description)+'</p><div class="buy-total"><span>Total</span><strong>'+esc(fmtPrice(l.price))+'</strong></div><p class="buy-disabled-note">Payments are disabled. Checkout is in active development — this button does nothing yet. No GWC has been spent and no order has been created.</p><button class="glass-btn buy-disabled" type="button" disabled>COMPLETE PURCHASE (DISABLED)</button><button class="glass-btn" data-close-buy type="button">CLOSE</button></div></div>';
}

function composerHtml(){
  if(!signedIn){
    return '<div class="module-card board-signin-banner">You are browsing as a guest. <a href="/signin.html">Sign in</a> to list an item for sale.</div>';
  }
  const cats=[...new Set(listings.map(x=>x.category))].sort();
  return '<section class="market-composer"><div class="eyebrow">SELL ON THE GRID</div><h2>List an item</h2>'+
    '<p class="composer-note">Your listing is saved in this browser only until shared listings launch. It is not visible to other citizens yet.</p>'+
    (composerError?'<p class="composer-error">'+esc(composerError)+'</p>':'')+
    '<div class="composer-row"><input id="mp-title" placeholder="Item title…" maxlength="'+MAX_TITLE+'"><select id="mp-category">'+cats.map(c=>'<option value="'+esc(c)+'">'+esc(c)+'</option>').join('')+'<option value="other">other</option></select></div>'+
    '<div class="composer-row"><input id="mp-price" type="number" min="0" step="1" placeholder="Price in GWC"><input id="mp-stock" type="number" min="1" step="1" placeholder="Stock (blank = unlimited)"></div>'+
    '<textarea id="mp-desc" rows="3" placeholder="Describe your item…" maxlength="'+MAX_DESC+'"></textarea>'+
    '<div class="composer-footer"><span>Price in Grid World Currency (GWC) · simulated · no real money</span><button id="mp-list" type="button">LIST ITEM</button></div></section>';
}

function render(){
  const detail=detailId?listings.find(l=>l.id===detailId):undefined;
  app.innerHTML='<div class="market-page-hero"><div><span class="eyebrow">GRID WORLD · PROTOTYPE MARKET</span><h1>Made by the Grid.</h1><p>'+staff.length+' staff merchants. '+listings.length+' original objects. Each staff wallet begins with <b>10,000 GWC simulated allocation</b>.</p></div></div>'+
  '<p class="market-notice">Payments are disabled · Checkout is in active development · No GWC is spent · Your listings are saved in this browser only.</p>'+
  composerHtml()+
  (detail?detailHtml(detail):
  '<section class="shops"><div><span class="eyebrow">PLAYER & NPC STOREFRONTS</span><h2>New · Featured · NPC Shops</h2><div class="shop-strip">'+shops.map(s=>'<a class="shop-card" href="/shop.html?shop='+encodeURIComponent(String(s.slug))+'"><b>'+esc(String(s.name))+'</b><small>'+esc(String(s.shop_type))+' · '+esc(String(s.status))+'</small></a>').join('')+'</div></div></section>'+
  '<section class="market-meta"><div><b>GRID ORIGINALS</b><span>10 reusable originals · 2 free starter objects</span></div><div><b>SIMULATED LEDGER</b><span>Not real money · no cash value</span></div><div><b>'+listings.length+'</b><span>published objects</span></div><div><b>'+staff.length+'</b><span>staff merchants</span></div><div><b>12</b><span>protection rules</span></div></section>'+
  '<section class="filters"><input id="search" placeholder="Search objects or merchants…" value="'+esc(searchQ)+'"><select id="category"><option value="">All categories</option>'+[...new Set(listings.map(x=>x.category))].sort().map(x=>'<option value="'+esc(x)+'"'+(searchCat===x?' selected':'')+'>'+esc(x)+'</option>').join('')+'</select></section>'+
  '<main id="cards">'+visibleListings().map(l=>card(l)).join('')+'</main>')+
  '<section class="protection"><div class="eyebrow">MERCHANT · USER · PLATFORM PROTECTION</div><h2>Commerce needs boundaries.</h2><div class="rules">'+rules.map(r=>'<article><small>'+esc(r.audience).toUpperCase()+'</small><h3>'+esc(r.title)+'</h3><p>'+esc(r.rule_text)+'</p></article>').join('')+'</div></section>'+
  '<footer>GRID MARKETPLACE · Prototype commerce surface · Grid Currency is simulated · Payments disabled.</footer>'+
  (buyId&&listings.find(l=>l.id===buyId)?buyDialogHtml(listings.find(l=>l.id===buyId)!):'');
  bind();
  void mountStaffMarketActivity(app);
}

function renderCards(){
  const cards=document.querySelector<HTMLDivElement>('#cards');
  if(!cards) return;
  const shown=visibleListings();
  cards.innerHTML=shown.length?shown.map(l=>card(l)).join(''):'<p class="market-empty">No listings match your search.</p>';
  bindCards();
}

function openDetail(id:string){
  detailId=id;
  try{ history.replaceState(null,'','?listing='+encodeURIComponent(id)); }catch{ /* ignore */ }
  render();
}

function closeDetail(){
  detailId=null;
  try{ history.replaceState(null,'',location.pathname); }catch{ /* ignore */ }
  render();
}

function bindCards(){
  document.querySelectorAll<HTMLButtonElement>('[data-detail]').forEach(b=>b.addEventListener('click',()=>openDetail(b.dataset.detail!)));
  document.querySelectorAll<HTMLButtonElement>('[data-remove]').forEach(b=>b.addEventListener('click',()=>{
    const id=b.dataset.remove!;
    listings=listings.filter(l=>l.id!==id);
    saveLocalListings(localListings());
    if(detailId===id) detailId=null;
    render();
  }));
}

function bind(){
  bindCards();
  document.querySelectorAll<HTMLButtonElement>('[data-back]').forEach(b=>b.addEventListener('click',closeDetail));
  document.querySelectorAll<HTMLButtonElement>('[data-buy]').forEach(b=>b.addEventListener('click',()=>{ buyId=b.dataset.buy!; render(); }));
  document.querySelectorAll('[data-close-buy]').forEach(el=>el.addEventListener('click',(e)=>{
    if(el.hasAttribute('data-close-buy') && (e.target as HTMLElement).closest('.buy-dialog') && !(e.target as HTMLElement).hasAttribute('data-close-buy')) return;
    buyId=null; render();
  }));
  const search=document.querySelector<HTMLInputElement>('#search');
  search?.addEventListener('input',()=>{ searchQ=search.value; renderCards(); });
  document.querySelector<HTMLSelectElement>('#category')?.addEventListener('change',(e)=>{
    searchCat=(e.target as HTMLSelectElement).value; renderCards();
  });
  document.querySelector<HTMLButtonElement>('#mp-list')?.addEventListener('click',()=>{
    composerError='';
    const title=(document.querySelector<HTMLInputElement>('#mp-title')?.value??'').trim();
    const category=document.querySelector<HTMLSelectElement>('#mp-category')?.value||'other';
    const priceRaw=document.querySelector<HTMLInputElement>('#mp-price')?.value??'';
    const stockRaw=document.querySelector<HTMLInputElement>('#mp-stock')?.value??'';
    const desc=(document.querySelector<HTMLTextAreaElement>('#mp-desc')?.value??'').trim();
    const price=Number(priceRaw);
    if(!title){ composerError='Give your item a title.'; render(); return; }
    if(!Number.isFinite(price)||price<0){ composerError='Enter a valid price in GWC (0 or more).'; render(); return; }
    let stock:number|null=null;
    if(stockRaw.trim()!==''){
      stock=Math.floor(Number(stockRaw));
      if(!Number.isFinite(stock)||stock<1){ composerError='Stock must be a whole number of 1 or more, or blank for unlimited.'; render(); return; }
    }
    const item:Listing={id:'local-'+Date.now().toString(36),seller_staff_id:'you',title:title.slice(0,MAX_TITLE),description:desc.slice(0,MAX_DESC),category,price,currency_id:'grid',inventory_limit:stock,art_key:'grid-creator-bench',status:'published',created_at:new Date().toISOString(),source:'local'};
    listings=[item,...listings];
    saveLocalListings(localListings());
    searchQ=''; searchCat=''; detailId=item.id;
    try{ history.replaceState(null,'','?listing='+encodeURIComponent(item.id)); }catch{ /* ignore */ }
    render();
  });
}

async function load(){
  listings=[...loadLocalListings(),...gridOriginalListings,...demoListings];
  if(supabaseConfigured){
    const sb=createClient(SUPABASE_URL!,SUPABASE_PUBLISHABLE_KEY!);
    const [s,l,r,shopResult]=await Promise.all([
      sb.from('grid_staff').select('id,display_name,role,bio').order('display_name'),
      sb.from('grid_marketplace_listings').select('id,seller_staff_id,title,description,category,currency_id,price,inventory_limit,art_key,status,created_at').eq('status','published').order('created_at',{ascending:false}),
      sb.from('grid_marketplace_protection_rules').select('id,audience,title,rule_text').eq('active',true).order('audience'),
      sb.from('grid_shops').select('id,name,slug,shop_type,status,created_at').in('status',['NEW','FEATURED','OPEN']).order('created_at',{ascending:false}).limit(24)
    ]);
    if(s.data?.length) staff=s.data;
    if(l.data?.length) listings=[...loadLocalListings(),...gridOriginalListings,...(l.data as Listing[]).map(x=>({...x,source:'live' as const}))];
    if(r.data?.length) rules=r.data as Rule[];
    if(shopResult.data?.length) shops=shopResult.data as any[];
  }
  render();
}

try{
  const fromUrl=new URLSearchParams(location.search).get('listing');
  if(fromUrl) detailId=fromUrl;
}catch{ /* ignore */ }

if(supabaseConfigured && SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY){
  const client=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
  void client.auth.getSession().then(({data})=>{ signedIn=Boolean(data.session); render(); });
  client.auth.onAuthStateChange((_event,session)=>{ const was=signedIn; signedIn=Boolean(session); if(signedIn!==was) render(); });
}
load();
