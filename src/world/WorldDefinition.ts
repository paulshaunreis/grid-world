export interface WorldDefinition {
  id: string;
  name: string;
  version: number;
  seed: number;
  description?: string;
}

export const GRID_WORLD_DEFINITION: WorldDefinition = {
  id: 'grid-world',
  name: 'Grid World',
  version: 1,
  seed: 0x47524944,
  description: 'A persistent framework for connected, expandable worlds.',
};
