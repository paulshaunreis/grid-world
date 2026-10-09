// Team gallery curation — each of the 44 team members gets 8 images curated
// from the shared pool, weighted toward their domain. Curation makes each
// gallery feel custom; the pool keeps it efficient.

export interface TeamGalleryImage {
  src: string;
  title: string;
  caption: string;
}

const POOL = '/gallery/team-pool';

// Domain-weighted curation: each member gets 8 images from the pool.
const CURATION: Record<string, string[]> = {
  aurora: ['neon-city', 'floating-islands', 'night-market', 'portal-gate', 'concert-stage', 'peaceful-garden', 'digital-grid', 'mountain-vista'],
  link: ['digital-grid', 'space-station', 'mech-workshop', 'portal-gate', 'night-market', 'ancient-library', 'storm-front', 'neon-city'],
  rey: ['floating-islands', 'peaceful-garden', 'night-market', 'cozy-tavern', 'mountain-vista', 'jungle-temple', 'desert-ruins', 'ice-palace'],
  elder: ['ancient-library', 'desert-ruins', 'mountain-vista', 'peaceful-garden', 'jungle-temple', 'cozy-tavern', 'star-observatory', 'crystal-cave'],
  veyr: ['digital-grid', 'crystal-cave', 'ancient-library', 'space-station', 'portal-gate', 'storm-front', 'mountain-vista', 'desert-ruins'],
  nyxen: ['space-station', 'digital-grid', 'storm-front', 'night-market', 'portal-gate', 'crystal-cave', 'neon-city', 'ice-palace'],
  orin: ['digital-grid', 'ancient-library', 'space-station', 'portal-gate', 'crystal-cave', 'mountain-vista', 'star-observatory', 'neon-city'],
  seraith: ['crystal-cave', 'digital-grid', 'storm-front', 'portal-gate', 'ancient-library', 'space-station', 'ice-palace', 'desert-ruins'],
  vael: ['peaceful-garden', 'mountain-vista', 'desert-ruins', 'ice-palace', 'jungle-temple', 'crystal-cave', 'star-observatory', 'cozy-tavern'],
  kairox: ['star-observatory', 'digital-grid', 'space-station', 'portal-gate', 'storm-front', 'crystal-cave', 'ancient-library', 'night-market'],
  morrow: ['ancient-library', 'desert-ruins', 'jungle-temple', 'cozy-tavern', 'mountain-vista', 'night-market', 'peaceful-garden', 'crystal-cave'],
  cipher: ['night-market', 'storm-front', 'digital-grid', 'space-station', 'portal-gate', 'crystal-cave', 'neon-city', 'ice-palace'],
  solenne: ['peaceful-garden', 'cozy-tavern', 'night-market', 'concert-stage', 'floating-islands', 'mountain-vista', 'jungle-temple', 'desert-ruins'],
  rook: ['tournament-arena', 'space-station', 'digital-grid', 'night-market', 'portal-gate', 'storm-front', 'neon-city', 'mountain-vista'],
  echo: ['mech-workshop', 'digital-grid', 'storm-front', 'space-station', 'portal-gate', 'neon-city', 'tournament-arena', 'crystal-cave'],
  umbra: ['storm-front', 'night-market', 'portal-gate', 'crystal-cave', 'ice-palace', 'desert-ruins', 'space-station', 'jungle-temple'],
  civitas: ['ancient-library', 'space-station', 'digital-grid', 'night-market', 'portal-gate', 'mountain-vista', 'cozy-tavern', 'crystal-cave'],
  axiom: ['space-station', 'digital-grid', 'crystal-cave', 'ancient-library', 'portal-gate', 'star-observatory', 'neon-city', 'storm-front'],
  mosaic: ['night-market', 'neon-city', 'floating-islands', 'desert-ruins', 'jungle-temple', 'ice-palace', 'ocean-trench', 'mountain-vista'],
  sentinel: ['space-station', 'night-market', 'portal-gate', 'storm-front', 'digital-grid', 'neon-city', 'ice-palace', 'peaceful-garden'],
  praxis: ['digital-grid', 'mech-workshop', 'space-station', 'portal-gate', 'crystal-cave', 'ancient-library', 'storm-front', 'neon-city'],
  atlas: ['creature-nursery', 'digital-grid', 'space-station', 'jungle-temple', 'ocean-trench', 'portal-gate', 'crystal-cave', 'floating-islands'],
  tessera: ['crystal-cave', 'neon-city', 'volcanic-forge', 'ice-palace', 'jungle-temple', 'desert-ruins', 'floating-islands', 'night-market'],
  waypoint: ['jungle-temple', 'floating-islands', 'mountain-vista', 'ocean-trench', 'desert-ruins', 'peaceful-garden', 'creature-nursery', 'ice-palace'],
  forge: ['volcanic-forge', 'mech-workshop', 'desert-ruins', 'storm-front', 'crystal-cave', 'night-market', 'portal-gate', 'tournament-arena'],
  lumen: ['crystal-cave', 'ice-palace', 'floating-islands', 'star-observatory', 'peaceful-garden', 'portal-gate', 'jungle-temple', 'concert-stage'],
  bramble: ['jungle-temple', 'creature-nursery', 'peaceful-garden', 'mountain-vista', 'floating-islands', 'desert-ruins', 'cozy-tavern', 'ocean-trench'],
  zephyr: ['floating-islands', 'sky-race', 'storm-front', 'mountain-vista', 'star-observatory', 'ice-palace', 'peaceful-garden', 'portal-gate'],
  tinker: ['mech-workshop', 'digital-grid', 'night-market', 'tournament-arena', 'space-station', 'portal-gate', 'neon-city', 'crystal-cave'],
  marisol: ['ocean-trench', 'underwater-city', 'floating-islands', 'desert-ruins', 'storm-front', 'peaceful-garden', 'night-market', 'ice-palace'],
  koda: ['cozy-tavern', 'peaceful-garden', 'mountain-vista', 'jungle-temple', 'night-market', 'floating-islands', 'desert-ruins', 'concert-stage'],
  vex: ['creature-nursery', 'jungle-temple', 'storm-front', 'digital-grid', 'ocean-trench', 'desert-ruins', 'space-station', 'crystal-cave'],
  pip: ['night-market', 'neon-city', 'cozy-tavern', 'floating-islands', 'space-station', 'portal-gate', 'mountain-vista', 'tournament-arena'],
  sable: ['star-observatory', 'night-market', 'ice-palace', 'portal-gate', 'crystal-cave', 'storm-front', 'peaceful-garden', 'jungle-temple'],
  talon: ['mountain-vista', 'floating-islands', 'sky-race', 'star-observatory', 'desert-ruins', 'storm-front', 'jungle-temple', 'ice-palace'],
  ember: ['volcanic-forge', 'tournament-arena', 'desert-ruins', 'storm-front', 'night-market', 'concert-stage', 'crystal-cave', 'portal-gate'],
  juno: ['digital-grid', 'space-station', 'portal-gate', 'crystal-cave', 'neon-city', 'night-market', 'storm-front', 'underwater-city'],
  bolt: ['creature-nursery', 'tournament-arena', 'mech-workshop', 'peaceful-garden', 'jungle-temple', 'mountain-vista', 'cozy-tavern', 'floating-islands'],
  thistle: ['jungle-temple', 'night-market', 'portal-gate', 'crystal-cave', 'cozy-tavern', 'desert-ruins', 'floating-islands', 'ice-palace'],
  ondine: ['ocean-trench', 'underwater-city', 'ice-palace', 'crystal-cave', 'floating-islands', 'storm-front', 'peaceful-garden', 'portal-gate'],
  rowan: ['ancient-library', 'cozy-tavern', 'peaceful-garden', 'mountain-vista', 'jungle-temple', 'desert-ruins', 'star-observatory', 'night-market'],
  pixel: ['tournament-arena', 'neon-city', 'night-market', 'digital-grid', 'concert-stage', 'space-station', 'portal-gate', 'mech-workshop'],
  lyra: ['concert-stage', 'floating-islands', 'peaceful-garden', 'jungle-temple', 'star-observatory', 'ice-palace', 'mountain-vista', 'crystal-cave'],
  bastion: ['space-station', 'portal-gate', 'storm-front', 'mountain-vista', 'desert-ruins', 'night-market', 'ice-palace', 'tournament-arena'],
};

