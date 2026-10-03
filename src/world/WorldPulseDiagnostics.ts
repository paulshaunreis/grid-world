export type WorldPulseHealth = 'ONLINE' | 'DEGRADED' | 'OFFLINE';

export interface WorldPulseSnapshot {
  world: string;
  event: string;
  phase: string;
  season: string;
  weather: string;
  temperatureC: number;
  humidity: number;
  activity: number;
  ecology: number;
  npcPopulation: number;
  npcActive: number;
  npcWorking: number;
  npcTalking: number;
  activeMissions: number;
  transitNodes: number;
  transitTraffic: number;
  consequenceStability: number;
  consequencePressure: number;
  persistence: WorldPulseHealth;
  transit: WorldPulseHealth;
  cloud: WorldPulseHealth;
  lastUpdatedAt: number;
}

export function worldPulseOverallHealth(snapshot: WorldPulseSnapshot): WorldPulseHealth {
  if ([snapshot.persistence, snapshot.transit, snapshot.cloud].includes('OFFLINE')) return 'OFFLINE';
  if ([snapshot.persistence, snapshot.transit, snapshot.cloud].includes('DEGRADED')) return 'DEGRADED';
  return 'ONLINE';
}

export function formatWorldPulseValue(value: number, digits = 0): string {
  return Number.isFinite(value) ? value.toFixed(digits) : '—';
}
