import * as THREE from 'three';
import type { GridTeleportDestination } from '../engine/GridTeleport';

export function teleportPreviewUrl(destination:GridTeleportDestination){
  const world=(destination.id.match(/^world-gate:(.+)$/)?.[1]??destination.id).toLowerCase();
  return '/worlds/'+world+'.svg';
}
export function mountTeleportExperience(){
  const overlay=document.createElement('section'); overlay.className='grid-teleport-overlay'; overlay.innerHTML='<div class="grid-teleport-card"><div class="grid-teleport-kicker">GRID TRANSIT // ROUTE LOCKED</div><img data-teleport-image alt="Destination preview"><div data-teleport-name class="grid-teleport-name"></div><div data-teleport-status class="grid-teleport-status"></div></div>';
  document.body.appendChild(overlay);
  const style=document.createElement('style');style.textContent=`.grid-teleport-overlay{position:fixed;inset:0;z-index:120;display:none;place-items:center;background:radial-gradient(circle,rgba(72,231,255,.08),rgba(2,6,12,.76));backdrop-filter:blur(8px);pointer-events:none}.grid-teleport-overlay.open{display:grid}.grid-teleport-card{width:min(560px,calc(100vw - 36px));padding:18px;border:1px solid rgba(110,230,255,.32);background:rgba(3,9,16,.9);box-shadow:0 30px 120px rgba(0,0,0,.65);text-align:center}.grid-teleport-card img{display:block;width:100%;height:220px;object-fit:cover;margin:12px 0;border:1px solid rgba(255,255,255,.1);background:#07111d}.grid-teleport-kicker{font:9px 'IBM Plex Mono',monospace;letter-spacing:.2em;color:#64e7ff}.grid-teleport-name{font:700 25px 'Space Grotesk',sans-serif}.grid-teleport-status{margin-top:6px;color:#8ba0b2;font:10px 'IBM Plex Mono',monospace;letter-spacing:.08em}`;document.head.appendChild(style);
  const image=overlay.querySelector<HTMLImageElement>('[data-teleport-image]')!,name=overlay.querySelector<HTMLElement>('[data-teleport-name]')!,status=overlay.querySelector<HTMLElement>('[data-teleport-status]')!;
  const show=(destination:GridTeleportDestination,phase:'departing'|'arriving')=>{name.textContent=destination.displayName;status.textContent=phase==='departing'?'TRANSIT INITIALIZING · DESTINATION CONFIRMED':'ARRIVAL COMPLETE · LOCAL SPACE RESTORED';image.src=teleportPreviewUrl(destination);image.onerror=()=>{image.src='/art/hero-worlds.svg'};overlay.classList.add('open');window.setTimeout(()=>overlay.classList.remove('open'),phase==='departing'?850:700);};
  return {show};
}
export function createTeleportAvatarEffect(root:THREE.Object3D,duration=900){
  const group=new THREE.Group();group.name='grid-teleport-avatar-effect';root.add(group);
  const rings:THREE.Mesh[]=[];
  for(let i=0;i<3;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(.55+i*.22,.035,8,48),new THREE.MeshBasicMaterial({color:0x65e6ff,transparent:true,opacity:.8,depthWrite:false}));ring.rotation.x=Math.PI/2;ring.position.y=.15+i*.45;group.add(ring);rings.push(ring);}
  const started=performance.now();
  const tick=()=>{const t=(performance.now()-started)/duration;group.rotation.y+=.08; rings.forEach((r,i)=>{r.scale.setScalar(1+t*(1.8+i*.25));r.material.opacity=Math.max(0,.8-t*.8);r.position.y=.15+i*.45+t*(1.1+i*.35)});if(t<1)requestAnimationFrame(tick);else root.remove(group)};tick();
}
