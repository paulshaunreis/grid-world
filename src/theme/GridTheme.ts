/* GridTheme — single source of truth for Grid World UI accent theming.
 *
 * One accent color drives every surface:
 *   --gw-accent / --gw-accent-text / --gw-accent-faint / --gw-accent-dim /
 *   --gw-accent-border / --gw-accent-glow   (web surfaces: marketplace, site)
 *   --hud-rgb                               (3D engine HUD — the whole engine
 *                                            already tints off this variable)
 *
 * UI skins are curated named accents sold on the marketplace for simulated
 * GRC. Buying a skin unlocks it; applying a skin sets the live accent.
 * Everything persists in localStorage; nothing here touches real money.
 */

export interface GridSwatch{ id:string; name:string; hex:string; requiresSkin?:string; }
export interface GridSkin{
  id:string; name:string; creator:string;
  priceGRC:number; accent:string; description:string; starter?:boolean; limited?:boolean;
}

/* ---------------- seasonal holiday themes ----------------
 * Each preset carries a date window (inclusive, month/day) and a set of
 * limited-time skins that are only buyable while the window is active.
 * Windows may wrap the new year (e.g. Dec 15 -> Jan 2). When windows
 * overlap, the LATER entry in SEASONAL_PRESETS wins. Add future holidays
 * by appending a new entry in the same shape. */
export interface SeasonalPreset{
  id:string; name:string; emoji:string; accent:string;
  startMonth:number; startDay:number; endMonth:number; endDay:number;
  skins:GridSkin[];
}
export const SEASONAL_PRESETS:SeasonalPreset[]=[
  { id:'halloween', name:'Halloween', emoji:'🎃', accent:'#ff7a1a',
    startMonth:10, startDay:15, endMonth:11, endDay:2,
    skins:[
      {id:'pumpkin-signal', name:'Pumpkin Signal', creator:'Grid World', priceGRC:800,
       accent:'#ff7a1a', description:'LIMITED — Halloween only. Pumpkin glow for haunted builds. Vanishes Nov 3.', limited:true},
      {id:'ghost-violet', name:'Ghost Violet', creator:'Grid World', priceGRC:800,
       accent:'#b06bff', description:'LIMITED — Halloween only. Spectral violet, straight from the other side. Vanishes Nov 3.', limited:true},
    ]},
  { id:'christmas', name:'Christmas', emoji:'🎄', accent:'#ff3b3b',
    startMonth:12, startDay:15, endMonth:1, endDay:2,
    skins:[
      {id:'holly-signal', name:'Holly Signal', creator:'Grid World', priceGRC:800,
       accent:'#ff3b3b', description:'LIMITED — Christmas only. Holly-red glow for winter builds. Vanishes Jan 3.', limited:true},
      {id:'tinsel-teal', name:'Tinsel Teal', creator:'Grid World', priceGRC:800,
       accent:'#4be1c3', description:'LIMITED — Christmas only. Frosty teal tinsel. Vanishes Jan 3.', limited:true},
    ]},
  { id:'new-year', name:'New Year', emoji:'🎆', accent:'#ffce4a',
    startMonth:12, startDay:28, endMonth:1, endDay:5,
    skins:[
      {id:'countdown-gold', name:'Countdown Gold', creator:'Grid World', priceGRC:900,
       accent:'#ffce4a', description:'LIMITED — New Year only. Champagne gold for fresh starts. Vanishes Jan 6.', limited:true},
      {id:'firework-violet', name:'Firework Violet', creator:'Grid World', priceGRC:900,
       accent:'#c07bff', description:'LIMITED — New Year only. Firework violet over midnight. Vanishes Jan 6.', limited:true},
    ]},
];

function inSeasonWindow(p:SeasonalPreset,month:number,day:number):boolean{
  const sm=p.startMonth, sd=p.startDay, em=p.endMonth, ed=p.endDay;
  if(sm<em||(sm===em&&sd<=ed)){
    if(month<sm||month>em) return false;
    if(month===sm&&day<sd) return false;
    if(month===em&&day>ed) return false;
    return true;
  }
  /* Wraps the new year: [start .. Dec 31] or [Jan 1 .. end]. */
  if(month>sm||month<em) return true;
  if(month===sm) return day>=sd;
  if(month===em) return day<=ed;
  return false;
}

