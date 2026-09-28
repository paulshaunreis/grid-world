export type TerrainMaterial = 'surface' | 'soil' | 'rock' | 'resource' | 'cavern' | 'water' | 'lava' | 'energy';

export interface WorldChunkState {
  key: string;
  regionId: string;
  chunkX: number;
  chunkZ: number;
  seed: number;
  terrainVersion: number;
  dominantMaterial: TerrainMaterial;
  vegetationGrowth: number;
  moisture: number;
  temperatureC: number;
  lastSimulatedAt: string;
  revision: number;
}

export function createWorldChunkState(
  regionId: string,
  chunkX: number,
  chunkZ: number,
  now = new Date(),
): WorldChunkState {
  const key = worldChunkStateKey(regionId, chunkX, chunkZ);
  const seed = hashChunkKey(key);
  return {
    key,
    regionId,
    chunkX,
    chunkZ,
    seed,
    terrainVersion: 1,
    dominantMaterial: 'surface',
    vegetationGrowth: 0,
    moisture: 0.55,
    temperatureC: 18,
    lastSimulatedAt: now.toISOString(),
    revision: 1,
  };
}

export function worldChunkStateKey(regionId: string, chunkX: number, chunkZ: number): string {
  return `${regionId}:${chunkX},${chunkZ}`;
}

export function hashChunkKey(key: string): number {
  let hash = 2166136261;
  for (let index = 0; index < key.length; index += 1) {
    hash ^= key.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
