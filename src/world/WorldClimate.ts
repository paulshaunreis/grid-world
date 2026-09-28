import type { ClimateType } from './WorldRegion';

export interface ClimateProfile {
  type: ClimateType;
  baseTemperatureC: number;
  seasonalAmplitudeC: number;
  baseHumidity: number;
  rainfallBias: number;
  vegetationBias: number;
}

const CLIMATE_PROFILES: Record<ClimateType, ClimateProfile> = {
  temperate: { type: 'temperate', baseTemperatureC: 15, seasonalAmplitudeC: 12, baseHumidity: 0.58, rainfallBias: 0.62, vegetationBias: 0.72 },
  tropical: { type: 'tropical', baseTemperatureC: 26, seasonalAmplitudeC: 4, baseHumidity: 0.78, rainfallBias: 0.78, vegetationBias: 0.95 },
  arid: { type: 'arid', baseTemperatureC: 28, seasonalAmplitudeC: 14, baseHumidity: 0.24, rainfallBias: 0.18, vegetationBias: 0.2 },
  alpine: { type: 'alpine', baseTemperatureC: 4, seasonalAmplitudeC: 16, baseHumidity: 0.5, rainfallBias: 0.5, vegetationBias: 0.42 },
  aquatic: { type: 'aquatic', baseTemperatureC: 17, seasonalAmplitudeC: 5, baseHumidity: 0.92, rainfallBias: 0.85, vegetationBias: 0.78 },
  void: { type: 'void', baseTemperatureC: 0, seasonalAmplitudeC: 0, baseHumidity: 0, rainfallBias: 0, vegetationBias: 0 },
  frontier: { type: 'frontier', baseTemperatureC: 16, seasonalAmplitudeC: 18, baseHumidity: 0.48, rainfallBias: 0.45, vegetationBias: 0.5 },
};

export function getClimateProfile(type: ClimateType): ClimateProfile {
  return CLIMATE_PROFILES[type];
}