const TITLES: Record<string, string> = {
  'neon-city': 'Neon District', 'floating-islands': 'Skyward Isles', 'jungle-temple': 'Verdant Ruins',
  'desert-ruins': 'Sunken Expanse', 'space-station': 'Orbital Ring', 'ice-palace': 'Frostfall Keep',
  'ocean-trench': 'The Deep Trench', 'volcanic-forge': 'Ember Forge', 'crystal-cave': 'Prism Caverns',
  'sky-race': 'Sky Circuit', 'underwater-city': 'Tidehold', 'night-market': 'Lantern Market',
  'ancient-library': 'The Athenaeum', 'mech-workshop': 'Tinker\'s Bench', 'creature-nursery': 'The Nursery',
  'concert-stage': 'Resonance Stage', 'star-observatory': 'Starwatch', 'tournament-arena': 'The Arena',
  'peaceful-garden': 'Still Garden', 'storm-front': 'Stormwall', 'digital-grid': 'The Undergrid',
  'mountain-vista': 'High Vista', 'cozy-tavern': 'The Hearth', 'portal-gate': 'The Threshold',
};

/** Get 8 curated gallery images for a team member. */
export function teamGallery(memberId: string): TeamGalleryImage[] {
  const picks = CURATION[memberId] ?? Object.keys(TITLES).slice(0, 8);
  return picks.map(key => ({
    src: `${POOL}/${key}.webp`,
    title: TITLES[key] ?? key,
    caption: `From the GridWorld visual archive.`,
  }));
}
