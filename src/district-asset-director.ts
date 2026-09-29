import * as THREE from 'three';
import { createCyberpackMaterial } from './cyberpack-materials';

export type DistrictKey = 'HARBOR' | 'GARDENS' | 'CITADEL' | 'ARTS' | 'WILDS';

export interface DistrictVisual {
  key: DistrictKey;
  label: string;
  description: string;
  center: THREE.Vector3;
  color: number;
  secondary: number;
}

export const DISTRICT_VISUALS: Record<DistrictKey, DistrictVisual> = {
  HARBOR: {
    key: 'HARBOR',
    label: 'TIDELINE',
    description: 'tidal glass + industrial ribs',
    center: new THREE.Vector3(25, 0, -4),
    color: 0x3bc7df,
    secondary: 0x174b6b,
  },
  GARDENS: {
    key: 'GARDENS',
    label: 'VERDANT',
    description: 'biomorphic terraces + canopy',
    center: new THREE.Vector3(8, 0, 10),
    color: 0x8fe388,
    secondary: 0x285c3b,
  },
  CITADEL: {
    key: 'CITADEL',
    label: 'CROWN',
    description: 'monolithic stone + luminous seams',
    center: new THREE.Vector3(0, 0, 16),
    color: 0xd7b46a,
    secondary: 0x5c4425,
  },
  ARTS: {
    key: 'ARTS',
    label: 'MUSE',
    description: 'kinetic frames + suspended galleries',
    center: new THREE.Vector3(-20, 0, -24),
    color: 0xd28cff,
    secondary: 0x4d285e,
  },
  WILDS: {
    key: 'WILDS',
    label: 'FRONTIER',
    description: 'ancient trunks + stone paths',
    center: new THREE.Vector3(20, 0, -25),
    color: 0xc9a36a,
    secondary: 0x3d3021,
  },
};

function standard(color: number, roughness = .68, metalness = .12) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}
function cyber(key: 'pcb'|'carbon'|'gunmetal'|'hazard'|'technical-leather'|'iridescent-glass') {
  return createCyberpackMaterial(key);
}

function glow(color: number, opacity = .72) {
  return new THREE.MeshBasicMaterial({ color, transparent: true, opacity });
}

function addRing(group: THREE.Group, radius: number, y: number, color: number, tube = .045) {
  const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 8, 48), glow(color, .55));
  ring.position.y = y;
  group.add(ring);
  return ring;
}



function addTechnicalInlay(group: THREE.Group, radius: number, y: number, color: number, count = 6) {
  const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .38 });
  for (let i = 0; i < count; i++) {
    const a = i / count * Math.PI * 2;
    const strip = new THREE.Mesh(new THREE.BoxGeometry(radius * .72, .025, .045), material);
    strip.position.set(Math.cos(a) * radius, y, Math.sin(a) * radius);
    strip.rotation.y = a;
    group.add(strip);
  }
}

function addTechSpines(group: THREE.Group, y: number, color: number) {
  for (let i = 0; i < 5; i++) {
    const spine = new THREE.Mesh(
      new THREE.BoxGeometry(.035, .65 + i * .12, .035),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .28 }),
    );
    spine.position.set(-1.8 + i * .9, y + .35, .1 + Math.sin(i) * .5);
    group.add(spine);
  }
}

function addHarbor(group: THREE.Group, d: DistrictVisual) {
  const water = new THREE.Mesh(
    new THREE.CylinderGeometry(8.5, 8.5, .08, 48),
    new THREE.MeshPhysicalMaterial({ color: d.secondary, roughness: .18, metalness: .35, transmission: .15, transparent: true, opacity: .72 }),
  );
  water.position.y = .04;
  water.scale.z = .7;
  group.add(water);
  addTechnicalInlay(group, 5.2, .11, d.color, 8);
  for (let i = 0; i < 6; i++) {
    const h = 2.8 + i * .55;
    const pylon = new THREE.Mesh(new THREE.CylinderGeometry(.22, .34, h, 8), cyber('gunmetal'));
    const angle = i / 6 * Math.PI * 2;
    pylon.position.set(Math.cos(angle) * 6.5, h / 2, Math.sin(angle) * 4.5);
    group.add(pylon);
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(.14 + i * .012, 12, 8), glow(d.color, .82));
    beacon.position.copy(pylon.position).setY(h + .08);
    group.add(beacon);
  }
  for (let i = 0; i < 3; i++) {
    const rib = new THREE.Mesh(new THREE.TorusGeometry(3.2 + i * 1.35, .09, 8, 48, Math.PI), glow(d.color, .36));
    rib.rotation.x = Math.PI / 2;
    rib.rotation.z = i * .18;
    rib.position.y = 1.2 + i * .5;
    group.add(rib);
  }
}

