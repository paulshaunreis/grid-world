import './marketplace.css';
import { mountStaffMarketActivity } from './marketplace-activity';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, supabaseConfigured } from './persistence/config';

type Listing={id:string;seller_staff_id:string;title:string;description:string;category:string;currency_id:string;price:number;inventory_limit:number|null;art_key:string;status:string;created_at:string};
type Staff={id:string;display_name:string;role:string;bio:string};
type Rule={id:string;audience:string;title:string;rule_text:string};

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
['elder','Lorekeeper Archive Orb','lore',640,'An archive object for history notes and world-memory references.','elder-archive-orb'],
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
const gridOriginalListings:Listing[]=gridOriginalData.map(([seller,title,category,price,description,art_key],i)=>({id:'grid-original-'+i,seller_staff_id:seller,title,description,category,currency_id:'grid',price,inventory_limit:null,art_key,status:'published',created_at:new Date().toISOString()}));
let listings:Listing[]=[...gridOriginalListings,...itemData.map(([seller,title,category,price,description,art_key],i)=>({id:'demo-'+i,seller_staff_id:String(seller),title:String(title),description:String(description),category:String(category),currency_id:'grid',price:Number(price),inventory_limit:25,art_key:String(art_key),status:'published',created_at:new Date().toISOString()}))];
let rules:Rule[]=[];
let shops:any[]=[];

function art(key:string){
  const palette:{[k:string]:[string,string]}={aurora:['#8ff7ff','#3044ff'],link:['#b9ffcf','#4b5cff'],rey:['#ffe38a','#ff6d9a'],elder:['#d8c1ff','#6c4cff'],veyr:['#f4f7ff','#64748b'],nyxen:['#b9c8ff','#233f9f'],orin:['#9fe8ff','#1d7897'],seraith:['#f4b7ff','#7a2e9a'],vael:['#f0f0f0','#444'],kairox:['#ffd6a1','#a55b22'],morrow:['#d7b78b','#654b35'],cipher:['#c9d8e0','#31515f'],solenne:['#ffe8a7','#d87831'],rook:['#c5d0ff','#394d91'],echo:['#d2ffd9','#39824e'],umbra:['#d8c9ff','#32205f'],civitas:['#ffe7b8','#7e5a22'],axiom:['#b8fff2','#1c8174'],mosaic:['#ffb9df','#6d3f76'],sentinel:['#c8d7ff','#344a9a'],praxis:['#d7fff0','#24614e']};
  const [a,b]=palette[key.split('-')[0]]??['#dff','#345'];
  const cube=/cube|tile|board|switchboard|stone/.test(key);
  const core=cube?'<rect x="72" y="58" width="96" height="96" rx="12" transform="rotate(12 120 106)" fill="none" stroke="'+a+'" stroke-width="5"/><path d="M72 86l96 30M96 62l48 96" stroke="'+b+'" stroke-width="3"/>':'<circle cx="120" cy="106" r="48" fill="none" stroke="'+a+'" stroke-width="5"/><circle cx="120" cy="106" r="24" fill="'+b+'" opacity=".65"/><path d="M48 106h144M120 34v144" stroke="'+a+'" stroke-width="2" opacity=".8"/>';
  return '<svg viewBox="0 0 240 190" role="img" aria-label="'+key+' artwork"><defs><radialGradient id="g"><stop stop-color="'+a+'"/><stop offset="1" stop-color="'+b+'"/></radialGradient></defs><rect width="240" height="190" rx="22" fill="#080b14"/><circle cx="120" cy="95" r="72" fill="url(#g)" opacity=".13"/>'+core+'<text x="120" y="174" text-anchor="middle" fill="#aab6c9" font-size="10" font-family="monospace" letter-spacing="2">GRID OBJECT STUDY</text></svg>';
}

