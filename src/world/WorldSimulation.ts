import type { WorldChunkState } from './WorldChunkState';
import type { WorldRegion } from './WorldRegion';
import type { AtmosphericConditions, Season, Weather } from './WorldAtmosphere';
import { getClimateProfile } from './WorldClimate';

const SEASONS: Season[] = ['spring', 'summer', 'autumn', 'winter'];
const SEASON_NAMES = new Set<Season>(SEASONS);

export class WorldSimulation {
  constructor(private readonly secondsPerSeason = 1800) {}

  conditionsFor(region: WorldRegion, worldSeconds: number): AtmosphericConditions {
    const profile = getClimateProfile(region.definition.climate);
    const phase = this.phaseFor(region, worldSeconds);
    const seasonIndex = Math.floor(phase * SEASONS.length) % SEASONS.length;
    const season = SEASONS[seasonIndex];
    const seasonalPhase = (phase * SEASONS.length) % 1;
    const temperatureOffset = Math.sin((seasonIndex + seasonalPhase) * Math.PI / 2) * profile.seasonalAmplitudeC * 0.5;
    const daylight = Math.max(0, Math.sin(((worldSeconds % 1200) / 1200) * Math.PI * 2 - Math.PI / 2) * 0.5 + 0.5);
    const humidity = clamp(profile.baseHumidity + (season === 'winter' ? 0.06 : season === 'summer' ? -0.04 : 0), 0, 1);
    const weather = this.weatherFor(region, worldSeconds, humidity);

    return {
      season,
      weather,
      temperatureC: profile.baseTemperatureC + temperatureOffset,
      humidity,
      windX: Math.sin(worldSeconds / 97 + region.definition.originX) * 0.25,
      windZ: Math.cos(worldSeconds / 113 + region.definition.originZ) * 0.25,
      visibility: weather === 'fog' ? 0.45 : weather === 'storm' ? 0.7 : 1,
      daylight,
    };
  }

  simulateChunk(state: WorldChunkState, region: WorldRegion, elapsedSeconds: number, worldSeconds: number): WorldChunkState {
    const totalSeconds = clamp(elapsedSeconds, 0, 30 * 86400);
    if (totalSeconds <= 0) return state;

    const stepSeconds = Math.min(6 * 3600, totalSeconds);
    let remaining = totalSeconds;
    let currentState = state;
    let currentWorldSeconds = worldSeconds - totalSeconds;

    while (remaining > 0) {
      const step = Math.min(stepSeconds, remaining);
      currentState = this.simulateStep(currentState, region, step, currentWorldSeconds + step);
      currentWorldSeconds += step;
      remaining -= step;
    }

    return currentState;
  }

  private simulateStep(state: WorldChunkState, region: WorldRegion, boundedSeconds: number, worldSeconds: number): WorldChunkState {
    const conditions = this.conditionsFor(region, worldSeconds);
    const profile = getClimateProfile(region.definition.climate);
    const rainFactor = conditions.weather === 'rain' ? 1 : conditions.weather === 'storm' ? 1.5 : conditions.weather === 'snow' ? 0.7 : 0;
    const evaporation = Math.max(0, conditions.temperatureC - 10) * 0.000004 * boundedSeconds;
    const moisture = clamp(state.moisture + rainFactor * 0.00008 * boundedSeconds - evaporation, 0, 1);
    const growthRate = Math.max(0, profile.vegetationBias * moisture * (conditions.daylight * 0.7 + 0.3)) * 0.000006;
    const decayRate = Math.max(0, 0.0000015 * (1 - moisture) + (conditions.temperatureC < -2 ? 0.000001 : 0));
    const vegetationGrowth = clamp(state.vegetationGrowth + (growthRate - decayRate) * boundedSeconds, 0, 1);

    return {
      ...state,
      moisture,
      temperatureC: conditions.temperatureC,
      vegetationGrowth,
      lastSimulatedAt: new Date().toISOString(),
      revision: state.revision + 1,
    };
  }

  private phaseFor(region: WorldRegion, worldSeconds: number): number {
    const offset = ((region.definition.originX + region.definition.originZ) % this.secondsPerSeason + this.secondsPerSeason) % this.secondsPerSeason;
    return ((worldSeconds + offset) % (this.secondsPerSeason * SEASONS.length)) / (this.secondsPerSeason * SEASONS.length);
  }

  private weatherFor(region: WorldRegion, worldSeconds: number, humidity: number): Weather {
    const profile = getClimateProfile(region.definition.climate);
    const sample = deterministicNoise(region.definition.id + ':' + Math.floor(worldSeconds / 300));
    if (profile.type === 'void') return 'fog';
    if (profile.type === 'arid' && sample < 0.05) return 'storm';
    if (profile.type === 'alpine' && sample < 0.22) return 'snow';
    if (sample < profile.rainfallBias * humidity * 0.35) return 'rain';
    if (sample < 0.58) return 'cloudy';
    if (sample < 0.62) return 'fog';
    return 'clear';
  }
}

function deterministicNoise(input: string): number {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function isSeason(value: string): value is Season {
  return SEASON_NAMES.has(value as Season);
}
