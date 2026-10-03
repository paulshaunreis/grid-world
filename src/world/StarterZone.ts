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
  spawn: new THREE.Vector3(0, 24, 0),
  welcome: 'Your personal starting place. Learn the Grid, meet your first guides, and begin building.',
};

/**
 * First Light v2 — the full tiered district.
 * Paul's rules: main area HIGH UP (+24m), grand stairs DOWN through the world,
 * generous spacing (no clutter), sight lines protected, FFXIV district scale.
 *
 * Tiers: Overlook +32 · Dawn Plaza +24 (spawn) · Gate Terrace +24 ·
 *         Residential +16 · Market +8 · Quiet Grove 0
 */
export class StarterZone {
  readonly definition = FIRST_LIGHT_STARTER_ZONE;
  readonly group = new THREE.Group();
  private gateRings: THREE.Object3D[] = [];

  private stone = new THREE.MeshStandardMaterial({ color: 0x2a3b4d, roughness: 0.9 });
  private stoneLight = new THREE.MeshStandardMaterial({ color: 0x3a4f63, roughness: 0.85 });
  private glowCyan = new THREE.MeshStandardMaterial({
    color: 0x35e0ff, emissive: 0x35e0ff, emissiveIntensity: 1.6, roughness: 0.4,
  });
  private grass = new THREE.MeshStandardMaterial({ color: 0x2d5a3d, roughness: 0.95 });

  constructor() {
    this.group.name = 'StarterZone:FirstLight';

    // --- Dawn Plaza (+24): the high main hub, spawn ---
    this.makeDiscPlatform(0, 24, 0, 28, 26, this.stone);
    this.makeGlowRing(0, 24.05, 0, 18);

    // --- Gate Terrace (+24): east, the World Gate ---
    this.makeBoxPlatform(64, 24, 0, 48, 48, this.stoneLight);
    this.makeEdgeTrim(64, 24, 0, 48, 48);
    this.loadGate(64, 24, 0);

    // Walkway: plaza east edge to terrace west edge (same level, no stairs).
    this.makeWalkway(28, 24, 0, 40, 24, 0, 8);

    // --- The Overlook (+32): north spire viewpoint ---
    this.makeDiscPlatform(0, 32, -72, 15, 14, this.stoneLight);
    this.makeGlowRing(0, 32.05, -72, 10);
    this.makeStairs(0, 24, -28, 0, 32, -58, 8); // plaza north edge up to overlook

    // --- Residential Wards (+16): NE and SW terraces ---
    this.makeBoxPlatform(48, 16, -48, 32, 32, this.stone);
    this.makeBoxPlatform(-48, 16, 48, 32, 32, this.stone);
    this.makeStairs(28, 24, -28, 40, 16, -40, 6); // plaza to NE wards
    this.makeStairs(-28, 24, 28, -40, 16, 40, 6); // plaza to SW wards
    // A few homes: simple spaced houses (placeholder massing, generous gaps).
    this.makeHouse(48, 16, -52);
    this.makeHouse(56, 16, -42);
    this.makeHouse(-48, 16, 44);
    this.makeHouse(-56, 16, 54);

    // --- Tethered Market (+8): west terraces ---
    this.makeBoxPlatform(-58, 8, 0, 36, 36, this.stone);
    this.makeStairs(-28, 24, 0, -42, 8, 0, 10); // grand market stairs (16m drop)
    // Market stalls: spaced in a loose row, 6m apart.
    for (let i = -2; i <= 2; i++) this.makeStall(-58, 8, i * 6);

    // --- Quiet Grove (0): south sunken garden ---
    this.makeDiscPlatform(0, 0, 78, 26, 24, this.grass);
    this.makeGlowRing(0, 0.05, 78, 16);
    this.makeStairs(-44, 8, 12, -20, 0, 62, 6); // market down to grove
    this.makeStairs(-40, 16, 56, -16, 0, 70, 6); // SW wards down to grove
    // Grove trees: spaced, breathing room.
    for (const [tx, tz] of [[-10, 72], [10, 72], [0, 86], [-14, 84], [14, 84]] as const)
      this.makeTree(tx, 0, tz);

    // Lanterns: a few per district, widely spaced. Only half carry real
    // lights — the rest are emissive-only. (Mobile GPU budget.)
    this.makeLantern(-16, 24, -12, true); this.makeLantern(16, 24, -12, false);
    this.makeLantern(-16, 24, 12, false); this.makeLantern(16, 24, 12, true);
    this.makeLantern(56, 24, -16, true); this.makeLantern(72, 24, 16, false);
    this.makeLantern(-58, 8, -12, true); this.makeLantern(-58, 8, 12, false);
  }

