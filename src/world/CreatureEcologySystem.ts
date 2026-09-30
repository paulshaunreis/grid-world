import * as THREE from 'three';
import { createStarterPBRMaterial } from '../engine/GridPBRLibrary';
import { traversalHit, steerAround } from './TraversalSystem';

export type EcologyWorld = 'HARBOR' | 'GARDENS' | 'CITADEL' | 'ARTS' | 'WILDS';
export type CreatureLifeState = 'FORAGE' | 'REST' | 'SOCIALIZE' | 'EXPLORE' | 'MIGRATE' | 'PLAY';

type Species = {
  id: string;
  name: string;
  world: EcologyWorld;
  color: string;
  accent: string;
  size: number;
  speed: number;
  social: number;
  nocturnal?: boolean;
  center: { x: number; z: number };
  radius: number;
};

type Creature = {
  root: THREE.Group;
  species: Species;
  state: CreatureLifeState;
  stateTimer: number;
  phase: number;
  target: THREE.Vector3;
  hunger: number;
  energy: number;
  social: number;
  curiosity: number;
};

export interface EcologySnapshot {
  population: number;
  visible: number;
  active: number;
  state: CreatureLifeState;
  species: number;
  world: EcologyWorld;
}

const SPECIES: readonly Species[] = [
  { id:'tideline-skimmer', name:'Tide Skimmer', world:'HARBOR', color:'#527b91', accent:'#72e8ef', size:.72, speed:1.05, social:.75, center:{x:22,z:-27}, radius:7 },
  { id:'reef-runner', name:'Reef Runner', world:'HARBOR', color:'#8a6f53', accent:'#ffd36a', size:.62, speed:.9, social:.6, center:{x:27,z:-21}, radius:6 },
  { id:'canopy-moth', name:'Canopy Moth', world:'GARDENS', color:'#718f73', accent:'#c8ff9b', size:.38, speed:1.25, social:.9, center:{x:25,z:18}, radius:8, nocturnal:true },
  { id:'moss-fox', name:'Moss Fox', world:'GARDENS', color:'#876a55', accent:'#9cf2c1', size:.58, speed:.82, social:.45, center:{x:20,z:24}, radius:7 },
  { id:'glass-antler', name:'Glass Antler', world:'GARDENS', color:'#657e79', accent:'#8fe388', size:.85, speed:.7, social:.8, center:{x:28,z:13}, radius:6 },
  { id:'crown-kite', name:'Crown Kite', world:'CITADEL', color:'#66738b', accent:'#c6a6ff', size:.45, speed:1.35, social:.65, center:{x:-22,z:-24}, radius:8 },
  { id:'stone-hare', name:'Stone Hare', world:'CITADEL', color:'#77746e', accent:'#d7b46a', size:.52, speed:.88, social:.5, center:{x:-17,z:-20}, radius:6 },
  { id:'gallery-swallow', name:'Gallery Swallow', world:'ARTS', color:'#705f86', accent:'#ff9fe5', size:.4, speed:1.3, social:.95, center:{x:20,z:-18}, radius:7 },
  { id:'muse-cat', name:'Muse Cat', world:'ARTS', color:'#4e5268', accent:'#ffb9ee', size:.5, speed:.72, social:.7, center:{x:15,z:-13}, radius:5 },
  { id:'frontier-wolf', name:'Frontier Wolf', world:'WILDS', color:'#53657a', accent:'#76eaff', size:.76, speed:.95, social:.9, center:{x:-23,z:19}, radius:8 },
  { id:'ember-boar', name:'Ember Boar', world:'WILDS', color:'#785b48', accent:'#ff9d62', size:.82, speed:.68, social:.7, center:{x:-28,z:25}, radius:7 },
  { id:'lumen-stag', name:'Lumen Stag', world:'WILDS', color:'#6d715f', accent:'#c9f29a', size:.9, speed:.72, social:.85, center:{x:-17,z:27}, radius:8 },
];

