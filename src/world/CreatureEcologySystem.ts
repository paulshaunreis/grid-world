import * as THREE from 'three';
import { createStarterPBRMaterial } from '../engine/GridPBRLibrary';
import { traversalHit, steerAround } from './TraversalSystem';
import type { WorldConsequenceSnapshot } from './WorldConsequenceSystem';
import { getWorlds } from './GridWorldRegistry';
import { deriveWorldDNA } from './WorldDNA';

export type EcologyWorld = string;
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
  center: { x: number; y?: number; z: number };
  locomotion?: string[];
  bodyPlans?: string[];
  adaptations?: string[];
  habitatHeight?: number;
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
    const known = new Set(SPECIES.map(s => s.world));
    for (const species of SPECIES) this.spawnSpecies(species, species.social > .8 ? 3 : 2);

    // New registered worlds automatically receive native life without editing this file.
    for (const world of getWorlds()) {
      if (known.has(world.id)) continue;
      const dna = deriveWorldDNA(world.tags ?? []);
      const base = '#' + world.color.toString(16).padStart(6,'0');
      const accent = '#' + world.secondary.toString(16).padStart(6,'0');
      const center = { x: world.center.x, y: world.center.y, z: world.center.z };
      const generated: Species[] = [
        { id:world.id.toLowerCase()+'-wanderer', name:world.label+' Wanderer', world:world.id, color:base, accent, size:.55 + dna.ambientLife*.08, speed:.7 + dna.ambientLife*.18, social:.55, center, radius:7, locomotion:dna.creatureMorphology.locomotion, bodyPlans:dna.creatureMorphology.bodyPlans, adaptations:dna.creatureMorphology.adaptations, habitatHeight:world.tags?.includes('aerial')||world.tags?.includes('cloud')?4:world.tags?.includes('growth')?1.5:0 },
        { id:world.id.toLowerCase()+'-native', name:world.label+' Native', world:world.id, color:accent, accent:base, size:.42 + dna.ambientLife*.1, speed:.85 + dna.ambientLife*.22, social:.72, center, radius:9, nocturnal:dna.ecology.environmentalForces.includes('night'), locomotion:dna.creatureMorphology.locomotion, bodyPlans:dna.creatureMorphology.bodyPlans, adaptations:dna.creatureMorphology.adaptations, habitatHeight:world.tags?.includes('aerial')||world.tags?.includes('cloud')?5:world.tags?.includes('growth')?1.5:0 },
      ];
      for (const species of generated) this.spawnSpecies(species, dna.ecology.lifeDensity > 1.3 ? 3 : 2);
    }
  }

  /** Add native life for a world created after the ecology system was constructed. */
  registerWorld(world: { id:string; label:string; center:THREE.Vector3; color:number; secondary:number; tags?:readonly string[] }) {
    if (this.creatures.some(creature => creature.species.world === world.id)) return;
    const dna = deriveWorldDNA(world.tags ?? []);
    const base = '#' + world.color.toString(16).padStart(6,'0');
    const accent = '#' + world.secondary.toString(16).padStart(6,'0');
    const center = { x:world.center.x, y:world.center.y, z:world.center.z };
    const generated: Species[] = [
      { id:world.id.toLowerCase()+'-wanderer', name:world.label+' Wanderer', world:world.id, color:base, accent, size:.55+dna.ambientLife*.08, speed:.7+dna.ambientLife*.18, social:.55, center, radius:7, locomotion:dna.creatureMorphology.locomotion, bodyPlans:dna.creatureMorphology.bodyPlans, adaptations:dna.creatureMorphology.adaptations, habitatHeight:world.tags?.includes('aerial')||world.tags?.includes('cloud')?4:world.tags?.includes('growth')?1.5:0 },
      { id:world.id.toLowerCase()+'-native', name:world.label+' Native', world:world.id, color:accent, accent:base, size:.42+dna.ambientLife*.1, speed:.85+dna.ambientLife*.22, social:.72, center, radius:9, locomotion:dna.creatureMorphology.locomotion, bodyPlans:dna.creatureMorphology.bodyPlans, adaptations:dna.creatureMorphology.adaptations, habitatHeight:world.tags?.includes('aerial')||world.tags?.includes('cloud')?5:world.tags?.includes('growth')?1.5:0 },
    ];
    for (const species of generated) this.spawnSpecies(species, dna.ecology.lifeDensity > 1.3 ? 3 : 2);
  }

  private spawnSpecies(species: Species, count: number) {
    for (let i=0;i<count;i++) {
      const root = this.createCreatureMesh(species);
      const angle = (i / count) * Math.PI * 2 + species.id.length;
      root.position.set(
        species.center.x + Math.cos(angle) * species.radius * .45,
        (species.center.y ?? 0) + (species.habitatHeight ?? (species.id.includes('moth') || species.id.includes('swallow') || species.id.includes('kite') ? 2.2 : 0)),
        species.center.z + Math.sin(angle) * species.radius * .45,
      );
      root.userData.gridObjectKind = 'creature';
      root.userData.species = species.id;
      root.userData.combatId = species.id + ':' + i;
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
    const root=new THREE.Group();
    const plan=(species.bodyPlans?.[0] ?? 'native').toLowerCase();
    const locomotion=(species.locomotion?.[0] ?? 'walk').toLowerCase();
    const skin=createStarterPBRMaterial('skin',{color:species.color,roughness:.78});
    const accent=createStarterPBRMaterial('technical',{color:species.accent,emissive:species.accent,emissiveIntensity:.4});
    const body=new THREE.Mesh(new THREE.SphereGeometry(.42*species.size,10,7),skin);
    body.scale.set(plan.includes('streamlined')?1.7:plan.includes('armored')?1.5:1.35,plan.includes('six')?1:.78,plan.includes('finned')?1.05:.82);
    body.position.y=.52*species.size;
    const head=new THREE.Mesh(new THREE.SphereGeometry(.3*species.size,9,7),skin);
    head.position.set(0,.68*species.size,-.43*species.size);
    if(plan.includes('finned')){const fin=new THREE.Mesh(new THREE.ConeGeometry(.16*species.size,.65*species.size,6),accent);fin.rotation.z=Math.PI/2;fin.position.set(0,.5*species.size,.48*species.size);root.add(fin);}
    if(plan.includes('winged')||plan.includes('feathered')) for(const side of [-1,1]){const wing=new THREE.Mesh(new THREE.PlaneGeometry(.9*species.size,.42*species.size),accent);wing.position.set(side*.52*species.size,.75*species.size,0);wing.rotation.set(side*.25,0,side*.35);root.add(wing);}
    if(plan.includes('ribboned')) for(const side of [-1,1]){const ribbon=new THREE.Mesh(new THREE.TorusGeometry(.45*species.size,.035*species.size,5,18),accent);ribbon.position.set(side*.5*species.size,.55*species.size,.2*species.size);ribbon.rotation.y=side*.5;root.add(ribbon);}
    if(plan.includes('antlered')) for(const side of [-1,1]){const antler=new THREE.Mesh(new THREE.TorusGeometry(.16*species.size,.035*species.size,5,12),accent);antler.position.set(side*.2*species.size,.95*species.size,-.35*species.size);antler.rotation.y=side*.7;root.add(antler);}
    if(plan.includes('six-limbed')||locomotion.includes('climb')) for(let i=0;i<(plan.includes('six')?6:4);i++){const side=i%2===0?-1:1;const leg=new THREE.Mesh(new THREE.CylinderGeometry(.035*species.size,.06*species.size,.55*species.size,6),skin);leg.position.set(side*(.3+.08*Math.floor(i/2))*species.size,.25*species.size,(i%3-1)*.22*species.size);leg.rotation.z=side*.55;root.add(leg);}
    const marker=new THREE.Mesh(new THREE.TorusGeometry(.18*species.size,.035*species.size,5,12),accent);marker.rotation.x=Math.PI/2;marker.position.y=.74*species.size;
    root.add(body,head,marker);
    root.userData.bodyPlan=plan;root.userData.locomotion=species.locomotion ?? ['walk'];root.userData.adaptations=species.adaptations ?? [];
    return root;
  }

  private chooseState(c: Creature, event: string, phase: 'DAWN'|'DAY'|'DUSK'|'NIGHT', pressure=0, stability=1) {
    if (pressure > .72 && c.species.world === 'WILDS') return 'MIGRATE';
    if (stability < .35 && c.energy < .55) return 'REST';
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

  update(delta:number, playerX=0, playerZ=0, world:EcologyWorld='HARBOR', event='QUIET', phase:'DAWN'|'DAY'|'DUSK'|'NIGHT'='DAY', consequences?:WorldConsequenceSnapshot, transitFlow=0) {
    const pressure=consequences?.pressure ?? 0;
    const stability=consequences?.stability ?? 1;
    const transitBoost=THREE.MathUtils.clamp(transitFlow*.08,0,.45);
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
        c.state = this.chooseState(c,eventName,phase,pressure,stability);
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
          (c.species.center.y ?? 0) + (c.species.habitatHeight ?? 0),
          c.species.center.z + Math.sin(targetAngle*1.23) * targetRadius * .72,
        );
      }

      const hit=traversalHit(c.root.position,c.target,.25);
      if(hit && hit.height>.25) steerAround(c.root.position,c.target,hit,c.target);
        const consequenceSpeed = stability < .45 ? .82 : pressure > .6 ? 1.12 : 1;
      const trafficSpeed = worldMatch ? 1 + transitBoost : 1;
      if (worldMatch && transitBoost > .12 && c.state === 'REST' && c.energy > .55) c.state = c.species.world === 'WILDS' ? 'MIGRATE' : 'EXPLORE';
      const speedFactor = c.state === 'REST' ? .08 : c.state === 'MIGRATE' ? 1.8 : c.state === 'EXPLORE' ? 1.2 : c.state === 'PLAY' ? 1.35 : .7;
      if (worldMatch) active++;
      const serverOwned = Boolean(c.root.userData.serverOwned);
      if (!serverOwned) {
        const speed = c.species.speed * speedFactor * consequenceSpeed * trafficSpeed * (worldMatch ? 1 : .42);
        const tx = c.target.x - c.root.position.x;
        const tz = c.target.z - c.root.position.z;
        const length = Math.hypot(tx,tz);
        if (length > .05) {
          const step = Math.min(length,speed*delta);
          c.root.position.x += tx/length*step;
          c.root.position.z += tz/length*step;
          c.root.rotation.y = Math.atan2(tx,tz);
        }
      }
      const hopping = c.state==='PLAY' || c.state==='MIGRATE' || c.state==='EXPLORE';
      const hopWave = Math.sin(c.phase*2.7 + performance.now()*.002 + c.species.id.length);
      const baseY = (c.species.center.y ?? 0) + (c.species.habitatHeight ?? (c.species.id.includes('moth') || c.species.id.includes('swallow') || c.species.id.includes('kite') ? 2.2 : 0));
      const hopHeight = hopping && hopWave > .82 ? (hopWave-.82)*3.2 : 0;
      if (!serverOwned) {
        c.root.position.y = baseY + hopHeight + Math.sin(c.phase + performance.now()*.0015) * (c.species.nocturnal ? .06 : .025);
      }
      c.phase += delta * .5;
    }

    const state = (Object.entries(this.activeStates).sort((a,b)=>b[1]-a[1])[0]?.[0] ?? 'EXPLORE') as CreatureLifeState;
    this.snapshot = { population:this.creatures.length, visible, active, state, species:new Set(this.creatures.map(c=>c.species.id)).size, world };
    this.root.userData.ecology = this.snapshot;
  }

  getSnapshot() { return this.snapshot; }
}
