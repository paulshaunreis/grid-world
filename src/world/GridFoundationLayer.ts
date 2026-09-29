import * as THREE from 'three';

export type GridWeather = 'clear' | 'rain' | 'storm' | 'mist' | 'aurora';

export interface GridFoundationLayer {
  root: THREE.Group;
  weather: GridWeather;
  authorized: boolean;
  setAuthorized(allowed: boolean): void;
  update(dt: number, elapsed: number): void;
}

export function createGridFoundationLayer(): GridFoundationLayer {
  const root = new THREE.Group();
  root.name = 'grid-foundation-layer';
  root.position.y = -8;
  root.visible = false;
  root.userData.access = 'team-or-authorized-foundation';
  root.userData.artDirection = 'technical foundation beneath many visual worlds';

  const grid = new THREE.GridHelper(240, 120, 0x2a8cff, 0x12304d);
  grid.material.transparent = true;
  grid.material.opacity = .55;
  root.add(grid);

  const underGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(240, 240),
    new THREE.MeshBasicMaterial({
      color: 0x06101e,
      transparent: true,
      opacity: .72,
      side: THREE.DoubleSide,
    }),
  );
  underGlow.rotation.x = -Math.PI / 2;
  underGlow.position.y = -.04;
  root.add(underGlow);

  const rings = new THREE.Group();
  rings.name = 'foundation-orbits';
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(new THREE.RingGeometry(18 + i * 14, 18.06 + i * 14, 96), new THREE.MeshBasicMaterial({ color: 0x315c78, transparent: true, opacity: .18, side: THREE.DoubleSide }));
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = .06 + i * .015;
    rings.add(ring);
  }
  root.add(rings);

  const nodes = new THREE.Group();
  nodes.name = 'foundation-nodes';
  for (let x = -100; x <= 100; x += 20) {
    for (let z = -100; z <= 100; z += 20) {
      if ((Math.abs(x / 20) + Math.abs(z / 20)) % 3 !== 0) continue;
      const node = new THREE.Mesh(
        new THREE.SphereGeometry(.06, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0x5fdcff, transparent: true, opacity: .4 }),
      );
      node.position.set(x, .08, z);
      nodes.add(node);
    }
  }
  root.add(nodes);

  const weather = new THREE.Group();
  weather.name = 'foundation-weather';

  const rainCount = 900;
  const rainPositions = new Float32Array(rainCount * 3);
  for (let i = 0; i < rainCount; i++) {
    rainPositions[i * 3] = (Math.random() - .5) * 180;
    rainPositions[i * 3 + 1] = Math.random() * 45;
    rainPositions[i * 3 + 2] = (Math.random() - .5) * 180;
  }
  const rainGeometry = new THREE.BufferGeometry();
  rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
  const rain = new THREE.Points(
    rainGeometry,
    new THREE.PointsMaterial({ color: 0x72cfff, size: .055, transparent: true, opacity: .42 }),
  );
  rain.visible = false;
  weather.add(rain);

  const mist = new THREE.Mesh(
    new THREE.PlaneGeometry(170, 170),
    new THREE.MeshBasicMaterial({ color: 0x294765, transparent: true, opacity: .08, side: THREE.DoubleSide }),
  );
  mist.rotation.x = -Math.PI / 2;
  mist.position.y = 1.2;
  weather.add(mist);

  root.add(weather);

  let currentWeather: GridWeather = 'clear';
  let authorized = false;
  let time = 0;

  function setAuthorized(allowed: boolean) {
    authorized = allowed;
    root.visible = allowed;
  }

  function update(dt: number, elapsed: number) {
    time += dt;
    if (!authorized) return;

    const cycle = Math.floor(elapsed / 55) % 5;
    currentWeather = (['clear', 'rain', 'mist', 'aurora', 'storm'] as GridWeather[])[cycle];

    rain.visible = currentWeather === 'rain' || currentWeather === 'storm';
    mist.material.opacity = currentWeather === 'mist' || currentWeather === 'storm' ? .13 : .045;

    if (currentWeather === 'storm') {
      const intensity = .5 + Math.sin(time * 7) * .15;
      (rain.material as THREE.PointsMaterial).opacity = intensity;
    }

    const positions = rain.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < rainCount; i++) {
      let y = positions.getY(i) - dt * (currentWeather === 'storm' ? 26 : 18);
      if (y < 0) y = 45;
      positions.setY(i, y);
    }
    positions.needsUpdate = true;

    rings.rotation.y -= dt * .012;
    nodes.rotation.y += dt * .004;
    if (currentWeather === 'aurora') {
      nodes.children.forEach((node, i) => {
        const pulse = .35 + Math.sin(time * 1.8 + i * .4) * .2;
        (node.material as THREE.MeshBasicMaterial).opacity = pulse;
      });
    }
  }

  return {
    root,
    get weather() { return currentWeather; },
    get authorized() { return authorized; },
    setAuthorized,
    update,
  };
}
