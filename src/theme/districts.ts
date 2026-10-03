/* District identities — the single source of truth for region color language.
 *
 * These hexes match the engine's district-asset-director.ts (the procedural
 * in-world look). The website renders its region cards from this table so the
 * site and the world can never drift apart. Add a region here; both sides
 * follow.
 *
 * status 'live' = built in the engine. 'development' = from the nine-region
 * concept series, not yet built — the site renders these as IN DEVELOPMENT
 * cards, never as playable destinations.
 */

export interface DistrictIdentity {
  id: string;          // css + class slug, e.g. 'tideline'
  label: string;       // display name, e.g. 'TIDELINE'
  title: string;       // card headline, e.g. 'OCEAN WORLD'
  color: string;       // identity hex — district glow, card tint, map marker
  secondary: string;   // deep tone — gradients, shadows
  blurb: string;       // one-line card copy
  detail: string;      // card sub-copy
  status: 'live' | 'development';
  art?: string;        // concept-art svg (live regions)
  entryHref?: string;  // where the card CTA goes (live regions)
}

export const DISTRICT_IDENTITIES: DistrictIdentity[] = [
  { id:'tideline', label:'TIDELINE', title:'OCEAN WORLD',
    color:'#3bc7df', secondary:'#174b6b',
    blurb:'Tides · wildlife · exploration',
    detail:'Harbors, moons, sky cities and tidal exploration. Ocean hazards and creature encounters.',
    status:'live', art:'/worlds/tideline.webp', entryHref:'/play.html' },
  { id:'crown', label:'CROWN', title:'CELESTIAL CITADEL',
    color:'#d7b46a', secondary:'#5c4425',
    blurb:'Signals · guardians · mystery',
    detail:'Monuments beneath a ringed world and strange skies. World events can awaken powerful encounters.',
    status:'live', art:'/worlds/crown.webp', entryHref:'#discover' },
  { id:'verdant', label:'VERDANT', title:'FLOATING GARDENS',
    color:'#8fe388', secondary:'#285c3b',
    blurb:'Ecology · bloom · companionship',
    detail:'Alien ecology, multiple moons and living architecture. Living habitats and protective creatures.',
    status:'live', art:'/worlds/verdant.webp', entryHref:'#discover' },
  { id:'muse', label:'MUSE', title:'ART REALM',
    color:'#d28cff', secondary:'#4d285e',
    blurb:'Art · gatherings · arenas',
    detail:'Impossible geometry, color, movement and expression. Social space stays protected while events can become competitive.',
    status:'live', art:'/worlds/muse.webp', entryHref:'#discover' },
  { id:'frontier', label:'FRONTIER', title:'ANCIENT WILDS',
    color:'#c9a36a', secondary:'#3d3021',
    blurb:'Migration · territory · survival',
    detail:'Wild habitats, colossal trees and living discovery. Wild systems create movement and danger.',
    status:'live', art:'/worlds/frontier.webp', entryHref:'#discover' },
  /* From the nine-region concept series — not built yet. */
  { id:'neon-district', label:'NEON DISTRICT', title:'SIGNAL CITY',
    color:'#ff4fd8', secondary:'#4d1a3e',
    blurb:'Night city · signs · static',
    detail:'A city that never powers down. Gates open soon.',
    status:'development' },
  { id:'crystal-caverns', label:'CRYSTAL CAVERNS', title:'GLASS DEEP',
    color:'#6fd8ff', secondary:'#173a55',
    blurb:'Crystal · echo · light',
    detail:'Caverns of living glass. Gates open soon.',
    status:'development' },
  { id:'iron-wastes', label:'IRON WASTES', title:'RUST BELT',
    color:'#ff8a4d', secondary:'#4d2a18',
    blurb:'Rust · salvage · storms',
    detail:'Salvage frontier under iron skies. Gates open soon.',
    status:'development' },
  { id:'skybound-isles', label:'SKYBOUND ISLES', title:'FLOATING ARCHIPELAGO',
    color:'#8fb8ff', secondary:'#1e2f55',
    blurb:'Islands · wind · altitude',
    detail:'Isles adrift above the clouds. Gates open soon.',
    status:'development' },
];

export const LIVE_DISTRICTS = DISTRICT_IDENTITIES.filter(d => d.status === 'live');
export const DEV_DISTRICTS = DISTRICT_IDENTITIES.filter(d => d.status === 'development');

export function districtById(id: string): DistrictIdentity | undefined {
  return DISTRICT_IDENTITIES.find(d => d.id === id);
}
