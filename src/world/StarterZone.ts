import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface StarterZoneDefinition {
  id: string;
  name: string;
  spawn: THREE.Vector3;
  welcome: string;
}

export const FIRST_LIGHT_STARTER_ZONE: StarterZoneDefinition = {
  id: 'starter:first-light',
  name: 'First Light',
  spawn: new THREE.Vector3(0, 0, 8),
  welcome: 'Your personal starting place. Learn the Grid, meet your first guides, and begin building.',
};

/**
 * First Light v2 — Dawn Plaza + Gate Terrace.
 * Paul's rules: main area high up, grand stairs down through the world,
 * generous spacing (no clutter), sight line from plaza to the World Gate.
 * v1: plaza at y=0, gate terrace at y=+12 with a grand staircase.
 * (Full +24m district elevation + five more tiers land with the terrain system.)
 */
export class StarterZone {
  readonly definition = FIRST_LIGHT_STARTER_ZONE;
  readonly group = new THREE.Group();
  private gateRings: THREE.Object3D[] = [];
  private time = 0;

  constructor() {
    this.group.name = 'StarterZone:FirstLight';
    const stone = new THREE.MeshStandardMaterial({ color: 0x2a3b4d, roughness: 0.9 });
    const stoneLight = new THREE.MeshStandardMaterial({ color: 0x3a4f63, roughness: 0.85 });
    const glowCyan = new THREE.MeshStandardMaterial({
      color: 0x35e0ff, emissive: 0x35e0ff, emissiveIntensity: 1.6, roughness: 0.4,
    });

    // --- Dawn Plaza: the main ground-level hub (spawn) ---
    const plaza = new THREE.Mesh(new THREE.CylinderGeometry(20, 23, 0.6, 48), stone);
    plaza.position.set(0, -0.3, 8);
    plaza.receiveShadow = true;
    this.group.add(plaza);

    // Plaza inlay ring — guides the eye toward the stairs and the gate.
    const inlay = new THREE.Mesh(new THREE.TorusGeometry(14, 0.12, 8, 64), glowCyan);
    inlay.rotation.x = Math.PI / 2;
    inlay.position.set(0, 0.02, 8);
    this.group.add(inlay);

    // --- Gate Terrace: raised platform at y=+12, east of the plaza ---
    const terrace = new THREE.Mesh(new THREE.BoxGeometry(48, 12.6, 48), stoneLight);
    terrace.position.set(64, 5.7, 8); // top surface at y=12
    terrace.receiveShadow = true;
    terrace.castShadow = true;
    this.group.add(terrace);

    // Terrace edge trim — cyan line marking the drop.
    const trim = new THREE.Mesh(new THREE.BoxGeometry(48.4, 0.18, 48.4), glowCyan);
    trim.position.set(64, 11.95, 8);
    this.group.add(trim);

    // --- Grand staircase: plaza (y=0) up to terrace (y=12) ---
    // 24 steps, 0.5m rise each, ~0.95m run. Wide ceremonial stairs.
    const stepCount = 24;
    const stepRise = 0.5;
    const stepRun = 0.95;
    const stairWidth = 10;
    const stairStartX = 18;
    for (let i = 0; i < stepCount; i++) {
      const step = new THREE.Mesh(
        new THREE.BoxGeometry(stepRun + 0.06, stepRise, stairWidth),
        i % 2 === 0 ? stone : stoneLight,
      );
      step.position.set(
        stairStartX + i * stepRun + stepRun / 2,
        (i + 0.5) * stepRise - 0.3,
        8,
      );
      step.castShadow = true;
      step.receiveShadow = true;
      this.group.add(step);
    }
    // Stair railings — low glowing walls on both sides.
    for (const side of [-1, 1]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(stepCount * stepRun, 0.9, 0.35), stoneLight);
      rail.position.set(stairStartX + (stepCount * stepRun) / 2, 6.4, 8 + side * (stairWidth / 2 + 0.2));
      rail.rotation.z = Math.atan2(12, stepCount * stepRun);
      rail.castShadow = true;
      this.group.add(rail);
      const railGlow = new THREE.Mesh(new THREE.BoxGeometry(stepCount * stepRun, 0.1, 0.12), glowCyan);
      railGlow.position.set(stairStartX + (stepCount * stepRun) / 2, 6.95, 8 + side * (stairWidth / 2 + 0.2));
      railGlow.rotation.z = rail.rotation.z;
      this.group.add(railGlow);
    }

    // --- The World Gate itself, on the terrace ---
    // Gate model: 30m tall, origin at plaza ground level. Terrace top is y=12.
    new GLTFLoader().loadAsync('/models/landmarks/world-gate.glb').then(gltf => {
      const gate = gltf.scene;
      gate.position.set(64, 12, 8);
      // Face the rings west toward the stairs and plaza (model faces +Z by default).
      gate.rotation.y = -Math.PI / 2;
      gate.traverse(o => { if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).castShadow = true; });
      this.group.add(gate);
      // Collect ring nodes for the idle lock-in shimmer (named in the build).
      gate.traverse(o => { if (/ring/i.test(o.name)) this.gateRings.push(o); });
    }).catch(() => {
      // Honest fallback: a simple glowing marker if the landmark can't load.
      const marker = new THREE.Mesh(
        new THREE.OctahedronGeometry(1.2, 1),
        new THREE.MeshStandardMaterial({ color: 0xdce9f2, emissive: 0x35e0ff, emissiveIntensity: 2 }),
      );
      marker.position.set(64, 15, 8);
      this.group.add(marker);
      this.gateRings.push(marker);
    });

    // --- A few spaced lanterns on the plaza (breathing room, not clutter) ---
    for (const [lx, lz] of [[-12, -4], [12, -4], [-12, 20], [12, 20]] as const) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 3.4, 8), stoneLight);
      pole.position.set(lx, 1.7, lz);
      pole.castShadow = true;
      const lamp = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 12, 10),
        new THREE.MeshStandardMaterial({ color: 0xbfefff, emissive: 0x66d8ff, emissiveIntensity: 2.2 }),
      );
      lamp.position.set(lx, 3.6, lz);
      const light = new THREE.PointLight(0x66d8ff, 12, 14);
      light.position.set(lx, 3.6, lz);
      this.group.add(pole, lamp, light);
    }
  }

  /** Idle animation: gate rings breathe, glyph shimmer. */
  pulse(time: number) {
    this.time = time;
    for (let i = 0; i < this.gateRings.length; i++) {
      const ring = this.gateRings[i];
      ring.rotation.y = time * 0.05 * (i % 2 === 0 ? 1 : -1);
    }
  }
}
