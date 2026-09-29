import { readVersioned, writeVersioned } from './VersionedStorage';

export interface PersistedPlayerState {
  regionId: string;
  x: number;
  y: number;
  z: number;
  yaw: number;
  updatedAt: string;
}

const STORAGE_KEY = 'grid-world:player-state';
const SCHEMA_VERSION = 1;

function isState(value: unknown): value is PersistedPlayerState {
  if (!value || typeof value !== 'object') return false;
  const state = value as Record<string, unknown>;
  return typeof state.regionId === 'string' &&
    [state.x, state.y, state.z, state.yaw].every(value => typeof value === 'number' && Number.isFinite(value)) &&
    typeof state.updatedAt === 'string';
}

export class Persistence {
  loadPlayerState(): PersistedPlayerState | null {
    return readVersioned(STORAGE_KEY, SCHEMA_VERSION, (data, schema) => {
      if (schema === 1 && isState(data)) return data;
      return null;
    });
  }

  savePlayerState(state: PersistedPlayerState) {
    writeVersioned(STORAGE_KEY, SCHEMA_VERSION, state);
  }
}
