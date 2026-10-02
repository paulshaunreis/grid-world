/* Canonical district subdivisions for the five built regions.
 *
 * District names are the canonical labels for UI, minimap, and signage
 * (see concept-art/maps/districts/DISTRICT-NOTES.md for the full planning
 * notes, zone purposes, and gameplay hooks).
 *
 * Each district carries an anchor offset (dx, dz) from its region origin so
 * the minimap and signage can resolve "where am I" to a district name.
 * Anchors are planning-level approximations, not surveyed geometry.
 *
 * The four in-development regions (neon-district, crystal-caverns,
 * iron-wastes, skybound-isles) are concept-only: no districts are defined
 * here and no gameplay systems should reference them yet.
 */

export interface DistrictZone {
  /** Canonical district name — use verbatim in UI/minimap/signage. */
  name: string;
  /** Zone types present (residential, market, park, transit, civic, maker, entertainment, special). */
  zones: string[];
  /** One-line purpose for tooltips/signage. */
  purpose: string;
  /** Anchor offset from region origin (planning approximation). */
  dx: number;
  dz: number;
}

export interface RegionDistricts {
  regionId: string; // matches DistrictIdentity id
  districts: DistrictZone[];
}

export const REGION_DISTRICTS: RegionDistricts[] = [
  {
    regionId: 'tideline',
    districts: [
      { name: 'Harborlight Docks', zones: ['market', 'transit'], purpose: 'Trade piers + ferry terminal — arrival/departure plaza', dx: 0, dz: 60 },
      { name: 'Tidemark Rise', zones: ['residential'], purpose: 'Stilt houses over the shallows — ocean home base', dx: -55, dz: 20 },
      { name: 'Moonglade Tidelands', zones: ['park'], purpose: 'Tidal pools + wildlife reserve — exploration', dx: 55, dz: 25 },
      { name: 'Skyport Tether', zones: ['transit', 'civic'], purpose: 'Sky-city elevator + Harbormaster Tower', dx: 0, dz: -55 },
      { name: 'Moonwell Moorage', zones: ['special'], purpose: 'Sky-ship mooring in deep water', dx: 60, dz: -40 },
    ],
  },
  {
    regionId: 'crown',
    districts: [
      { name: 'Signal Plaza', zones: ['civic', 'transit'], purpose: 'Citadel administration + Signal spire — ceremonial heart', dx: 0, dz: 0 },
      { name: "Guardian's March", zones: ['residential'], purpose: 'Guardian housing + barracks', dx: -50, dz: 30 },
      { name: 'Reliquary Market', zones: ['market'], purpose: 'Artifact traders — commerce with lore', dx: 50, dz: 30 },
      { name: 'Starfall Gardens', zones: ['park'], purpose: 'Observatory gardens — stargazing hangout', dx: -40, dz: -45 },
      { name: 'Awakening Arena', zones: ['special', 'entertainment'], purpose: 'Event arena — scheduled world-event spectacle', dx: 40, dz: -45 },
    ],
  },
  {
    regionId: 'verdant',
    districts: [
      { name: 'Canopy Homes', zones: ['residential'], purpose: 'Homes grown from living flora', dx: -45, dz: -30 },
      { name: 'Bloom Market', zones: ['market'], purpose: 'Flora/fauna trade — social crossroads', dx: 0, dz: 10 },
      { name: 'Sporewild Reserve', zones: ['park'], purpose: 'Protected ecology + creature habitats', dx: 55, dz: -20 },
      { name: 'Rootgate', zones: ['transit'], purpose: 'Spore-port terminal — inter-region travel', dx: 0, dz: 60 },
      { name: 'Companion Nursery', zones: ['special', 'maker'], purpose: 'Creature companionship + bio-crafting ateliers', dx: -50, dz: 45 },
    ],
  },
  {
    regionId: 'muse',
    districts: [
      { name: 'Gallery Row', zones: ['market'], purpose: 'Art sales + studio galleries — creator trade spine', dx: 0, dz: -50 },
      { name: 'The Amphitheater', zones: ['entertainment', 'special'], purpose: 'Showcase stage that flips to competitive arena', dx: 0, dz: 0 },
      { name: 'Atelier Lofts', zones: ['residential', 'maker'], purpose: 'Artist live/work studios', dx: -55, dz: 20 },
      { name: 'Chroma Park', zones: ['park'], purpose: 'Impossible-geometry gardens — hangout', dx: 55, dz: 20 },
      { name: 'Portal Concourse', zones: ['transit', 'civic'], purpose: 'Gate terminal + curators office', dx: 0, dz: 60 },
    ],
  },
  {
    regionId: 'frontier',
    districts: [
      { name: 'Treethold Village', zones: ['residential'], purpose: 'Tree-borne homes — social hearth', dx: 0, dz: 0 },
      { name: "Outfitter's Row", zones: ['market'], purpose: 'Survival gear + guide hire — prep gate', dx: -50, dz: -35 },
      { name: 'Migration Grounds', zones: ['park'], purpose: 'Herd migration paths — living spectacle', dx: 55, dz: -30 },
      { name: 'Ranger Station', zones: ['civic', 'transit'], purpose: 'Territory office + gate terminal + quest board', dx: 0, dz: 55 },
      { name: 'The Gauntlet', zones: ['special', 'entertainment'], purpose: 'PvE survival grounds + wilderness trials', dx: 50, dz: 45 },
    ],
  },
];

export function districtsForRegion(regionId: string): DistrictZone[] {
  return REGION_DISTRICTS.find(r => r.regionId === regionId)?.districts ?? [];
}

/** Map GridLivingWorld world IDs to district region ids. */
export const WORLD_TO_REGION: Record<string, string> = {
  HARBOR: 'tideline',
  GARDENS: 'verdant',
  CITADEL: 'crown',
  ARTS: 'muse',
  WILDS: 'frontier',
};

/**
 * Resolve the nearest district for a world-space position.
 * @param regionId district region id (e.g. 'tideline')
 * @param x world x
 * @param z world z
 * @param originX region origin x (default 0)
 * @param originZ region origin z (default 0)
 */
export function districtAt(
  regionId: string,
  x: number,
  z: number,
  originX = 0,
  originZ = 0,
): DistrictZone | undefined {
  const districts = districtsForRegion(regionId);
  if (!districts.length) return undefined;
  let best: DistrictZone | undefined;
  let bestDist = Infinity;
  for (const d of districts) {
    const dx = x - (originX + d.dx);
    const dz = z - (originZ + d.dz);
    const dist = dx * dx + dz * dz;
    if (dist < bestDist) {
      bestDist = dist;
      best = d;
    }
  }
  return best;
}
