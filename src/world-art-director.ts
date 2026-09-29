import * as THREE from 'three';
const css=document.createElement('style');css.textContent=`
.gw-world-art{position:fixed;inset:0;pointer-events:none;z-index:4}.gw-world-art .sig{position:absolute;left:22px;top:78px;padding:8px 11px;border-left:2px solid #68d9ff;background:rgba(3,10,17,.58);backdrop-filter:blur(10px);font:700 9px ui-monospace,monospace;letter-spacing:.16em;color:#dffaff}.gw-world-art .pulse{position:absolute;right:22px;top:82px;width:42px;height:42px;border:1px solid rgba(104,217,255,.35);border-radius:50%;box-shadow:0 0 24px rgba(104,217,255,.12)}.gw-world-art .pulse:after{content:"";position:absolute;inset:8px;border-radius:50%;background:#68d9ff;box-shadow:0 0 20px #68d9ff;animation:gwPulse 2.2s ease-in-out infinite}@keyframes gwPulse{50%{transform:scale(.58);opacity:.5}}`;
document.head.appendChild(css);
const art=document.createElement('div');art.className='gw-world-art';art.innerHTML='<div class="sig">LIVING WORLD // FIRST LIGHT</div><div class="pulse"></div>';document.body.appendChild(art);
export function installGridWorldArtDirector(scene:THREE.Scene){
  const root=new THREE.Group();root.name='grid-art-director';
  const stars=new THREE.Group();
  const mat=new THREE.PointsMaterial({color:0x8deaff,size:.09,transparent:true,opacity:.58,sizeAttenuation:true});
  const positions=new Float32Array(900*3);
  for(let i=0;i<900;i++){positions[i*3]=(Math.random()-.5)*180;positions[i*3+1]=8+Math.random()*55;positions[i*3+2]=-70+Math.random()*150}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(positions,3));stars.add(new THREE.Points(geo,mat));root.add(stars);
  const aurora=new THREE.Group();
  for(let i=0;i<4;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(34+i*2,.035,6,160),new THREE.MeshBasicMaterial({color:i%2?0x7c8cff:0x5ee7ff,transparent:true,opacity:.11}));ring.rotation.x=Math.PI/2.8;ring.position.y=19+i*3;ring.scale.set(1.8,.7,1);aurora.add(ring)}
  root.add(aurora);
  const beaconHalo=new THREE.Mesh(new THREE.RingGeometry(1.8,2.0,48),new THREE.MeshBasicMaterial({color:0x68d9ff,transparent:true,opacity:.18,side:THREE.DoubleSide}));beaconHalo.rotation.x=-Math.PI/2;beaconHalo.position.set(0,.03,-7);root.add(beaconHalo);
  scene.add(root);
  let time=0;
  function tick(){time+=.008;stars.rotation.y=time*.012;aurora.rotation.y=-time*.018;beaconHalo.scale.setScalar(.82+.18*(.5+.5*Math.sin(time*2.4)));requestAnimationFrame(tick)}tick();
  return root;
}