  // --- Builders ---

  private makeDiscPlatform(x: number, y: number, z: number, rTop: number, rBot: number, mat: THREE.Material) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, 1.2, 48), mat);
    m.position.set(x, y - 0.6, z);
    m.receiveShadow = true;
    this.group.add(m);
  }

  private makeBoxPlatform(x: number, y: number, z: number, w: number, d: number, mat: THREE.Material) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, 1.4, d), mat);
    m.position.set(x, y - 0.7, z);
    m.receiveShadow = true; m.castShadow = true;
    this.group.add(m);
  }

  private makeGlowRing(x: number, y: number, z: number, r: number) {
    const m = new THREE.Mesh(new THREE.TorusGeometry(r, 0.14, 8, 64), this.glowCyan);
    m.rotation.x = Math.PI / 2;
    m.position.set(x, y, z);
    this.group.add(m);
  }

  private makeEdgeTrim(x: number, y: number, z: number, w: number, d: number) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w + 0.4, 0.18, d + 0.4), this.glowCyan);
    m.position.set(x, y - 0.05, z);
    this.group.add(m);
  }

  private makeWalkway(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, width: number) {
    const dx = x2 - x1, dz = z2 - z1;
    const len = Math.hypot(dx, dz);
    const m = new THREE.Mesh(new THREE.BoxGeometry(len, 1.0, width), this.stoneLight);
    m.position.set((x1 + x2) / 2, (y1 + y2) / 2 - 0.5, (z1 + z2) / 2);
    m.rotation.y = -Math.atan2(dz, dx);
    m.receiveShadow = true;
    this.group.add(m);
  }

  /** Grand staircase between two points at different heights. */
  private makeStairs(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, width: number) {
    const dx = x2 - x1, dz = z2 - z1, dy = y2 - y1;
    const horiz = Math.hypot(dx, dz);
    const steps = Math.max(4, Math.round(Math.abs(dy) / 0.5));
    const rise = dy / steps;
    const run = horiz / steps;
    const angle = Math.atan2(dz, dx);
    for (let i = 0; i < steps; i++) {
      const t = (i + 0.5) / steps;
      const step = new THREE.Mesh(
        new THREE.BoxGeometry(run + 0.08, 0.55, width),
        i % 2 === 0 ? this.stone : this.stoneLight,
      );
      step.position.set(x1 + dx * t, y1 + dy * t - 0.28, z1 + dz * t);
      step.rotation.y = -angle;
      step.castShadow = true; step.receiveShadow = true;
      this.group.add(step);
    }
    // Glowing handrails on both sides.
    for (const side of [-1, 1]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(horiz, 0.12, 0.14), this.glowCyan);
      const px = -Math.sin(angle) * side * (width / 2 + 0.25);
      const pz = Math.cos(angle) * side * (width / 2 + 0.25);
      rail.position.set((x1 + x2) / 2 + px, (y1 + y2) / 2 + 1.0, (z1 + z2) / 2 + pz);
      rail.rotation.y = -angle;
      rail.rotation.z = Math.atan2(dy, horiz) * (dx >= 0 ? 1 : -1);
      this.group.add(rail);
      for (let i = 0; i <= 3; i++) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 1.0, 8), this.stoneLight);
        const t = i / 3;
        post.position.set(x1 + dx * t + px, y1 + dy * t + 0.5, z1 + dz * t + pz);
        this.group.add(post);
      }
    }
  }

  private makeHouse(x: number, y: number, z: number) {
    const g = new THREE.Group();
    const base = new THREE.Mesh(new THREE.BoxGeometry(6, 3.4, 5), this.stoneLight);
    base.position.y = 1.7; base.castShadow = true; base.receiveShadow = true;
    const roof = new THREE.Mesh(new THREE.ConeGeometry(4.6, 2.2, 4), this.stone);
    roof.position.y = 4.5; roof.rotation.y = Math.PI / 4; roof.castShadow = true;
    const doorGlow = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2.2), this.glowCyan);
    doorGlow.position.set(0, 1.1, 2.52);
    g.add(base, roof, doorGlow);
    g.position.set(x, y, z);
    g.rotation.y = (x * 13 + z * 7) % (Math.PI / 2);
    this.group.add(g);
  }

  private makeStall(x: number, y: number, z: number) {
    const g = new THREE.Group();
    const counter = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.1, 1.6), this.stoneLight);
    counter.position.y = 0.55; counter.castShadow = true;
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.12, 2.2),
      new THREE.MeshStandardMaterial({ color: 0x1f6f8a, roughness: 0.7 }));
    canopy.position.y = 2.4; canopy.castShadow = true;
    for (const [px, pz] of [[-1.4, -0.9], [1.4, -0.9], [-1.4, 0.9], [1.4, 0.9]] as const) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.4, 8), this.stone);
      pole.position.set(px, 1.2, pz);
      g.add(pole);
    }
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8),
      new THREE.MeshStandardMaterial({ color: 0xffe0b0, emissive: 0xffc878, emissiveIntensity: 2.4 }));
    lamp.position.y = 2.1;
    // Emissive-only: no real light per stall (mobile GPU budget).
    g.add(counter, canopy, lamp);
    g.position.set(x, y, z);
    this.group.add(g);
  }

  private makeTree(x: number, y: number, z: number) {
    const g = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 3.2, 8),
      new THREE.MeshStandardMaterial({ color: 0x4a3a28, roughness: 0.9 }));
    trunk.position.y = 1.6; trunk.castShadow = true;
    const crown = new THREE.Mesh(new THREE.SphereGeometry(2.4, 12, 10),
      new THREE.MeshStandardMaterial({ color: 0x3d7a4d, roughness: 0.85 }));
    crown.position.y = 4.4; crown.castShadow = true;
    const crownGlow = new THREE.Mesh(new THREE.SphereGeometry(1.2, 10, 8),
      new THREE.MeshStandardMaterial({ color: 0x66ffcc, emissive: 0x44ddaa, emissiveIntensity: 0.7, transparent: true, opacity: 0.5 }));
    crownGlow.position.y = 4.0;
    g.add(trunk, crown, crownGlow);
    g.position.set(x, y, z);
    const s = 0.85 + ((x * 7 + z * 13) % 10) / 40;
    g.scale.setScalar(Math.max(0.7, s));
    this.group.add(g);
  }

  private makeLantern(x: number, y: number, z: number, withLight: boolean) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 3.4, 8), this.stoneLight);
    pole.position.set(x, y + 1.7, z);
    pole.castShadow = true;
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 10),
      new THREE.MeshStandardMaterial({ color: 0xbfefff, emissive: 0x66d8ff, emissiveIntensity: 2.2 }));
    lamp.position.set(x, y + 3.6, z);
    this.group.add(pole, lamp);
    if (withLight) {
      const light = new THREE.PointLight(0x66d8ff, 12, 14);
      light.position.set(x, y + 3.6, z);
      this.group.add(light);
    }
  }

  private loadGate(x: number, y: number, z: number) {
    new GLTFLoader().loadAsync('/models/landmarks/world-gate.glb').then(gltf => {
      const gate = gltf.scene;
      gate.position.set(x, y, z);
      gate.rotation.y = -Math.PI / 2; // rings face west toward the plaza
      gate.traverse(o => { if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).castShadow = true; });
      this.group.add(gate);
      gate.traverse(o => { if (/ring/i.test(o.name)) this.gateRings.push(o); });
    }).catch(() => {
      const marker = new THREE.Mesh(
        new THREE.OctahedronGeometry(1.2, 1),
        new THREE.MeshStandardMaterial({ color: 0xdce9f2, emissive: 0x35e0ff, emissiveIntensity: 2 }),
      );
      marker.position.set(x, y + 3, z);
      this.group.add(marker);
      this.gateRings.push(marker);
    });
  }

  /** Idle animation: gate rings breathe. */
  pulse(time: number) {
    for (let i = 0; i < this.gateRings.length; i++) {
      const ring = this.gateRings[i];
      ring.rotation.y = time * 0.05 * (i % 2 === 0 ? 1 : -1);
    }
  }
}