/** The seasonal preset whose window contains `date` (later entries win ties). */
export function activeSeasonalPreset(date:Date=new Date()):SeasonalPreset|null{
  const m=date.getMonth()+1, d=date.getDate();
  let hit:SeasonalPreset|null=null;
  for(const p of SEASONAL_PRESETS) if(inSeasonWindow(p,m,d)) hit=p;
  return hit;
}

/** All buyable skins right now: the standing catalog + active seasonal drops. */
export function getAllSkins():GridSkin[]{
  const seasonal=activeSeasonalPreset();
  if(!seasonal) return GRID_SKINS;
  const ids=new Set(GRID_SKINS.map(s=>s.id));
  return [...GRID_SKINS,...seasonal.skins.filter(s=>!ids.has(s.id))];
}

/* Personalization palette: 4 free accents, 4 unlockable via marketplace skins. */
export const GRID_SWATCHES:GridSwatch[]=[
  {id:'cyan',   name:'Cyan',   hex:'#2ce8ff'},
  {id:'violet', name:'Violet', hex:'#a569ff'},
  {id:'white',  name:'White',  hex:'#ebf5ff'},
  {id:'gold',   name:'Gold',   hex:'#ffd166'},
  {id:'magenta',name:'Magenta',hex:'#ff4abe', requiresSkin:'neon-magenta'},
  {id:'acid',   name:'Acid',   hex:'#7dff6a', requiresSkin:'acid-green'},
  {id:'magma',  name:'Magma',  hex:'#ff5a3c', requiresSkin:'magma-core'},
  {id:'ember',  name:'Ember',  hex:'#ff9e5e', requiresSkin:'solar-orange'},
];

/* Buyable curated skins — the category is never empty. */
export const GRID_SKINS:GridSkin[]=[
  {id:'cyan-pulse', name:'Cyan Pulse', creator:'Grid World', priceGRC:0,
   accent:'#2ce8ff', description:'The default Grid signal. Clean, calm, always online.', starter:true},
  {id:'violet-rift', name:'Violet Rift', creator:'Grid World', priceGRC:750,
   accent:'#a569ff', description:'Deep-space violet for night-shift builders.'},
  {id:'magma-core', name:'Magma Core', creator:'Grid World', priceGRC:1200,
   accent:'#ff5a3c', description:'Molten red-orange for high-energy worlds.'},
  {id:'ghost-white', name:'Ghost White', creator:'Grid World', priceGRC:900,
   accent:'#ebf5ff', description:'Minimal monochrome. Nothing to hide.'},
  {id:'acid-green', name:'Acid Green', creator:'Grid World', priceGRC:1100,
   accent:'#7dff6a', description:'High-voltage green for the bold.'},
  {id:'ember-gold', name:'Ember Gold', creator:'Grid World', priceGRC:1500,
   accent:'#ffd166', description:'Warm gold with a premium glow.'},
  {id:'neon-magenta', name:'Neon Magenta', creator:'Grid World', priceGRC:1000,
   accent:'#ff4abe', description:'Hot magenta for after-hours energy.'},
  {id:'solar-orange', name:'Solar Orange', creator:'Grid World', priceGRC:950,
   accent:'#ff9e5e', description:'Warm solar orange, straight off the grid.'},
];

const K_ACCENT='gw-accent';
const K_SKIN='gw-active-skin';
const K_OWNED='gw-owned-skins';
const K_BAL='gw-grc-balance';
const K_SEASON='gw-follow-seasons';
const LEGACY_HUD='grid-world:hud-theme';
/* Engine's pre-existing hud-theme ids -> accent hex (for migration). */
const LEGACY_HEX:Record<string,string>={
  cyan:'#2ce8ff', violet:'#a569ff', magenta:'#ff4abe',
  emerald:'#3cffb4', amber:'#ffbe46', white:'#ebf5ff',
};
const DEFAULT_HEX='#2ce8ff';
const DEFAULT_BALANCE=10000;

