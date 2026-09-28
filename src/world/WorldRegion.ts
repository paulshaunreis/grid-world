export type ClimateType = 'temperate' | 'tropical' | 'arid' | 'alpine' | 'aquatic' | 'void' | 'frontier';

export interface WorldRegionDefinition {
  id: string;
  zoneId: string;
  originX: number;
  originZ: number;
  size: number;
  climate: ClimateType;
}

export interface WorldRegionBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export class WorldRegion {
  constructor(readonly definition: WorldRegionDefinition) {}

  get bounds(): WorldRegionBounds {
    const half = this.definition.size / 2;
    return {
      minX: this.definition.originX - half,
      maxX: this.definition.originX + half,
      minZ: this.definition.originZ - half,
      maxZ: this.definition.originZ + half,
    };
  }

  contains(x: number, z: number): boolean {
    const bounds = this.bounds;
    return x >= bounds.minX && x <= bounds.maxX && z >= bounds.minZ && z <= bounds.maxZ;
  }
}

export class WorldRegionRegistry {
  private readonly regions = new Map<string, WorldRegion>();

  register(definition: WorldRegionDefinition): WorldRegion {
    const region = new WorldRegion(definition);
    this.regions.set(definition.id, region);
    return region;
  }

  get(id: string): WorldRegion | undefined {
    return this.regions.get(id);
  }

  findAt(x: number, z: number): WorldRegion | undefined {
    for (const region of this.regions.values()) {
      if (region.contains(x, z)) return region;
    }
    return undefined;
  }

  all(): WorldRegion[] {
    return [...this.regions.values()];
  }
}

export const FIRST_LIGHT_REGION: WorldRegionDefinition = {
  id: 'first-light',
  zoneId: 'first-light',
  originX: 0,
  originZ: 0,
  size: 220,
  climate: 'temperate',
};
