import * as THREE from 'three';
import { buildDistrictAssets, DISTRICT_VISUALS, type DistrictKey } from './district-asset-director';

type WorldEvent = { key: 'AURORA' | 'MIGRATION' | 'MARKET' | 'TIDE'; label: string; duration: number; until: number };

const css = document.createElement('style');
css.textContent = `
.gw-district-hud{position:fixed;left:22px;bottom:22px;z-index:7;width:260px;padding:12px 14px;background:rgba(4,9,14,.72);border:1px solid rgba(150,220,255,.16);backdrop-filter:blur(12px);font:10px/1.45 ui-monospace,monospace;color:#dff8ff;pointer-events:none;box-shadow:0 16px 45px rgba(0,0,0,.22)}
.gw-district-hud .eyebrow{font-size:8px;letter-spacing:.18em;opacity:.62}.gw-district-hud .name{font:600 17px system-ui;margin:4px 0}.gw-district-hud .desc{opacity:.72}.gw-district-hud .bar{height:2px;background:rgba(255,255,255,.08);margin-top:9px;overflow:hidden}.gw-district-hud .fill{height:100%;width:42%;background:#68d9ff;box-shadow:0 0 14px currentColor;transition:width 1s}
.gw-event{position:fixed;top:22px;left:50%;transform:translateX(-50%) translateY(-16px);z-index:9;padding:9px 16px;border:1px solid rgba(104,217,255,.3);background:rgba(3,9,15,.84);backdrop-filter:blur(14px);font:700 9px ui-monospace,monospace;letter-spacing:.14em;color:#dffaff;opacity:0;transition:.5s;box-shadow:0 10px 40px rgba(0,0,0,.28)}
.gw-event.live{opacity:1;transform:translateX(-50%) translateY(0)}
`;
document.head.appendChild(css);

const hud = document.createElement('div');
hud.className = 'gw-district-hud';
hud.innerHTML = '<div class="eyebrow">DISTRICT SIGNAL</div><div class="name">TIDELINE</div><div class="desc">tidal glass + industrial ribs</div><div class="bar"><div class="fill"></div></div>';
document.body.appendChild(hud);

const eventEl = document.createElement('div');
eventEl.className = 'gw-event';
document.body.appendChild(eventEl);

export interface GridWorldArtDirector {
  root: THREE.Group;
  update(dt: number, playerX?: number, playerZ?: number): void;
  getActiveEvent(): WorldEvent | null;
}

