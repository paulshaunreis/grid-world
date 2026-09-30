import * as THREE from 'three';

export type LivingWorldKey = 'HARBOR' | 'GARDENS' | 'CITADEL' | 'ARTS' | 'WILDS';
export type WorldWeather = 'clear' | 'rain' | 'mist' | 'storm' | 'aurora' | 'bloom' | 'wind';

export interface LivingWorldSnapshot {
  world: LivingWorldKey;
  label: string;
  weather: WorldWeather;
  phase: 'DAWN' | 'DAY' | 'DUSK' | 'NIGHT';
  event: string;
  eventKind: 'quiet' | 'migration' | 'market' | 'tide' | 'bloom' | 'aurora' | 'storm';
  population: number;
  ecology: number;
  activity: number;
  seed: number;
  nextChangeIn: number;
}

const WORLDS: Record<LivingWorldKey, { label: string; basePopulation: number; ecology: number; activity: number }> = {
  HARBOR: { label: 'Tideline', basePopulation: 84, ecology: 61, activity: 72 },
  GARDENS: { label: 'Verdant', basePopulation: 67, ecology: 94, activity: 58 },
  CITADEL: { label: 'Crown', basePopulation: 53, ecology: 43, activity: 64 },
  ARTS: { label: 'Muse', basePopulation: 76, ecology: 71, activity: 88 },
  WILDS: { label: 'Frontier', basePopulation: 48, ecology: 98, activity: 51 },
};

const WORLD_ORDER: LivingWorldKey[] = ['HARBOR', 'GARDENS', 'CITADEL', 'ARTS', 'WILDS'];
const CYCLE_SECONDS = 420;
const EVENT_SECONDS = 70;

function hash(value: number) {
  const x = Math.sin(value * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function phaseFor(secondsOfDay: number): LivingWorldSnapshot['phase'] {
  if (secondsOfDay < 5 * 3600 || secondsOfDay >= 20 * 3600) return 'NIGHT';
  if (secondsOfDay < 7 * 3600) return 'DAWN';
  if (secondsOfDay < 18 * 3600) return 'DAY';
  return 'DUSK';
}

function eventFor(world: LivingWorldKey, epochSeconds: number) {
  const slot = Math.floor(epochSeconds / EVENT_SECONDS);
  const index = (slot + WORLD_ORDER.indexOf(world)) % 6;
  const events = [
    ['quiet', 'quiet', 'The world is breathing'],
    ['migration', 'migration', 'Wildlife migration crossing the region'],
    ['market', 'market', 'Open market activity rising'],
    ['bloom', 'bloom', 'Ecology bloom cycle underway'],
    ['aurora', 'aurora', 'Aurora signal crossing the sky'],
    ['storm', 'storm', 'Weather front moving through'],
  ] as const;
  return events[index];
}

export function createLivingWorldSimulation() {
  const root = new THREE.Group();
  root.name = 'living-world-simulation';
  root.userData.system = 'persistent deterministic world clock';

  let activeWorld: LivingWorldKey = 'HARBOR';
  let snapshot: LivingWorldSnapshot = {
    world: activeWorld,
    label: WORLDS[activeWorld].label,
    weather: 'clear',
    phase: 'DAY',
    event: 'The world is breathing',
    eventKind: 'quiet',
    population: WORLDS[activeWorld].basePopulation,
    ecology: WORLDS[activeWorld].ecology,
    activity: WORLDS[activeWorld].activity,
    seed: 0,
    nextChangeIn: EVENT_SECONDS,
  };

  function update(dt: number, playerX: number, playerZ: number, elapsed: number) {
    void dt;
    const epochSeconds = Date.now() / 1000;
    const slot = Math.floor(epochSeconds / CYCLE_SECONDS);
    const localPhase = ((epochSeconds % 86400) + 86400) % 86400;
    const worldIndex = Math.floor((epochSeconds % CYCLE_SECONDS) / (CYCLE_SECONDS / WORLD_ORDER.length));
    const candidate = WORLD_ORDER[worldIndex % WORLD_ORDER.length];

    // The player remains the strongest signal for nearby world identity.
    // This fallback keeps the simulation alive even when a player is between regions.
    if (Number.isFinite(playerX) && Number.isFinite(playerZ)) {
      const radial = Math.hypot(playerX, playerZ);
      if (radial > 34) activeWorld = candidate;
      else if (playerX < -16 && playerZ > 8) activeWorld = 'WILDS';
      else if (playerX > 12 && playerZ > 8) activeWorld = 'GARDENS';
      else if (playerX < -10 && playerZ < -8) activeWorld = 'CITADEL';
      else if (playerX > 10 && playerZ < -8) activeWorld = 'ARTS';
      else activeWorld = 'HARBOR';
    }

    const base = WORLDS[activeWorld];
    const [eventKind, weather, event] = eventFor(activeWorld, epochSeconds);
    const wave = hash(slot + WORLD_ORDER.indexOf(activeWorld));
    const activityWave = Math.sin(epochSeconds / 17 + WORLD_ORDER.indexOf(activeWorld)) * 8;
    const ecologyWave = Math.sin(epochSeconds / 31 + 1.4) * 5;

    snapshot = {
      world: activeWorld,
      label: base.label,
      weather: weather as WorldWeather,
      phase: phaseFor(localPhase),
      event,
      eventKind,
      population: Math.max(0, Math.round(base.basePopulation + (wave - .5) * 12 + activityWave * .45)),
      ecology: Math.max(0, Math.min(100, Math.round(base.ecology + ecologyWave))),
      activity: Math.max(0, Math.min(100, Math.round(base.activity + activityWave))),
      seed: slot,
      nextChangeIn: EVENT_SECONDS - (epochSeconds % EVENT_SECONDS),
    };

    root.userData.snapshot = snapshot;
    root.userData.elapsed = elapsed;
  }

  return {
    root,
    update,
    getSnapshot: () => snapshot,
  };
}
