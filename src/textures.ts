import { GRID_PBR_SOURCES } from './engine/GridPBRLibrary';
import './textures.css';

const app=document.querySelector('#texture-app')!;
let family='all'; let query='';
const families=['all','ground','stone','wood','metal','foliage','fabric','technical'];
function render(){
 const list=GRID_PBR_SOURCES.filter(x=>(family==='all'||x.family===family)&&((x.name+' '+x.source+' '+x.family).toLowerCase().includes(query.toLowerCase())));
 app.innerHTML='<main class="page"><div class="kicker">GRID OMNI ARCHIVE // MATERIALS</div><h1>PBR Library</h1><p>A curated starter library for terrain, architecture, avatars, wildlife, creator objects, and technical surfaces. External entries are catalogued by source and license; Grid World uses them as replaceable asset references, not as hard-coded world dependencies.</p><div class="toolbar"><input id="search" placeholder="Search materials…" value="'+query.replace(/"/g,'&quot;')+'">'+families.map(f=>'<button class="'+(f===family?'active':'')+'" data-family="'+f+'">'+f.toUpperCase()+'</button>').join('')+'</div><section class="grid">'+list.map(x=>'<article class="card"><div class="swatch"></div><div class="name">'+x.name+'</div><div class="meta">'+x.family.toUpperCase()+' · '+x.source+' · '+x.license+'</div><div class="maps">'+x.maps.join(' · ')+'</div><a class="source" target="_blank" rel="noreferrer" href="'+x.url+'">SOURCE ↗</a></article>').join('')+'</section><div class="note">Starter runtime materials are procedural and lightweight. When local 1K/2K map packs are added, the same IDs can point to real albedo/normal/roughness/height assets without changing world objects.</div></main>';
 document.querySelector<HTMLInputElement>('#search')?.addEventListener('input',e=>{query=(e.target as HTMLInputElement).value;render()});
 document.querySelectorAll('[data-family]').forEach(b=>b.addEventListener('click',()=>{family=(b as HTMLButtonElement).dataset.family!;render()}));
}
render();