function render(){
  const people=new Map(staff.map(s=>[s.id,s]));
  app.innerHTML='<header><div><span class="eyebrow">GRID WORLD · LIVE PROTOTYPE MARKET</span><h1>Made by the Grid.</h1><p>21 staff merchants. 21 original object studies. Each staff wallet begins with <b>10,000 GRD simulated allocation</b>.</p></div><nav><a href="/">WORLD</a><a href="/economics.html">ECONOMICS</a><a href="/directory.html">STAFF</a><a href="/docs.html">DOCS</a></nav></header>'+
  '<section class="shops"><div><span class="eyebrow">PLAYER & NPC STOREFRONTS</span><h2>New · Featured · NPC Shops</h2><div class="shop-strip">'+shops.map(s=>'<a class="shop-card" href="/shop.html?shop='+encodeURIComponent(s.slug)+'"><b>'+String(s.name)+'</b><small>'+String(s.shop_type)+' · '+String(s.status)+'</small></a>').join('')+'</div></div></section>'+
  '<section class="shops"><div><span class="eyebrow">PLAYER & NPC STOREFRONTS</span><h2>New · Featured · NPC Shops</h2><div class="shop-strip">'+shops.map(s=>'<a class="shop-card" href="/shop.html?shop='+encodeURIComponent(s.slug)+'"><b>'+String(s.name)+'</b><small>'+String(s.shop_type)+' · '+String(s.status)+'</small></a>').join('')+'</div></div></section>'+'<section class="market-meta"><div><b>GRID ORIGINALS</b><span>10 reusable originals · 2 free starter objects</span></div><div><b>SIMULATED LEDGER</b><span>Not real money · no cash value</span></div><div><b>'+listings.length+'</b><span>published objects</span></div><div><b>'+staff.length+'</b><span>staff merchants</span></div><div><b>12</b><span>protection rules</span></div></section>'+
  '<section class="filters"><input id="search" placeholder="Search objects or merchants…"><select id="category"><option value="">All categories</option>'+[...new Set(listings.map(x=>x.category))].sort().map(x=>'<option>'+x+'</option>').join('')+'</select></section>'+
  '<main id="cards">'+listings.map(l=>card(l,people.get(l.seller_staff_id))).join('')+'</main>'+
  '<section class="protection"><div class="eyebrow">MERCHANT · USER · PLATFORM PROTECTION</div><h2>Commerce needs boundaries.</h2><div class="rules">'+rules.map(r=>'<article><small>'+r.audience.toUpperCase()+'</small><h3>'+r.title+'</h3><p>'+r.rule_text+'</p></article>').join('')+'</div></section>'+
  '<footer>GRID MARKETPLACE · Prototype commerce surface · Grid Currency is simulated.</footer>';
  document.querySelector<HTMLInputElement>('#search')?.addEventListener('input',filter);
  document.querySelector<HTMLSelectElement>('#category')?.addEventListener('change',filter);
  document.querySelectorAll<HTMLButtonElement>('[data-buy]').forEach(b=>b.addEventListener('click',()=>alert('Purchase flow is protected until authenticated wallet + server settlement are enabled.')));
}
function card(l:Listing,s?:Staff){
  return '<article class="listing"><div class="art">'+art(l.art_key)+'</div><div class="listing-body"><div class="seller"><span>'+((s?.display_name??'Staff Merchant'))+'</span><em>'+l.category+'</em></div><h2>'+l.title+'</h2><p>'+l.description+'</p><div class="listing-foot"><strong>'+l.price.toLocaleString()+' GRD</strong><button data-buy="'+l.id+'">VIEW / BUY</button></div></div></article>';
}
function filter(){const q=(document.querySelector<HTMLInputElement>('#search')?.value??'').toLowerCase();const c=document.querySelector<HTMLSelectElement>('#category')?.value??'';const cards=document.querySelector<HTMLDivElement>('#cards');if(!cards)return;const people=new Map(staff.map(s=>[s.id,s]));cards.innerHTML=listings.filter(l=>(!q||[l.title,l.description,l.category,people.get(l.seller_staff_id)?.display_name].join(' ').toLowerCase().includes(q))&&(!c||l.category===c)).map(l=>card(l,people.get(l.seller_staff_id))).join('');document.querySelectorAll<HTMLButtonElement>('[data-buy]').forEach(b=>b.addEventListener('click',()=>alert('Purchase flow is protected until authenticated wallet + server settlement are enabled.')));}
async function load(){
  if(supabaseConfigured){
    const sb=createClient(SUPABASE_URL!,SUPABASE_PUBLISHABLE_KEY!);
    const [s,l,r,shopResult]=await Promise.all([
      sb.from('grid_staff').select('id,display_name,role,bio').order('display_name'),
      sb.from('grid_marketplace_listings').select('id,seller_staff_id,title,description,category,currency_id,price,inventory_limit,art_key,status,created_at').eq('status','published').order('created_at',{ascending:false}),
      sb.from('grid_marketplace_protection_rules').select('id,audience,title,rule_text').eq('active',true).order('audience'),
      sb.from('grid_shops').select('id,name,slug,shop_type,status,created_at').in('status',['NEW','FEATURED','OPEN']).order('created_at',{ascending:false}).limit(24)
    ]);
    if(s.data?.length) staff=s.data;
    if(l.data?.length) listings=[...gridOriginalListings,...(l.data as Listing[])];
    if(r.data?.length) rules=r.data as Rule[];
    if(shopResult.data?.length) shops=shopResult.data as any[];
  }
  render();
  void mountStaffMarketActivity(app);
}
load();