function lsGet(k:string):string|null{ try{return localStorage.getItem(k);}catch{return null;} }
function lsSet(k:string,v:string){ try{localStorage.setItem(k,v);}catch{/* private mode */} }
function lsDel(k:string){ try{localStorage.removeItem(k);}catch{/* private mode */} }

function hexToRgb(hex:string):[number,number,number]{
  const h=hex.replace('#','');
  const v=h.length===3?h.split('').map(c=>c+c).join(''):h;
  const n=parseInt(v,16);
  return [(n>>16)&255,(n>>8)&255,n&255];
}
function mix(hexA:string,hexB:string,t:number):string{
  const a=hexToRgb(hexA), b=hexToRgb(hexB);
  const c=a.map((v,i)=>Math.round(v+(b[i]-v)*t));
  return '#'+c.map(v=>v.toString(16).padStart(2,'0')).join('');
}

let lastHex=DEFAULT_HEX;

/** Apply an accent live across web surfaces AND the 3D engine HUD. */
export function applyAccent(hex:string):void{
  const [r,g,b]=hexToRgb(hex);
  const rgb=`${r}, ${g}, ${b}`;
  const root=document.documentElement;
  root.style.setProperty('--gw-accent',hex);
  root.style.setProperty('--gw-accent-rgb',rgb);
  root.style.setProperty('--gw-accent-text',mix(hex,'#ffffff',0.55));
  root.style.setProperty('--gw-accent-faint',`rgba(${rgb},.07)`);
  root.style.setProperty('--gw-accent-dim',`rgba(${rgb},.14)`);
  root.style.setProperty('--gw-accent-border',`rgba(${rgb},.38)`);
  root.style.setProperty('--gw-accent-glow',`0 0 18px rgba(${rgb},.35)`);
  /* Engine compat: the entire 3D HUD already tints off --hud-rgb. */
  root.style.setProperty('--hud-rgb',rgb);
  const engineId=Object.keys(LEGACY_HEX).find(k=>LEGACY_HEX[k].toLowerCase()===hex.toLowerCase());
  if(engineId) root.dataset.hudTheme=engineId; else delete root.dataset.hudTheme;
  lastHex=hex;
}

/** A palette swatch is usable when free, or when its required skin is owned. */
export function isSwatchUnlocked(swatch:GridSwatch):boolean{
  if(!swatch.requiresSkin) return true;
  return getOwnedSkins().includes(swatch.requiresSkin);
}
export function swatchByHex(hex:string):GridSwatch|undefined{
  return GRID_SWATCHES.find(s=>s.hex.toLowerCase()===hex.toLowerCase());
}

/** Apply a free-form accent (palette swatch or custom color). Not a skin.
 *  Returns false when the swatch is locked behind an unowned skin.
 *  A manual pick opts out of seasonal follow (re-enable in Settings). */
export function applyCustomAccent(hex:string):boolean{
  const swatch=swatchByHex(hex);
  if(swatch&&!isSwatchUnlocked(swatch)) return false;
  applyAccent(hex);
  lsSet(K_ACCENT,hex);
  lsDel(K_SKIN);
  setFollowSeasons(false);
  return true;
}

/** Apply an owned skin as the active UI theme. Manual pick opts out of seasonal follow. */
export function applySkin(skinId:string):boolean{
  const skin=getAllSkins().find(s=>s.id===skinId);
  if(!skin||!getOwnedSkins().includes(skinId)) return false;
  applyAccent(skin.accent);
  lsSet(K_SKIN,skinId);
  lsSet(K_ACCENT,skin.accent);
  setFollowSeasons(false);
  return true;
}

export function activeSkinId():string|null{ return lsGet(K_SKIN); }
export function currentAccentHex():string{ return lastHex; }

