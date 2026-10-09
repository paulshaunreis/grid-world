import './avatar-concepts.css';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, supabaseConfigured } from './persistence/config';

type Concept={id:string;life_stage:string;age_band:string;gender_identity:string;presentation:string;pronouns:string|null;concept_title:string;visual_direction:string;art_key:string};

const fallback:Concept[] = [
  {id:'fallback-baby',life_stage:'baby',age_band:'0–2',gender_identity:'non-binary',presentation:'varied',pronouns:'they/them',concept_title:'First Light Baby',visual_direction:'Age-appropriate soft explorer concept.',art_key:'avatar-concept.baby.1'}
];

const app=document.querySelector<HTMLDivElement>('#avatars')!;
let concepts:Concept[]=fallback;

function portrait(c:Concept){
  return `<div class="portrait"><img src="/avatars/stage-${c.life_stage}.webp" alt="${c.concept_title} portrait" loading="lazy" onerror="this.style.display='none'"><span class="sigil">${c.art_key}</span></div>`;
}
function render(){
  const stages=[...new Set(concepts.map(c=>c.life_stage))];
  const genders=[...new Set(concepts.map(c=>c.gender_identity))];
  app.innerHTML=`<div class="page">
    <header class="top"><div><div class="eyebrow">GRID WORLD · AVATAR CONCEPT LIBRARY</div><h1>Every stage.<br>Every identity.</h1><p>A flexible, age-appropriate avatar system. Gender identity and presentation are separate design dimensions, so people can describe themselves without being forced into a fixed visual template. This catalog is extensible rather than claiming to enumerate every identity.</p></div></header>
    <section class="filters">
      <select id="stage"><option value="">All life stages</option>${stages.map(x=>`<option>${x}</option>`).join('')}</select>
      <select id="gender"><option value="">All gender identities</option>${genders.map(x=>`<option>${x}</option>`).join('')}</select>
      <select id="presentation"><option value="">All presentations</option><option>masculine</option><option>feminine</option><option>androgynous</option><option>varied</option></select>
    </section>
    <div class="meta"><b>${concepts.length} concepts</b><b>7 life stages</b><b>${genders.length} identity templates</b><b>age-appropriate by design</b></div>
    <main class="grid" id="grid"></main>
    <section class="note"><strong>Concept-art pipeline:</strong> concept board → character sheet → modular body/head/hair/clothing assets → creator customization → moderation → published avatar version. Children and teen concepts remain non-sexualized and age-appropriate. Pronouns are optional profile metadata; identity labels are not used as permission or safety decisions.</section>
  </div>`;
  document.querySelectorAll('select').forEach(x=>x.addEventListener('change',filter)); filter();
}
function filter(){
  const stage=(document.querySelector<HTMLSelectElement>('#stage')?.value??'');
  const gender=(document.querySelector<HTMLSelectElement>('#gender')?.value??'');
  const presentation=(document.querySelector<HTMLSelectElement>('#presentation')?.value??'');
  const list=concepts.filter(c=>(!stage||c.life_stage===stage)&&(!gender||c.gender_identity===gender)&&(!presentation||c.presentation===presentation));
  document.querySelector<HTMLDivElement>('#grid')!.innerHTML=list.map(c=>`<article class="card">${portrait(c)}<div class="copy"><h2>${c.concept_title}</h2><p>${c.visual_direction}</p><div class="chips"><span class="chip">${c.life_stage} · ${c.age_band}</span><span class="chip">${c.gender_identity}</span><span class="chip">${c.presentation}</span>${c.pronouns?`<span class="chip">${c.pronouns}</span>`:''}</div></div></article>`).join('');
}
async function load(){
  if(supabaseConfigured){
    const sb=createClient(SUPABASE_URL!,SUPABASE_PUBLISHABLE_KEY!);
    const {data}=await sb.from('grid_avatar_concepts').select('id,life_stage,age_band,gender_identity,presentation,pronouns,concept_title,visual_direction,art_key').eq('moderation_state','approved').neq('rights_status','blocked').order('life_stage').order('gender_identity');
    if(data?.length) concepts=data as Concept[];
  }
  render();
}
load();