export class CreatureEcologySystem {
  readonly root = new THREE.Group();
  private readonly creatures: Creature[] = [];
  private readonly activeStates: Record<CreatureLifeState, number> = {
    FORAGE:0, REST:0, SOCIALIZE:0, EXPLORE:0, MIGRATE:0, PLAY:0,
  };
  private snapshot: EcologySnapshot = { population:0, visible:0, active:0, state:'EXPLORE', species:0, world:'HARBOR' };

  constructor() {
    this.root.name = 'grid-creature-ecology';
    for (const species of SPECIES) this.spawnSpecies(species, species.social > .8 ? 3 : 2);
  }

  private spawnSpecies(species: Species, count: number) {
    for (let i=0;i<count;i++) {
      const root = this.createCreatureMesh(species);
      const angle = (i / count) * Math.PI * 2 + species.id.length;
      root.position.set(
        species.center.x + Math.cos(angle) * species.radius * .45,
        species.id.includes('moth') || species.id.includes('swallow') || species.id.includes('kite') ? 2.2 : 0,
        species.center.z + Math.sin(angle) * species.radius * .45,
      );
      root.userData.gridObjectKind = 'creature';
      root.userData.species = species.id;
      root.userData.interactable = true;
      root.userData.interactionName = species.name;
      root.userData.combatFaction = 'CREATURE';
      root.userData.maxHealth = species.nocturnal ? 70 : 100;
      root.userData.damage = 8;
      this.root.add(root);
      this.creatures.push({
        root, species, state:'EXPLORE', stateTimer:2 + i,
        phase:i * 1.7 + species.id.length, target:root.position.clone(),
        hunger:.2 + i*.07, energy:.75 - i*.04, social:.5, curiosity:.65,
      });
    }
  }

