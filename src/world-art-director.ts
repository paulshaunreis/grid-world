import * as THREE from 'three';

type DistrictKey = 'HARBOR'|'GARDENS'|'CITADEL'|'ARTS'|'WILDS';
type WorldEvent = {key:string; label:string; intensity:number; until:number};

const DISTRICTS:Record<DistrictKey,{color:number; secondary:number; geometry:string; label:string}> = {
  HARBOR:{color:0x3bc7df,secondary:0x174b6b,geometry:'tidal glass + industrial ribs',label:'TIDELINE'},
  GARDENS:{color:0x8fe388,secondary:0x285c3b,geometry:'biomorphic terraces + canopy',label:'VERDANT'},
  CITADEL:{color:0xd7b46a,secondary:0x5c4425,geometry:'monolithic stone + luminous seams',label:'CROWN'},
  ARTS:{color:0xd28cff,secondary:0x4d285e,geometry:'kinetic frames + suspended galleries',label:'MUSE'},
  WILDS:{color:0xc9a36a,secondary:0x3d3021,geometry:'ancient trunks + stone paths',label:'FRONTIER'}
};

const css=document.createElement('style');css.textContent=`
.gw-district-hud{position:fixed;left:22px;bottom:22px;z-index:7;width:250px;padding:12px 14px;background:rgba(4,9,14,.68);border:1px solid rgba(150,220,255,.16);backdrop-filter:blur(12px);font:10px/1.45 ui-monospace,monospace;color:#dff8ff;pointer-events:none}
.gw-district-hud .eyebrow{font-size:8px;letter-spacing:.18em;opacity:.62}.gw-district-hud .name{font:600 17px system-ui;margin:4px 0}.gw-district-hud .bar{height:2px;background:rgba(255,255,255,.08);margin-top:9px;overflow:hidden}.gw-district-hud .fill{height:100%;width:42%;background:#68d9ff;box-shadow:0 0 14px currentColor;transition:width 1s}
.gw-event{position:fixed;top:22px;left:50%;transform:translateX(-50%) translateY(-16px);z-index:9;padding:9px 16px;border:1px solid rgba(104,217,255,.3);background:rgba(3,9,15,.82);backdrop-filter:blur(14px);font:700 9px ui-monospace,monospace;letter-spacing:.14em;color:#dffaff;opacity:0;transition:.5s}
.gw-event.live{opacity:1;transform:translateX(-50%) translateY(0)}
`;document.head.appendChild(css);

const hud=document.createElement('div');hud.className='gw-district-hud';hud.innerHTML='<div class="eyebrow">DISTRICT SIGNAL</div><div class="name">TIDELINE</div><div class="desc">tidal glass + industrial ribs</div><div class="bar"><div class="fill"></div></div>';document.body.appendChild(hud);
const eventEl=document.createElement('div');eventEl.className='gw-event';document.body.appendChild(eventEl);

function mat(color:number,opacity=1){return new THREE.MeshStandardMaterial({color,roughness:.72,metalness:.16,transparent:opacity<1,opacity});}

export function installGridWorldArtDirector(scene:THREE.Scene){
  const root=new THREE.Group();root.name='grid-art-director-v2';
  const clock=new THREE.Clock();
  const districtGroups:Record<string,THREE.Group>={};
  (Object.keys(DISTRICTS) as DistrictKey[]).forEach((key,i)=>{
    const d=DISTRICTS[key], g=new THREE.Group();g.name='district-'+key.toLowerCase();
    const radius=15+i*11;
    for(let j=0;j<7;j++){
      const h=1.5+((j*13+i*7)%11)/3;
      const angle=j/7*Math.PI*2+i*.7;
      const mesh=new THREE.Mesh(new THREE.CylinderGeometry(.25+.05*i,.5+.08*i,h,6),mat(d.color,.78));
      mesh.position.set(Math.cos(angle)*radius,h/2-.2,Math.sin(angle)*radius);
      mesh.rotation.y=angle+.4;g.add(mesh);
      const seam=new THREE.Mesh(new THREE.BoxGeometry(.025,h*.72,.025),new THREE.MeshBasicMaterial({color:d.color,transparent:true,opacity:.52}));
      seam.position.set(mesh.position.x,mesh.position.y,mesh.position.z);seam.rotation.y=angle;g.add(seam);
    }
    g.userData.district=key;g.userData.description=d.geometry;districtGroups[key]=g;root.add(g);
  });

  const eventTypes=[
    {key:'AURORA',label:'AURORA CURRENT // SKY EVENT',duration:18},
    {key:'MIGRATION',label:'WILDLIFE MIGRATION // NORTH PATH',duration:14},
    {key:'MARKET',label:'NIGHT MARKET // ARTS DISTRICT',duration:20},
    {key:'TIDE',label:'HIGH TIDE // HARBOR SIGNAL',duration:16}
  ];
  let active:WorldEvent|null=null;let lastEvent=0;
  function announce(e:WorldEvent){eventEl.textContent=e.label;eventEl.classList.add('live');setTimeout(()=>eventEl.classList.remove('live'),4200)}
  function tick(){
    const dt=clock.getDelta(), now=performance.now()/1000;
    const t=now*.2;
    Object.entries(districtGroups).forEach(([key,g],i)=>{
      g.rotation.y+=dt*(.001+i*.0003);
      g.children.forEach((o,j)=>{o.position.y += Math.sin(t*1.4+j+i)*dt*.012;});
    });
    const keys=Object.keys(DISTRICTS) as DistrictKey[];
    const idx=Math.floor((now/24)%keys.length);const d=DISTRICTS[keys[idx]];
    hud.querySelector('.name')!.textContent=d.label;
    hud.querySelector('.desc')!.textContent=d.geometry;
    (hud.querySelector('.fill') as HTMLElement).style.width=(38+((Math.sin(now*.17)+1)*28))+'%';
    if(!active && now-lastEvent>12){const e=eventTypes[Math.floor(Math.random()*eventTypes.length)];active={key:e.key,label:e.label,intensity:1,until:now+e.duration};lastEvent=now;announce(active);}
    if(active && now>active.until)active=null;
    if(active?.key==='AURORA'){root.children.forEach((g,i)=>{if(g instanceof THREE.Group)g.scale.y=1+.025*Math.sin(now*2+i)});}
    requestAnimationFrame(tick);
  }
  scene.add(root);tick();return root;
}
