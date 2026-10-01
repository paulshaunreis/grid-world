import * as THREE from 'three';
import { getWorlds } from './GridWorldRegistry';
import type { EcologyWorld } from './CreatureEcologySystem';
import type { LivingWorldSnapshot } from './GridLivingWorld';
import type { WorldConsequenceSnapshot } from './WorldConsequenceSystem';

export interface WorldEvolutionState {
  world: EcologyWorld;
  fertility: number;
  biodiversity: number;
  water: number;
  resilience: number;
  environmentalStress: number;
  resourceRenewal: number;
  generation: number;
  lastUpdatedAt: number;
  lastChange: string;
}

const STORAGE_KEY = 'grid-world:world-evolution:v1';

function clamp(value:number) { return THREE.MathUtils.clamp(value, 0, 1); }

export class WorldEvolutionSystem {
  readonly root = new THREE.Group();
  private states = new Map<EcologyWorld, WorldEvolutionState>();
  private elapsed = 0;

  constructor() {
    this.root.name = 'grid-world-evolution';
    this.root.userData.system = 'persistent-world-evolution';
    this.load();
    for (const world of getWorlds()) this.ensure(world.id);
  }

  private defaultState(world:EcologyWorld):WorldEvolutionState {
    return {
      world,
      fertility: .64,
      biodiversity: .62,
      water: .6,
      resilience: .7,
      environmentalStress: .08,
      resourceRenewal: .68,
      generation: 1,
      lastUpdatedAt: Date.now(),
      lastChange: 'The world is establishing its first long-term ecological record.',
    };
  }

  private ensure(world:EcologyWorld) {
    if (!this.states.has(world)) this.states.set(world, this.defaultState(world));
    return this.states.get(world)!;
  }

  private load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { states?: WorldEvolutionState[] };
      for (const state of parsed.states ?? []) {
        if (state?.world) this.states.set(state.world, {
          ...this.defaultState(state.world),
          ...state,
        });
      }
    } catch { /* persistence is optional */ }
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        states: [...this.states.values()],
      }));
    } catch { /* storage can be unavailable */ }
  }

  registerWorld(world: EcologyWorld) {
    return this.ensure(world);
  }

  update(
    delta:number,
    living:LivingWorldSnapshot,
    consequences:WorldConsequenceSnapshot,
    now=Date.now(),
  ) {
    this.elapsed += delta;
    const state = this.ensure(living.world);
    const weather = living.weather;
    const season = living.season;
    const event = living.event;

    // Long-horizon changes are intentionally slow: minutes of simulation should not
    // instantly rewrite a world, while repeated play sessions can leave a footprint.
    const weatherFertility =
      weather === 'RAIN' ? .018 :
      weather === 'MIST' ? .009 :
      weather === 'BLOOM' ? .026 :
      weather === 'SNOW' ? -.006 :
      weather === 'STORM' ? -.024 : .001;
    const seasonFertility =
      season === 'SPRING' ? .014 :
      season === 'SUMMER' ? .006 :
      season === 'AUTUMN' ? -.002 : -.009;
    const stress = consequences.pressure * .025 + (1 - consequences.stability) * .035;
    const recovery = state.resilience * .012;

    state.environmentalStress = clamp(
      state.environmentalStress + (stress + (weather === 'STORM' ? .014 : 0) - recovery) * delta / 60,
    );
    state.fertility = clamp(
      state.fertility + (weatherFertility + seasonFertility - state.environmentalStress * .01) * delta / 60,
    );
    state.water = clamp(
      state.water + (
        (weather === 'RAIN' || weather === 'MIST' ? .018 : 0) -
        (weather === 'STORM' ? .006 : 0) -
        (living.temperatureC > 27 ? .009 : 0)
      ) * delta / 60,
    );
    state.biodiversity = clamp(
      state.biodiversity + (
        (state.fertility - .5) * .018 +
        (state.water - .5) * .012 -
        state.environmentalStress * .028 +
        (event === 'MIGRATION' ? .008 : 0) +
        (event === 'BLOOM' ? .012 : 0)
      ) * delta / 60,
    );
    state.resourceRenewal = clamp(
      state.resourceRenewal + (
        (state.fertility - .5) * .014 +
        (state.water - .5) * .009 -
        state.environmentalStress * .018
      ) * delta / 60,
    );
    state.resilience = clamp(
      state.resilience + ((state.biodiversity - .5) * .01 - state.environmentalStress * .008) * delta / 60,
    );

    const health = Math.round((state.fertility + state.biodiversity + state.water + state.resilience + state.resourceRenewal) / 5 * 100);
    const previousGeneration = state.generation;
    state.generation = Math.max(1, Math.floor(1 + health / 12));
    state.lastUpdatedAt = now;

    if (state.generation !== previousGeneration) {
      state.lastChange = 'A new ecological generation has emerged from long-term world conditions.';
    } else if (state.environmentalStress > .7) {
      state.lastChange = 'Persistent environmental stress is reshaping local life.';
    } else if (state.biodiversity > .78) {
      state.lastChange = 'Biodiversity is increasing; new niches are becoming viable.';
    } else if (state.fertility > .8) {
      state.lastChange = 'Soil and growth conditions are supporting stronger regeneration.';
    } else if (state.water < .28) {
      state.lastChange = 'Water reserves are becoming scarce; drought adaptations are emerging.';
    }

    if (this.elapsed >= 15) {
      this.elapsed = 0;
      this.save();
    }

    this.root.userData.activeWorld = living.world;
    this.root.userData.state = state;
    this.root.userData.worldCount = getWorlds().length;
  }

  get(world:EcologyWorld) {
    return this.ensure(world);
  }

  getAll() {
    return [...this.states.values()];
  }

  getWorldHealth(world:EcologyWorld) {
    const state = this.get(world);
    return Math.round((state.fertility + state.biodiversity + state.water + state.resilience + state.resourceRenewal) / 5 * 100);
  }
}
