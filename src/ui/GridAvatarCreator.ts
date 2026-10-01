import * as THREE from 'three';
import type { AvatarStyle } from '../core/PlayerIdentity';

export interface AvatarCustomization {
  skin: number;
  hair: number;
  eyes: number;
  build: number;
  accent: number;
  age: number;
  species: number;
  hairStyle: number;
  hairLength: number;
}

export interface AvatarSelection {
  style: AvatarStyle;
  customization: AvatarCustomization;
}

const STYLES: {id:AvatarStyle; label:string; body:number; accent:number}[] = [
  {id:'navigator',label:'Navigator',body:0x3e8eb8,accent:0x72e8ff},
  {id:'muse',label:'Muse',body:0x8f4fb2,accent:0xf1a1ff},
  {id:'explorer',label:'Explorer',body:0xb86d31,accent:0xffc078},
  {id:'builder',label:'Builder',body:0x725239,accent:0xe0b06e},
  {id:'scholar',label:'Scholar',body:0x53699d,accent:0xb8c8ff},
  {id:'sentinel',label:'Sentinel',body:0x8d7841,accent:0xffe28a},
  {id:'wanderer',label:'Wanderer',body:0x477b5a,accent:0x8ff0ae},
  {id:'artist',label:'Artist',body:0xa44376,accent:0xff8bc8},
  {id:'ranger',label:'Ranger',body:0x496844,accent:0x9ddc8c},
  {id:'architect',label:'Architect',body:0x496f84,accent:0x93dfff},
  {id:'guardian',label:'Guardian',body:0x4b5b9d,accent:0x9aaaff},
  {id:'signal',label:'Signal',body:0x2f897a,accent:0x70ffe0},
];

const SKINS=[0xf1d1bd,0xd9aa8a,0xb97858,0x8d583f,0x5f392e];
const HAIR=[0x171a24,0x4a2b22,0x9b6a3b,0xb9d5dc,0x8b4fa5,0xe0e4e8];
const AGES=[{id:0,label:'Child',scale:.72,head:1.08},{id:1,label:'Teen',scale:.88,head:1.03},{id:2,label:'Young Adult',scale:.98,head:1},{id:3,label:'Adult',scale:1.03,head:.98},{id:4,label:'Elder',scale:.98,head:1.01}];
const SPECIES=['Human','Elf','Fae','Android','Synth'];
const HAIR_STYLES=['Short','Long','Bob','Ponytail','Braided','Mohawk','Wavy','Twin Tail'];
const EYES=[0x58d7ff,0x6d8cff,0x63d88d,0xd4ad63,0xd47fd8,0xe7e7e7];

function clamp(n:number,min:number,max:number){return Math.max(min,Math.min(max,n));}