  private createCreatureMesh(species: Species) {
    const root = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(.42 * species.size, 10, 7),
      createStarterPBRMaterial('skin', { color:species.color, roughness:.78 }),
    );
    body.scale.set(1.35, .78, .82);
    body.position.y = .52 * species.size + (species.nocturnal ? .02 : 0);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(.3 * species.size, 9, 7),
      createStarterPBRMaterial('skin', { color:species.color, roughness:.74 }),
    );
    head.position.set(0, .68 * species.size, -.43 * species.size);

    const marker = new THREE.Mesh(
      new THREE.TorusGeometry(.18 * species.size, .035 * species.size, 5, 12),
      createStarterPBRMaterial('technical', { color:species.accent, emissive:species.accent, emissiveIntensity:.4 }),
    );
    marker.rotation.x = Math.PI / 2;
    marker.position.y = .74 * species.size;

    root.add(body, head, marker);
    return root;
  }

  private chooseState(c: Creature, event: string, phase: 'DAWN'|'DAY'|'DUSK'|'NIGHT') {
    const nocturnal = c.species.nocturnal && (phase === 'NIGHT' || phase === 'DUSK');
    if (event === 'MIGRATION' && c.species.world === 'WILDS') return 'MIGRATE';
    if (event === 'BLOOM' && c.species.world === 'GARDENS') return c.curiosity > .45 ? 'FORAGE' : 'SOCIALIZE';
    if (event === 'MARKET' && c.species.world === 'ARTS') return 'SOCIALIZE';
    if (event === 'TIDE' && c.species.world === 'HARBOR') return 'EXPLORE';
    if (event === 'AURORA' && c.species.world === 'CITADEL') return 'EXPLORE';
    if (c.energy < .25) return 'REST';
    if (c.hunger > .72) return 'FORAGE';
    if (c.social > .75 && c.species.social > .7) return 'SOCIALIZE';
    if (nocturnal) return 'EXPLORE';
    return c.curiosity > .62 ? 'EXPLORE' : 'FORAGE';
  }

  update(delta:number, playerX=0, playerZ=0, world:EcologyWorld='HARBOR', event='QUIET', phase:'DAWN'|'DAY'|'DUSK'|'NIGHT'='DAY') {
    const eventName = event.toUpperCase();
    for (const key of Object.keys(this.activeStates) as CreatureLifeState[]) this.activeStates[key] = 0;
    let visible = 0;
    let active = 0;

    for (const c of this.creatures) {
      const dx = c.root.position.x - playerX;
      const dz = c.root.position.z - playerZ;
      const distance = Math.hypot(dx,dz);
      const worldMatch = c.species.world === world;
      c.root.visible = distance < 52;
      if (!c.root.visible) continue;
      visible++;

      c.stateTimer -= delta;
      if (c.stateTimer <= 0) {
        c.state = this.chooseState(c,eventName,phase);
        c.stateTimer = 4 + ((c.phase * 13) % 7);
        this.activeStates[c.state]++;
      }

      c.hunger = Math.min(1, c.hunger + delta * .006);
      c.energy = Math.max(0, c.energy - delta * (c.state === 'EXPLORE' || c.state === 'MIGRATE' ? .012 : .004));
      c.social = Math.max(0, c.social - delta * .008);
      c.curiosity = Math.max(.2, c.curiosity - delta * .003);

      if (c.state === 'REST') c.energy = Math.min(1,c.energy + delta*.05);
      if (c.state === 'FORAGE') c.hunger = Math.max(0,c.hunger - delta*.045);
      if (c.state === 'SOCIALIZE') c.social = Math.min(1,c.social + delta*.04);
      if (c.state === 'EXPLORE') c.curiosity = Math.min(1,c.curiosity + delta*.018);
      if (c.state === 'PLAY') { c.energy = Math.max(0,c.energy-delta*.018); c.curiosity = Math.min(1,c.curiosity+delta*.035); }

      const targetRadius = c.state === 'MIGRATE' ? c.species.radius * 2.2 : c.species.radius;
      const targetAngle = c.phase + Math.sin(c.phase + c.stateTimer) * .8;
      if (c.stateTimer < .8 || c.target.distanceTo(c.root.position) < .5) {
        c.target.set(
          c.species.center.x + Math.cos(targetAngle) * targetRadius,
          c.root.position.y,
          c.species.center.z + Math.sin(targetAngle*1.23) * targetRadius * .72,
        );
      }

      const hit=traversalHit(c.root.position,c.target,.25);
      if(hit && hit.height>.25) steerAround(c.root.position,c.target,hit,c.target);
      const speedFactor = c.state === 'REST' ? .08 : c.state === 'MIGRATE' ? 1.8 : c.state === 'EXPLORE' ? 1.2 : c.state === 'PLAY' ? 1.35 : .7;
      if (worldMatch) active++;
      const speed = c.species.speed * speedFactor * (worldMatch ? 1 : .42);
      const tx = c.target.x - c.root.position.x;
      const tz = c.target.z - c.root.position.z;
      const length = Math.hypot(tx,tz);
      if (length > .05) {
        const step = Math.min(length,speed*delta);
        c.root.position.x += tx/length*step;
        c.root.position.z += tz/length*step;
        c.root.rotation.y = Math.atan2(tx,tz);
      }
      const hopping = c.state==='PLAY' || c.state==='MIGRATE' || c.state==='EXPLORE';
      const hopWave = Math.sin(c.phase*2.7 + performance.now()*.002 + c.species.id.length);
      const baseY = c.species.id.includes('moth') || c.species.id.includes('swallow') || c.species.id.includes('kite') ? 2.2 : 0;
      const hopHeight = hopping && hopWave > .82 ? (hopWave-.82)*3.2 : 0;
      c.root.position.y = baseY + hopHeight + Math.sin(c.phase + performance.now()*.0015) * (c.species.nocturnal ? .06 : .025);
      c.phase += delta * .5;
    }

    const state = (Object.entries(this.activeStates).sort((a,b)=>b[1]-a[1])[0]?.[0] ?? 'EXPLORE') as CreatureLifeState;
    this.snapshot = { population:this.creatures.length, visible, active, state, species:SPECIES.length, world };
    this.root.userData.ecology = this.snapshot;
  }

  getSnapshot() { return this.snapshot; }
}
