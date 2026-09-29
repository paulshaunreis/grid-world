import { GridObject, GridObjectSnapshot } from './GridObject';

export const GRID_WORLD_FORMAT = 'grid-world';
export const GRID_WORLD_FORMAT_VERSION = 1;

export interface GridWorldObjectDocument {
  format: typeof GRID_WORLD_FORMAT;
  version: typeof GRID_WORLD_FORMAT_VERSION;
  object: GridObjectSnapshot;
}

export function serializeGridObject(object: GridObject): GridWorldObjectDocument {
  return {
    format: GRID_WORLD_FORMAT,
    version: GRID_WORLD_FORMAT_VERSION,
    object: object.snapshot(),
  };
}

export function validateGridWorldObjectDocument(value: unknown): value is GridWorldObjectDocument {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<GridWorldObjectDocument>;
  return candidate.format === GRID_WORLD_FORMAT
    && candidate.version === GRID_WORLD_FORMAT_VERSION
    && Boolean(candidate.object);
}
