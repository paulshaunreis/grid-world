import './ring-studio.css';
import { compileGridRing, GridRingPackage } from './scripting/GridRing';

const editor=document.querySelector<HTMLTextAreaElement>('#code-editor')!;
const caps=document.querySelector<HTMLDivElement>('#capabilities')!;
const diagnostics=document.querySelector<HTMLSpanElement>('#diagnostics')!;
const capCount=document.querySelector<HTMLElement>('#cap-count')!;
const runtime=document.querySelector<HTMLElement>('#runtime-state')!;
const packagePreview=document.querySelector<HTMLPreElement>('#package-preview')!;

function currentPackage():GridRingPackage{
 const title=(document.querySelector<HTMLInputElement>('#title-input')!).value.trim()||'Untitled Experience';
 const creator=(document.querySelector<HTMLInputElement>('#creator-input')!).value.trim()||'traveler';
 const version=(document.querySelector<HTMLInputElement>('#version-input')!).value.trim()||'0.1.0';
 const template=(document.querySelector<HTMLSelectElement>('#template-input')!).value;
 const publication=(document.querySelector<HTMLSelectElement>('#publication')!).value as GridRingPackage['publication'];
 return {id:title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,64)||'experience',version,title,creatorId:creator,regionTemplateId:template,gridCode:editor.value,requiredAssets:['welcome-beacon','starter-home'],capabilities:[],publication,provenance:{createdAt:new Date().toISOString()}};
}
function inspect(){
 try{
  const base=currentPackage(); const compiled=compileGridRing({...base,capabilities:[]});
  const required=compiled.program.capabilities;
  caps.innerHTML=required.length?required.map(c=>'<span class="chip">'+c+'</span>').join(''):'<span class="chip">world.basic</span>';
  capCount.textContent=String(required.length);
  diagnostics.textContent='● Valid Grid Code · '+compiled.program.events.length+' event block(s)';
  diagnostics.style.color='#54e0b0'; runtime.textContent='READY';
  const pkg={...base,capabilities:required};
  packagePreview.textContent=JSON.stringify({manifest:{...pkg,gridCode:undefined},program:compiled.program},null,2);
  return pkg;
 }catch(e){caps.innerHTML='<span class="chip">'+(e instanceof Error?e.message:'Validation error')+'</span>';capCount.textContent='—';diagnostics.textContent='● '+(e instanceof Error?e.message:'Validation error');diagnostics.style.color='#ff8797';runtime.textContent='BLOCKED';return null}
}
document.querySelectorAll<HTMLButtonElement>('.nav').forEach(b=>b.onclick=()=>{document.querySelectorAll('.nav').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.tab-panel').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.querySelector('[data-panel="'+b.dataset.tab+'"]')?.classList.add('active')});
document.querySelectorAll<HTMLButtonElement>('.template').forEach(b=>b.onclick=()=>{document.querySelectorAll('.template').forEach(x=>x.classList.remove('active'));b.classList.add('active');(document.querySelector<HTMLSelectElement>('#template-input')!).value=b.dataset.template||'first-light';inspect()});
editor.addEventListener('input',inspect);
document.querySelector('#validate')?.addEventListener('click',()=>{const p=inspect();if(p){document.querySelector('#save-state')!.textContent='VALIDATED';}});
document.querySelector('#format-code')?.addEventListener('click',()=>{editor.value=editor.value.replace(/>\s*</g,'>\n<').replace(/\n{2,}/g,'\n');inspect()});
document.querySelector('#save')?.addEventListener('click',()=>{if(inspect())document.querySelector('#save-state')!.textContent='VERSION READY'});
document.querySelector('#preview')?.addEventListener('click',()=>{runtime.textContent='PREVIEW';document.querySelector('#save-state')!.textContent='PREVIEW'});
document.querySelector('#title-input')?.addEventListener('input',e=>{document.querySelector('#experience-title')!.textContent=(e.target as HTMLInputElement).value||'Untitled Experience'});
document.querySelector('#version-input')?.addEventListener('input',e=>{document.querySelector('#version-label')!.textContent='v'+(e.target as HTMLInputElement).value});
inspect();