export function mountAvatarCreator(
  host:HTMLElement,
  initial:AvatarSelection,
  onConfirm:(selection:AvatarSelection)=>void,
){
  host.innerHTML=`
    <div class="grid-avatar-page">
      <div class="grid-avatar-preview">
        <div class="grid-avatar-preview-header"><span>AVATAR LAB // FIRST FORM</span><small>DRAG · ORBIT &nbsp; WHEEL · ZOOM</small></div>
        <div class="grid-avatar-canvas-wrap"><canvas class="grid-avatar-canvas"></canvas><div class="grid-avatar-reticle"></div></div>
        <div class="grid-avatar-preview-footer"><span id="gav-style-label"></span><span>GRID IDENTITY PREVIEW</span></div>
      </div>
      <div class="grid-avatar-controls">
        <div class="grid-avatar-kicker">CHOOSE YOUR FORM</div>
        <h3>Build a starter avatar</h3>
        <p>Your avatar is yours. Start with a Grid archetype, then tune the look before entering the world.</p>
        <div class="grid-avatar-style-grid" id="gav-styles"></div>
        <div class="grid-avatar-section"><b>AGE / LIFE STAGE</b><div class="grid-avatar-choice-grid" id="gav-age"></div></div><div class="grid-avatar-section"><b>SPECIES</b><div class="grid-avatar-choice-grid" id="gav-species"></div></div><div class="grid-avatar-section"><b>HAIR STYLE</b><div class="grid-avatar-choice-grid" id="gav-hair-style"></div></div><div class="grid-avatar-custom-grid">
          <label>SKIN <input id="gav-skin" type="range" min="0" max="4" step="1"></label>
          <label>HAIR COLOR <input id="gav-hair" type="range" min="0" max="5" step="1"></label><label>HAIR LENGTH <input id="gav-hair-length" type="range" min="0" max="4" step="1"></label>
          <label>EYES <input id="gav-eyes" type="range" min="0" max="5" step="1"></label>
          <label>BUILD <input id="gav-build" type="range" min="-3" max="3" step="1"></label>
          <label>ACCENT <input id="gav-accent" type="range" min="0" max="5" step="1"></label>
        </div>
        <div class="grid-avatar-hint">The starter form can be changed later. More detailed facial, hair, clothing, body and accessory authoring will live in Avatar Studio.</div>
        <button class="grid-avatar-confirm" id="gav-confirm">CONFIRM AVATAR & ENTER GRID</button>
      </div>
    </div>`;

  const canvas=host.querySelector<HTMLCanvasElement>('.grid-avatar-canvas')!;
  const styleGrid=host.querySelector<HTMLDivElement>('#gav-styles')!;
  const label=host.querySelector<HTMLSpanElement>('#gav-style-label')!;
  const scene=new THREE.Scene();
  scene.background=new THREE.Color(0x050b13);
  const camera=new THREE.PerspectiveCamera(28,1,.1,100);
  camera.position.set(0,1.55,5.8);
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  const resize=()=>{const r=canvas.getBoundingClientRect();renderer.setSize(Math.max(1,r.width),Math.max(1,r.height),false);camera.aspect=Math.max(1,r.width)/Math.max(1,r.height);camera.updateProjectionMatrix();};
  const observer=new ResizeObserver(resize); observer.observe(canvas); resize();
  scene.add(new THREE.HemisphereLight(0xbdeaff,0x09111d,2.1));
  const key=new THREE.DirectionalLight(0xffffff,2.8);key.position.set(3,5,4);scene.add(key);
  const rim=new THREE.PointLight(0x67dcff,10,10);rim.position.set(-3,2,2);scene.add(rim);
  const floor=new THREE.Mesh(new THREE.CylinderGeometry(1.5,1.5,.08,64),new THREE.MeshStandardMaterial({color:0x0d1b29,metalness:.5,roughness:.38}));
  floor.position.y=-.05;scene.add(floor);

  const avatar=new THREE.Group();scene.add(avatar);
  const body=new THREE.Mesh(new THREE.CapsuleGeometry(.48,1.15,10,20),new THREE.MeshStandardMaterial({roughness:.58,metalness:.08}));
  body.position.y=1.05;avatar.add(body);
  const neck=new THREE.Mesh(new THREE.CylinderGeometry(.18,.2,.25,16),new THREE.MeshStandardMaterial({roughness:.7}));neck.position.y=1.78;avatar.add(neck);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.38,24,18),new THREE.MeshStandardMaterial({roughness:.7}));head.position.y=2.15;avatar.add(head);
  const hair=new THREE.Mesh(new THREE.SphereGeometry(.41,24,14,0,Math.PI*2,0,Math.PI*.58),new THREE.MeshStandardMaterial({roughness:.52}));hair.position.y=2.28;avatar.add(hair);
  const eyeMat=new THREE.MeshStandardMaterial({emissiveIntensity:1.5,metalness:.1,roughness:.28});
  const eyeL=new THREE.Mesh(new THREE.SphereGeometry(.045,12,8),eyeMat);const eyeR=eyeL.clone();eyeL.position.set(-.13,2.17,.345);eyeR.position.set(.13,2.17,.345);avatar.add(eyeL,eyeR);
  const shoulderL=new THREE.Mesh(new THREE.SphereGeometry(.22,14,10),new THREE.MeshStandardMaterial({metalness:.35,roughness:.34}));const shoulderR=shoulderL.clone();shoulderL.position.set(-.48,1.42,0);shoulderR.position.set(.48,1.42,0);avatar.add(shoulderL,shoulderR);
  const chest=new THREE.Mesh(new THREE.BoxGeometry(.74,.7,.22),new THREE.MeshStandardMaterial({metalness:.28,roughness:.4}));chest.position.set(0,1.34,.18);chest.rotation.x=-.08;avatar.add(chest);
  const collar=new THREE.Mesh(new THREE.TorusGeometry(.29,.035,8,24),new THREE.MeshStandardMaterial({color:0x6de5ff,emissive:0x6de5ff,emissiveIntensity:1.8,metalness:.7,roughness:.2}));collar.rotation.x=Math.PI/2;collar.position.y=1.85;avatar.add(collar);

  let selection:AvatarSelection={style:initial.style,customization:{...initial.customization}};
  const inputs={
    skin:host.querySelector<HTMLInputElement>('#gav-skin')!,
    hair:host.querySelector<HTMLInputElement>('#gav-hair')!,
    eyes:host.querySelector<HTMLInputElement>('#gav-eyes')!,
    build:host.querySelector<HTMLInputElement>('#gav-build')!,
    accent:host.querySelector<HTMLInputElement>('#gav-accent')!,
    hairLength:host.querySelector<HTMLInputElement>('#gav-hair-length')!,
  };
  const ageGrid=host.querySelector<HTMLDivElement>('#gav-age')!;
  const speciesGrid=host.querySelector<HTMLDivElement>('#gav-species')!;
  const hairStyleGrid=host.querySelector<HTMLDivElement>('#gav-hair-style')!;
  const draw=()=>{
    const preset=STYLES.find(x=>x.id===selection.style)??STYLES[0];
    const c=selection.customization;
    body.material.color.setHex(preset.body);
    head.material.color.setHex(SKINS[clamp(c.skin,0,4)]);
    hair.material.color.setHex(HAIR[clamp(c.hair,0,5)]);
    eyeMat.color.setHex(EYES[clamp(c.eyes,0,5)]);eyeMat.emissive.setHex(EYES[clamp(c.eyes,0,5)]);
    const age=AGES[clamp(c.age??3,0,4)]; const build=1+c.build*.045; const lifeScale=age.scale; body.scale.set(build*lifeScale,lifeScale,build*lifeScale); head.scale.set(age.head,age.head,age.head); neck.scale.set(age.head,lifeScale,age.head); hair.scale.set(age.head,age.head*(1+(c.hairLength??2)*.08),age.head); shoulderL.scale.set(lifeScale,lifeScale,lifeScale); shoulderR.scale.copy(shoulderL.scale);
    head.userData.species=SPECIES[clamp(c.species??0,0,4)];
    hair.userData.hairStyle=HAIR_STYLES[clamp(c.hairStyle??0,0,HAIR_STYLES.length-1)];
    const hairStyle=c.hairStyle??0; const hairX=hairStyle===5?1.25:hairStyle===2?.92:1; const hairZ=hairStyle===1?1.12:hairStyle===6?1.06:1; hair.scale.set(age.head*hairX,age.head*(1+(c.hairLength??2)*.08),age.head*hairZ); hair.rotation.z=hairStyle===5?.12:hairStyle===3?.08:0;
    const accent=0x33ddff + clamp(c.accent,0,5)*0x070707;
    chest.material.color.setHex(preset.accent);collar.material.color.setHex(preset.accent);collar.material.emissive.setHex(preset.accent);
    shoulderL.material.color.setHex(accent);shoulderR.material.color.setHex(accent);
    label.textContent=preset.label.toUpperCase()+' · '+selection.style.toUpperCase()+' · '+AGES[clamp(c.age??3,0,4)].label.toUpperCase()+' '+SPECIES[clamp(c.species??0,0,4)].toUpperCase();
    Object.entries(inputs).forEach(([k,input])=>input.value=String((c as any)[k]??0));
    ageGrid.querySelectorAll<HTMLButtonElement>('button').forEach(b=>b.classList.toggle('selected',Number(b.dataset.age)===c.age));
    speciesGrid.querySelectorAll<HTMLButtonElement>('button').forEach(b=>b.classList.toggle('selected',Number(b.dataset.species)===c.species));
    hairStyleGrid.querySelectorAll<HTMLButtonElement>('button').forEach(b=>b.classList.toggle('selected',Number(b.dataset.hairStyle)===c.hairStyle));
    styleGrid.querySelectorAll<HTMLButtonElement>('button').forEach(b=>b.classList.toggle('selected',b.dataset.style===selection.style));
  };
  AGES.forEach(a=>{const b=document.createElement('button');b.type='button';b.dataset.age=String(a.id);b.textContent=a.label;b.onclick=()=>{selection.customization.age=a.id;draw();};ageGrid.appendChild(b);});
  SPECIES.forEach((s,i)=>{const b=document.createElement('button');b.type='button';b.dataset.species=String(i);b.textContent=s;b.onclick=()=>{selection.customization.species=i;draw();};speciesGrid.appendChild(b);});
  HAIR_STYLES.forEach((s,i)=>{const b=document.createElement('button');b.type='button';b.dataset.hairStyle=String(i);b.textContent=s;b.onclick=()=>{selection.customization.hairStyle=i;draw();};hairStyleGrid.appendChild(b);});
  STYLES.forEach(p=>{const b=document.createElement('button');b.type='button';b.dataset.style=p.id;b.innerHTML='<b>'+p.label+'</b><span>GRID FORM</span>';b.onclick=()=>{selection.style=p.id;draw();};styleGrid.appendChild(b);});
  (Object.keys(inputs) as (keyof typeof inputs)[]).forEach(k=>inputs[k].addEventListener('input',()=>{selection.customization[k]=Number(inputs[k].value);draw();}));
  draw();

  let orbit=0,zoom=5.8,drag=false,lastX=0;
  canvas.addEventListener('pointerdown',e=>{drag=true;lastX=e.clientX;canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(!drag)return;orbit+=(e.clientX-lastX)*.012;lastX=e.clientX;});
  canvas.addEventListener('pointerup',()=>{drag=false;});
  canvas.addEventListener('wheel',e=>{e.preventDefault();zoom=clamp(zoom+e.deltaY*.004,3.4,8);},{passive:false});
  let raf=0;const animate=()=>{avatar.rotation.y=orbit;camera.position.z=zoom;camera.lookAt(0,1.35,0);renderer.render(scene,camera);raf=requestAnimationFrame(animate);};animate();
  host.querySelector<HTMLButtonElement>('#gav-confirm')!.onclick=()=>onConfirm({...selection,customization:{...selection.customization}});
  return ()=>{cancelAnimationFrame(raf);observer.disconnect();renderer.dispose();};
}
