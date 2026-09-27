export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type Weather = 'clear' | 'cloudy' | 'rain' | 'storm' | 'snow' | 'fog';

export interface AtmosphericConditions {
  season: Season;
  weather: Weather;
  temperatureC: number;
  humidity: number;
  windX: number;
  windZ: number;
  visibility: number;
  daylight: number;
}

export class WorldAtmosphere {
  private readonly conditionsByRegion = new Map<string, AtmosphericConditions>();

  constructor() {
    this.conditionsByRegion.set('first-light', {
      season: 'spring',
      weather: 'clear',
      temperatureC: 18,
      humidity: 0.55,
      windX: 0.15,
      windZ: -0.05,
      visibility: 1,
      daylight: 0.8,
    });
  }

  get(regionId: string): AtmosphericConditions | undefined {
    return this.conditionsByRegion.get(regionId);
  }

  set(regionId: string, conditions: AtmosphericConditions) {
    this.conditionsByRegion.set(regionId, conditions);
  }

  all(): ReadonlyMap<string, AtmosphericConditions> {
    return this.conditionsByRegion;
  }
}