function addGardens(group: THREE.Group, d: DistrictVisual) {
  for (let i = 0; i < 5; i++) {
    const terrace = new THREE.Mesh(
      new THREE.CylinderGeometry(2.4 - i * .28, 2.8 - i * .3, .24, 12),
      cyber('technical-leather'),
    );
    terrace.position.y = .12 + i * .55;
    terrace.scale.z = .78;
    group.add(terrace);
    addRing(group, 2.45 - i * .28, terrace.position.y + .15, d.color, .035);
  }
  addTechSpines(group, .85, d.color);
  for (let i = 0; i < 12; i++) {
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(.035, .07, 1.1 + (i % 3) * .3, 6), standard(d.secondary, .8, 0));
    const a = i / 12 * Math.PI * 2;
    const r = 2.1 + (i % 4) * .75;
    stem.position.set(Math.cos(a) * r, 1.3 + (i % 3) * .45, Math.sin(a) * r * .72);
    stem.rotation.z = Math.sin(i * 2.1) * .18;
    group.add(stem);
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(.42 + (i % 3) * .12, 1), standard(d.color, .82, 0));
    crown.position.copy(stem.position).setY(stem.position.y + .62);
    crown.scale.y = .7;
    group.add(crown);
  }
}

function addCitadel(group: THREE.Group, d: DistrictVisual) {
  const base = new THREE.Mesh(new THREE.CylinderGeometry(7, 8.2, .5, 8), cyber('gunmetal'));
  base.position.y = .25;
  group.add(base);
  for (let i = 0; i < 4; i++) {
    const tower = new THREE.Mesh(new THREE.BoxGeometry(1.35, 4.5 + i * .4, 1.35), cyber('carbon'));
    const a = i / 4 * Math.PI * 2 + Math.PI / 4;
    tower.position.set(Math.cos(a) * 4.9, tower.geometry.parameters.height / 2 + .5, Math.sin(a) * 4.9);
    group.add(tower);
    const seam = new THREE.Mesh(new THREE.BoxGeometry(.06, tower.geometry.parameters.height * .72, .06), glow(d.color, .78));
    seam.position.copy(tower.position).setY(tower.position.y);
    group.add(seam);
  }
  const crown = new THREE.Mesh(new THREE.OctahedronGeometry(2.3, 0), glow(d.color, .24));
  crown.position.y = 6.4;
  group.add(crown);
  addRing(group, 2.9, 6.4, d.color, .08);
}

function addArts(group: THREE.Group, d: DistrictVisual) {
  for (let i = 0; i < 6; i++) {
    const frame = new THREE.Mesh(
      new THREE.TorusGeometry(1.7 + i * .25, .08, 8, 4),
      glow(d.color, .65),
    );
    frame.position.set(Math.sin(i * 1.7) * 3.8, 1.6 + i * .7, Math.cos(i * 1.3) * 2.8);
    frame.rotation.set(i * .22, i * .47, i * .31);
    group.add(frame);
  }
  for (let i = 0; i < 7; i++) {
    const sculpture = new THREE.Mesh(new THREE.IcosahedronGeometry(.25 + (i % 3) * .14, 1), standard(d.secondary, .38, .55));
    sculpture.position.set(Math.sin(i * 2.2) * 4.5, 1 + (i % 4) * .7, Math.cos(i * 1.6) * 3.5);
    group.add(sculpture);
  }
  addTechnicalInlay(group, 3.9, .18, d.color, 7);
  const gallery = new THREE.Mesh(new THREE.BoxGeometry(5.8, .16, 2.4), cyber('iridescent-glass'));
  gallery.position.y = 4.8;
  group.add(gallery);
}

function addWilds(group: THREE.Group, d: DistrictVisual) {
  for (let i = 0; i < 8; i++) {
    const h = 3.2 + (i % 4) * 1.1;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.22, .42, h, 7), cyber('carbon'));
    const a = i / 8 * Math.PI * 2;
    const r = 4.5 + (i % 3) * 1.1;
    trunk.position.set(Math.cos(a) * r, h / 2, Math.sin(a) * r * .72);
    trunk.rotation.z = Math.sin(i * 1.8) * .12;
    group.add(trunk);
    const canopy = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2 + (i % 3) * .3, 1), standard(d.color, .95, 0));
    canopy.position.copy(trunk.position).setY(h + .55);
    canopy.scale.set(1.1, .75, .9);
    group.add(canopy);
  }
  addTechnicalInlay(group, 3.7, .28, d.color, 10);
  for (let i = 0; i < 12; i++) {
    const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(.25 + (i % 3) * .14, 0), standard(d.secondary, 1, 0));
    const a = i / 12 * Math.PI * 2;
    stone.position.set(Math.cos(a) * (2.5 + (i % 4) * .7), .25, Math.sin(a) * (2 + (i % 3) * .6));
    group.add(stone);
  }
}

export function buildDistrictAssets(key: DistrictKey) {
  const d = DISTRICT_VISUALS[key];
  const group = new THREE.Group();
  group.name = 'district-assets-' + key.toLowerCase();
  group.position.copy(d.center);
  if (key === 'HARBOR') addHarbor(group, d);
  if (key === 'GARDENS') addGardens(group, d);
  if (key === 'CITADEL') addCitadel(group, d);
  if (key === 'ARTS') addArts(group, d);
  if (key === 'WILDS') addWilds(group, d);
  group.userData.district = key;
  group.userData.description = d.description;
  group.userData.palette = { color: d.color, secondary: d.secondary };
  return group;
}