/* ---------------- seasonal follow ----------------
 * Default ON: while a holiday window is active the seasonal accent applies
 * automatically (ephemerally — it never overwrites the user's saved accent,
 * so when the window ends their own theme comes back). Any manual accent or
 * skin pick turns follow off; the Settings toggle turns it back on. */
export function followSeasons():boolean{ return lsGet(K_SEASON)!=='0'; }
export function setFollowSeasons(on:boolean):void{
  if(on) lsDel(K_SEASON); else lsSet(K_SEASON,'0');
}
/** The seasonal preset currently driving the theme, if follow is on and a window is active. */
export function currentSeason(date:Date=new Date()):SeasonalPreset|null{
  if(!followSeasons()) return null;
  return activeSeasonalPreset(date);
}

/** Re-read persisted theme and apply it (used at boot and on cross-tab sync). */
export function initTheme():void{
  const season=currentSeason();
  if(season){ applyAccent(season.accent); return; }
  const skinId=lsGet(K_SKIN);
  const allSkins=getAllSkins();
  if(skinId&&allSkins.some(s=>s.id===skinId)&&getOwnedSkins().includes(skinId)){
    applyAccent(allSkins.find(s=>s.id===skinId)!.accent);
    return;
  }
  const hex=lsGet(K_ACCENT);
  if(hex&&/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)){ applyAccent(hex); return; }
  const legacy=lsGet(LEGACY_HUD);
  if(legacy&&LEGACY_HEX[legacy]){ applyAccent(LEGACY_HEX[legacy]); return; }
  applyAccent(DEFAULT_HEX);
}

/* ---------------- live cross-tab sync ----------------
 * localStorage 'storage' events fire in every OTHER same-origin tab when one
 * tab writes a theme key. Wiring this at boot gives live two-way sync: change
 * the accent on the website and the game UI follows instantly, and vice versa.
 * (Same-origin only — tabs on different origins have separate storage.) */
const THEME_SYNC_KEYS=[K_ACCENT,K_SKIN,K_OWNED,K_SEASON] as const;
export function startThemeSync(onChange?:()=>void):void{
  window.addEventListener('storage',(e)=>{
    if(e.key&&!(THEME_SYNC_KEYS as readonly string[]).includes(e.key)) return;
    initTheme();
    try{onChange?.();}catch{/* UI refresh is best-effort */}
  });
}

/* ---------------- simulated GRC wallet (fictional, no cash value) ---------------- */
export function getBalance():number{
  const raw=lsGet(K_BAL);
  const n=raw==null?NaN:parseInt(raw,10);
  if(isNaN(n)){ lsSet(K_BAL,String(DEFAULT_BALANCE)); return DEFAULT_BALANCE; }
  return n;
}
export function setBalance(n:number):void{ lsSet(K_BAL,String(Math.max(0,Math.floor(n)))); }

/* ---------------- owned skins ---------------- */
export function getOwnedSkins():string[]{
  try{
    const raw=lsGet(K_OWNED);
    if(!raw){ lsSet(K_OWNED,JSON.stringify(['cyan-pulse'])); return ['cyan-pulse']; }
    const arr=JSON.parse(raw);
    return Array.isArray(arr)?arr.filter(x=>typeof x==='string'):[ 'cyan-pulse' ];
  }catch{ return ['cyan-pulse']; }
}
export function ownSkin(id:string):void{
  const owned=getOwnedSkins();
  if(!owned.includes(id)){ owned.push(id); lsSet(K_OWNED,JSON.stringify(owned)); }
}

/** Buy a skin with simulated GRC. Returns 'ok' | 'owned' | 'funds'. */
export function buySkin(skinId:string):'ok'|'owned'|'funds'{
  const skin=getAllSkins().find(s=>s.id===skinId);
  if(!skin) return 'owned';
  if(getOwnedSkins().includes(skinId)) return 'owned';
  const bal=getBalance();
  if(bal<skin.priceGRC) return 'funds';
  setBalance(bal-skin.priceGRC);
  ownSkin(skinId);
  applySkin(skinId);
  return 'ok';
}
