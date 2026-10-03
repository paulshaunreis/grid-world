export type GridWorldCreatorPermission = 'NONE' | 'BUILD' | 'FULL';

export interface GridWorldCapabilities {
  /** Whether this world exposes player/NPC transit destinations. */
  transit: boolean;
  /** Whether PvE encounters may be authored/activated in this world. */
  pve: boolean;
  /** Whether opt-in PvP rules may be active in this world. */
  pvp: boolean;
  /** Whether world objects may be created/edited through Build Mode. */
  building: boolean;
  /** Whether terrain/matter sculpting is available. */
  terrainSculpting: boolean;
  /** Whether marketplace/merchant activity is part of the world experience. */
  marketplace: boolean;
  /** Whether social/event spaces are supported as world content. */
  socialEventSpaces: boolean;
  /** Relative ecological simulation intensity, not a permission boundary. */
  ecologyIntensity: 'LOW' | 'MEDIUM' | 'HIGH';
  /** Creator-facing world capability; does not grant user authorization. */
  creatorPermissions: GridWorldCreatorPermission;
}

export const DEFAULT_GRID_WORLD_CAPABILITIES: GridWorldCapabilities = {
  transit: true,
  pve: true,
  pvp: false,
  building: true,
  terrainSculpting: true,
  marketplace: false,
  socialEventSpaces: true,
  ecologyIntensity: 'MEDIUM',
  creatorPermissions: 'BUILD',
};

export function normalizeWorldCapabilities(
  capabilities?: Partial<GridWorldCapabilities>,
): GridWorldCapabilities {
  return { ...DEFAULT_GRID_WORLD_CAPABILITIES, ...(capabilities ?? {}) };
}
