import './shop.css';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, supabaseConfigured } from './persistence/config';
const app=document.querySelector<HTMLDivElement>('#shop-app')!;
const sb=supabaseConfigured?createClient(SUPABASE_URL!,SUPABASE_PUBLISHABLE_KEY!):null;
const q=new URLSearchParams(location.search); const slug=q.get('shop')||'';
let shop:any=null;
const esc=(v:any)=>String(v??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]!));
async function load(){if(sb&&slug){const {data}=await sb.from('grid_shops').select('*,grid_shop_listings(*)').eq('slug',slug).maybeSingle();shop=data;}render();}
function render(){
 if(!shop){app.innerHTML='<main class="empty"><a href="/profile.html">PROFILE</a><h1>SHOP STUDIO</h1><p>Create or open a shop from your Grid World profile.</p></main>';return;}
 const a=shop.appearance||{}; app.innerHTML='<header><a href="/profile.html">PROFILE</a><span>GRID SHOP</span></header><main class="shop '+esc(a.theme)+'" style="--accent:'+esc(a.accent||'#48e7ff')+'"><section class="hero"><small>'+esc(shop.shop_type)+'</small><h1>'+esc(shop.name)+'</h1><p>'+esc(shop.description)+'</p></section><section class="controls"><h2>SHOP APPEARANCE</h2><label>Theme <select id="theme"><option>aurora</option><option>studio</option><option>garden</option><option>terminal</option><option>void</option></select></label><label>Accent <input id="accent" value="'+esc(a.accent||'#48e7ff')+'"></label><label>Layout <select id="layout"><option>showcase</option><option>market</option><option>gallery</option><option>terminal</option></select></label><button id="save">SAVE SHOP APPEARANCE</button><a class="shop-link" href="/shop.html?shop='+encodeURIComponent(shop.slug)+'">PUBLIC SHOP LINK ↗</a></section><section><h2>SHOP INVENTORY</h2><div class="items">'+((shop.grid_shop_listings||[]).map((x:any)=>'<article><b>'+esc(x.title)+'</b><span>'+Number(x.price).toLocaleString()+' '+esc(x.currency_id)+'</span></article>').join('')||'<p>Your storefront is ready for listings.</p>')+'</div></section></main>';
 const theme=document.querySelector<HTMLSelectElement>('#theme')!,accent=document.querySelector<HTMLInputElement>('#accent')!,layout=document.querySelector<HTMLSelectElement>('#layout')!; theme.value=a.theme||'aurora';layout.value=a.layout||'showcase';
 document.querySelector<HTMLButtonElement>('#save')?.addEventListener('click',async()=>{if(!sb)return;const {error}=await sb.from('grid_shops').update({appearance:{theme:theme.value,accent:accent.value,layout:layout.value},updated_at:new Date().toISOString()}).eq('id',shop.id);if(!error){shop.appearance={theme:theme.value,accent:accent.value,layout:layout.value};render();}});
}
load();