export function installGridWorldArtDirector(scene: THREE.Scene): GridWorldArtDirector {
  const root = new THREE.Group();
  root.name = 'grid-art-director-v4';
  root.userData.worldPrinciple = 'many worlds share one living foundation';
  root.userData.neonIsLocal = true;

  // Real Grid concept artwork is part of the world presentation layer.
  // These are local repo assets, so the world does not depend on third-party image hosts.
  const conceptPanels = new THREE.Group();
  conceptPanels.name = 'grid-concept-art-panels';
  const conceptArt = [
    { src:'/grid-concept-first-light.svg', position:[0,3.2,-9] as const, rotation:[0,0,0] as const, scale:3.6 },
    { src:'/grid-concept-living-wilds.svg', position:[9,3.6,2] as const, rotation:[0,Math.PI/2.8,0] as const, scale:3.2 },
    { src:'/grid-concept-civic.svg', position:[-9,3.1,5] as const, rotation:[0,-Math.PI/2.8,0] as const, scale:3.2 },
  ];
  const conceptLoader = new THREE.TextureLoader();
  for (const panel of conceptArt) {
    conceptLoader.load(panel.src, texture => {
      texture.colorSpace = THREE.SRGBColorSpace;
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2.4, 1.5),
        new THREE.MeshBasicMaterial({ map:texture, transparent:true, opacity:.78, side:THREE.DoubleSide }),
      );
      mesh.position.set(...panel.position);
      mesh.rotation.set(...panel.rotation);
      mesh.scale.setScalar(panel.scale);
      mesh.userData.gridConceptArt = panel.src;
      conceptPanels.add(mesh);
    });
  }
  root.add(conceptPanels);

  const ambient = new THREE.Group();
  ambient.name = 'shared-world-atmosphere';
  const motes = new THREE.Points(
    new THREE.BufferGeometry(),
    new THREE.PointsMaterial({ color: 0xb9e7ff, size: .035, transparent: true, opacity: .16 })
  );
  const positions = new Float32Array(360 * 3);
  for (let i = 0; i < 360; i++) {
    positions[i*3]=(Math.random()-.5)*90; positions[i*3+1]=Math.random()*28; positions[i*3+2]=(Math.random()-.5)*90;
  }
  motes.geometry.setAttribute('position', new THREE.BufferAttribute(positions,3));
  ambient.add(motes); root.add(ambient);

  const districtGroups: Record<DistrictKey, THREE.Group> = {} as Record<DistrictKey, THREE.Group>;
  (Object.keys(DISTRICT_VISUALS) as DistrictKey[]).forEach(key => {
    const group = buildDistrictAssets(key);
    districtGroups[key] = group;
    root.add(group);
  });

  const aurora = new THREE.Group();
  aurora.name = 'aurora-current';
  for (let i = 0; i < 4; i++) {
    const ribbon = new THREE.Mesh(
      new THREE.TorusGeometry(20 + i * 7, .055 + i * .018, 8, 96),
      new THREE.MeshBasicMaterial({ color: 0x78dfff, transparent: true, opacity: .12 - i * .018 }),
    );
    ribbon.rotation.x = Math.PI / 2.6;
    ribbon.rotation.z = i * .28;
    ribbon.position.y = 16 + i * 1.7;
    aurora.add(ribbon);
  }
  aurora.visible = false;
  root.add(aurora);

  const events = [
    { key: 'AURORA' as const, label: 'AURORA CURRENT // SKY EVENT', duration: 18 },
    { key: 'MIGRATION' as const, label: 'WILDLIFE MIGRATION // NORTH PATH', duration: 14 },
    { key: 'MARKET' as const, label: 'NIGHT MARKET // ARTS DISTRICT', duration: 20 },
    { key: 'TIDE' as const, label: 'HIGH TIDE // HARBOR SIGNAL', duration: 16 },
  ];

  let active: WorldEvent | null = null;
  let lastEvent = -30;
  let elapsed = 0;
  let districtClock = 0;

  function announce(event: WorldEvent) {
    eventEl.textContent = event.label;
    eventEl.classList.add('live');
    window.setTimeout(() => eventEl.classList.remove('live'), 4200);
  }

  function update(dt: number, playerX = 0, playerZ = 0) {
    elapsed += dt;
    conceptPanels.children.forEach((panel, index) => {
      panel.position.y += Math.sin(elapsed * .65 + index * 1.7) * dt * .025;
      panel.rotation.z = Math.sin(elapsed * .35 + index) * .012;
    });
    districtClock += dt;

    const keys = Object.keys(DISTRICT_VISUALS) as DistrictKey[];
    const districtIndex = Math.floor(elapsed / 24) % keys.length;
    let currentKey = keys[districtIndex];
    let nearest = Infinity;
    for (const key of keys) {
      const d = DISTRICT_VISUALS[key];
      const distance = Math.hypot(playerX - d.center.x, playerZ - d.center.z);
      if (distance < nearest) { nearest = distance; currentKey = key; }
    }
    const current = DISTRICT_VISUALS[currentKey];

    hud.querySelector('.name')!.textContent = current.label;
    hud.querySelector('.desc')!.textContent = current.description;
    (hud.querySelector('.fill') as HTMLElement).style.width =
      (38 + ((Math.sin(elapsed * .17) + 1) * 28)) + '%';

    Object.entries(districtGroups).forEach(([key, group], index) => {
      group.rotation.y += dt * (.006 + index * .001);
      const sway = Math.sin(elapsed * (.55 + index * .08)) * .025;
      group.children.forEach((child, childIndex) => {
        if (childIndex % 3 === 0) child.rotation.z += sway * dt;
      });
    });

    const artGroup = districtGroups.ARTS;
    const motePositions = motes.geometry.attributes.position as THREE.BufferAttribute;
    for (let i=0;i<360;i++){ let y=motePositions.getY(i)+Math.sin(elapsed*.4+i)*dt*.01; if(y>28)y=0; motePositions.setY(i,y); } motePositions.needsUpdate=true;

    artGroup.children.forEach((child, index) => {
      if (child instanceof THREE.Mesh && index % 2 === 0) child.rotation.y += dt * (.18 + index * .015);
    });

    const gardens = districtGroups.GARDENS;
    gardens.children.forEach((child, index) => {
      if (child instanceof THREE.Mesh && index > 6) child.rotation.z = Math.sin(elapsed * 1.2 + index) * .08;
    });

    if (!active && elapsed - lastEvent > 12) {
      const event = events[Math.floor(Math.random() * events.length)];
      active = { ...event, until: elapsed + event.duration };
      lastEvent = elapsed;
      announce(active);
    }

    if (active && elapsed > active.until) active = null;

    aurora.visible = active?.key === 'AURORA';
    if (aurora.visible) {
      aurora.rotation.y += dt * .035;
      aurora.children.forEach((child, index) => {
        child.position.y += Math.sin(elapsed * 1.4 + index) * dt * .12;
      });
    }

    if (active?.key === 'TIDE') {
      const harbor = districtGroups.HARBOR;
      harbor.scale.y = 1 + Math.sin(elapsed * 2.2) * .025;
    } else {
      districtGroups.HARBOR.scale.y = 1;
    }

    if (active?.key === 'MARKET') {
      districtGroups.ARTS.scale.setScalar(1 + Math.sin(elapsed * 3) * .012);
    } else {
      districtGroups.ARTS.scale.setScalar(1);
    }

    if (districtClock > 6) {
      districtClock = 0;
      root.userData.currentDistrict = currentKey;
      root.userData.currentDistrictLabel = current.label;
    }
  }

  scene.add(root);
  root.userData.currentDistrict = 'HARBOR';
  return { root, update, getActiveEvent: () => active };
}
