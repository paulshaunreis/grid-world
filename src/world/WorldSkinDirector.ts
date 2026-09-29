import * as THREE from 'three';
import { DISTRICT_VISUALS, type DistrictKey } from '../district-asset-director';

const PALETTES: Record<DistrictKey, number> = {
  HARBOR: 0x4fc7e8, GARDENS: 0x83d77d, CITADEL: 0xd6b36a, ARTS: 0xc27cff, WILDS: 0xd49b63,
};

function stars() {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(140 * 3);
  for (let i = 0; i < 140; i++) {
    const a = Math.random() * Math.PI * 2, radius = 22 + Math.random() * 18;
    positions[i * 3] = Math.cos(a) * radius;
    positions[i * 3 + 1] = 12 + Math.random() * 26;
    positions[i * 3 + 2] = Math.sin(a) * radius;
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  return new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0xe8f7ff, size: .055, transparent: true, opacity: .7 }));
}

export function createWorldSkinDirector() {
  const root = new THREE.Group();
  root.name = 'world-skin-director';
  const skins = {} as Record<DistrictKey, THREE.Group>;

  for (const key of Object.keys(DISTRICT_VISUALS) as DistrictKey[]) {
    const skin = new THREE.Group();
    skin.name = 'world-skin-' + key.toLowerCase();
    skin.position.copy(DISTRICT_VISUALS[key].center);

    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(42, 24, 16),
      new THREE.MeshBasicMaterial({ color: 0x07111f, side: THREE.BackSide, transparent: true, opacity: .86, depthWrite: false }),
    );
    dome.position.y = 15;
    skin.add(dome, stars());

    const planet = new THREE.Mesh(
      new THREE.SphereGeometry(key === 'CITADEL' ? 4.5 : 3.1, 20, 14),
      new THREE.MeshStandardMaterial({ color: PALETTES[key], roughness: .82, emissive: PALETTES[key], emissiveIntensity: .08 }),
    );
    planet.position.set(-18, 27, -30);
    skin.add(planet);

    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(1.2, 14, 10),
      new THREE.MeshStandardMaterial({ color: 0xd8d2c7, roughness: .95 }),
    );
    moon.position.set(20, 21, -34);
    skin.add(moon);

    if (key === 'GARDENS') {
      for (let i = 0; i < 3; i++) {
        const m = new THREE.Mesh(
          new THREE.SphereGeometry(1 + i * .45, 14, 10),
          new THREE.MeshBasicMaterial({ color: [0xc6ffb0, 0xa9d8ff, 0xffd5a8][i], transparent: true, opacity: .68 }),
        );
        m.position.set(-20 + i * 15, 18 + i * 5, -31);
        skin.add(m);
      }
    }

    if (key === 'HARBOR') {
      for (let i = 0; i < 7; i++) {
        const cloud = new THREE.Mesh(
          new THREE.SphereGeometry(1.5 + (i % 2), 10, 7),
          new THREE.MeshBasicMaterial({ color: 0xd9f6ff, transparent: true, opacity: .12, depthWrite: false }),
        );
        cloud.scale.set(2.4, .5, 1);
        cloud.position.set(-18 + i * 5, 13 + (i % 2), -10 + Math.sin(i) * 5);
        skin.add(cloud);
      }
    }

    if (key === 'CITADEL') {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(5.2, .12, 8, 72),
        new THREE.MeshBasicMaterial({ color: 0xe8c778, transparent: true, opacity: .55 }),
      );
      ring.rotation.x = .42;
      ring.position.set(-18, 27, -30);
      skin.add(ring);
    }

    if (key === 'ARTS') {
      for (let i = 0; i < 5; i++) {
        const ribbon = new THREE.Mesh(
          new THREE.TorusGeometry(7 + i * 2.2, .045, 6, 96),
          new THREE.MeshBasicMaterial({ color: [0x8ee7ff, 0xff8fdc, 0xffd77a][i % 3], transparent: true, opacity: .25 }),
        );
        ribbon.rotation.x = Math.PI / 2.4;
        ribbon.rotation.z = i * .33;
        ribbon.position.y = 17 + i * 2;
        skin.add(ribbon);
      }
    }

    if (key === 'WILDS') {
      for (let i = 0; i < 14; i++) {
        const canopy = new THREE.Mesh(
          new THREE.SphereGeometry(1.8 + Math.random() * 1.4, 10, 8),
          new THREE.MeshBasicMaterial({ color: 0x6e9b72, transparent: true, opacity: .13, depthWrite: false }),
        );
        canopy.scale.y = .45;
        canopy.position.set((Math.random() - .5) * 36, 14 + Math.random() * 5, (Math.random() - .5) * 30);
        skin.add(canopy);
      }
    }

    if (key === 'CITADEL' || key === 'ARTS') {
      const rain = new THREE.Group();
      rain.name = 'reality-rain';
      const material = new THREE.MeshBasicMaterial({ color: key === 'CITADEL' ? 0xb9e8ff : 0xffb8f0, transparent: true, opacity: .28 });
      for (let i = 0; i < 30; i++) {
        const glyph = new THREE.Mesh(new THREE.PlaneGeometry(.05, .7 + (i % 5) * .18), material);
        glyph.position.set((Math.random() - .5) * 34, 5 + Math.random() * 27, (Math.random() - .5) * 34);
        glyph.userData.fallSpeed = .7 + Math.random() * 1.2;
        rain.add(glyph);
      }
      skin.add(rain);
    }

    skin.visible = key === 'HARBOR';
    skins[key] = skin;
    root.add(skin);
  }

  let active: DistrictKey = 'HARBOR';
  function update(dt: number, playerX: number, playerZ: number) {
    let nearest = Infinity;
    for (const key of Object.keys(DISTRICT_VISUALS) as DistrictKey[]) {
      const d = DISTRICT_VISUALS[key];
      const distance = Math.hypot(playerX - d.center.x, playerZ - d.center.z);
      if (distance < nearest) { nearest = distance; active = key; }
    }
    for (const key of Object.keys(skins) as DistrictKey[]) {
      skins[key].visible = key === active;
      skins[key].rotation.y += dt * .002;
      const rain = skins[key].getObjectByName('reality-rain');
      rain?.children.forEach(glyph => {
        glyph.position.y -= dt * (glyph.userData.fallSpeed ?? 1);
        if (glyph.position.y < 3) glyph.position.y = 31;
      });
    }
    root.userData.activeWorld = active;
  }

  return { root, update };
}
