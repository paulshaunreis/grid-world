import * as THREE from 'three';
import type { ClimateType } from './WorldRegion';

export type WorldArchitectureProfile = {
  structuralLanguage: string;
  materials: string[];
  buildingFamilies: string[];
  landmarkMotifs: string[];
};

export type WorldEcologyProfile = {
  lifeDensity: number;
  floraFamilies: string[];
  faunaTraits: string[];
  environmentalForces: string[];
};

export type WorldTransitProfile = {
  gateLanguage: string;
  materials: string[];
  effects: string[];
};

export type WorldPresentationProfile = {
  geometry: 'flow' | 'organic' | 'monumental' | 'kinetic' | 'frontier' | 'volcanic' | 'crystalline' | 'storm' | 'mineral-life' | 'primal';
  weather: 'mist' | 'pollen' | 'dust' | 'leaf' | 'light' | 'ash' | 'crystal' | 'storm' | 'spore' | 'elemental';
  accentMotion: number;
};

export type WorldDNA = {
  climate: ClimateType;
  architecture: WorldArchitectureProfile;
  ecology: WorldEcologyProfile;
  transit: WorldTransitProfile;
  ambientLife: number;
  conceptKeywords: string[];
  creatureMorphology: { locomotion:string[]; bodyPlans:string[]; adaptations:string[] };
  buildingStyle: { massing:string; verticality:number; organicity:number };
  presentation: WorldPresentationProfile;
};

const TAG_DEFAULTS: Record<string, Partial<WorldDNA>> = {
  water: {
    creatureMorphology:{locomotion:['swim','skim'],bodyPlans:['streamlined','finned'],adaptations:['gills','water-shedding']},
    buildingStyle:{massing:'flowing',verticality:1.1,organicity:.45},
    architecture: { structuralLanguage:'tidal, flowing structures', materials:['glass','stone','oxidized metal'], buildingFamilies:['harbor','aquatic civic','bridge'], landmarkMotifs:['arches','canals','tide towers'] },
    ecology: { lifeDensity:1.25, floraFamilies:['shore flora','floating vegetation'], faunaTraits:['aquatic','amphibious','surface-skimming'], environmentalForces:['tides','mist','rain'] },
    transit: { gateLanguage:'pressure-lock / tidal arch', materials:['glass','stone','metal'], effects:['water-ring','mist','refraction'] },
  },
  growth: {
    creatureMorphology:{locomotion:['climb','glide'],bodyPlans:['six-limbed','winged'],adaptations:['camouflage','pollination']},
    buildingStyle:{massing:'grown',verticality:1.5,organicity:1},
    architecture: { structuralLanguage:'biomorphic, grown architecture', materials:['wood','living fiber','glass'], buildingFamilies:['canopy homes','terraces','groves'], landmarkMotifs:['roots','canopies','living arches'] },
    ecology: { lifeDensity:1.5, floraFamilies:['canopy','moss','flowering growth'], faunaTraits:['arboreal','pollinating','camouflaged'], environmentalForces:['growth','pollen','dew'] },
    transit: { gateLanguage:'living root portal', materials:['wood','living fiber','crystal'], effects:['pollen','leaf-light','bioluminescence'] },
  },
  ancient: {
    creatureMorphology:{locomotion:['stalk','burrow'],bodyPlans:['armored','four-legged'],adaptations:['stone-camouflage','low-light']},
    buildingStyle:{massing:'monumental',verticality:1.35,organicity:.15},
    architecture: { structuralLanguage:'monumental, ancient geometry', materials:['stone','bronze','ceramic'], buildingFamilies:['temple','citadel','archive'], landmarkMotifs:['monoliths','colonnades','rings'] },
    ecology: { lifeDensity:0.95, floraFamilies:['lichen','hardy grasses','sacred groves'], faunaTraits:['stone-adapted','nocturnal','territorial'], environmentalForces:['dust','wind','aurora'] },
    transit: { gateLanguage:'monumental rune aperture', materials:['stone','bronze','crystal'], effects:['runes','dust','aurora'] },
  },
  art: {
    creatureMorphology:{locomotion:['dance','glide'],bodyPlans:['feathered','ribboned'],adaptations:['color-shift','social-display']},
    buildingStyle:{massing:'kinetic',verticality:1.7,organicity:.55},
    architecture: { structuralLanguage:'kinetic, expressive structures', materials:['glass','fabric','painted metal'], buildingFamilies:['galleries','studios','markets'], landmarkMotifs:['ribbons','frames','suspended stages'] },
    ecology: { lifeDensity:1.1, floraFamilies:['ornamental','floating gardens'], faunaTraits:['social','colorful','curious'], environmentalForces:['light','music','wind'] },
    transit: { gateLanguage:'kinetic gallery portal', materials:['glass','painted metal','light'], effects:['ribbons','particles','color-shift'] },
  },
  wildlife: {
    creatureMorphology:{locomotion:['run','burrow','climb'],bodyPlans:['four-legged','antlered'],adaptations:['seasonal-coat','pack-sense']},
    buildingStyle:{massing:'low-impact',verticality:.85,organicity:.75},
    architecture: { structuralLanguage:'low-impact frontier structures', materials:['timber','stone','earth'], buildingFamilies:['ranger lodges','burrows','watchtowers'], landmarkMotifs:['fallen trunks','stone circles','lookouts'] },
    ecology: { lifeDensity:1.7, floraFamilies:['old growth','grassland','fungi'], faunaTraits:['pack','burrowing','migratory'], environmentalForces:['wind','rain','seasonal change'] },
    transit: { gateLanguage:'stone-circle wilderness gate', materials:['stone','wood','mineral'], effects:['fireflies','leaf swirl','earth pulse'] },
  },
};

export function deriveWorldDNA(tags: readonly string[] = []): WorldDNA {
  const climate: ClimateType = tags.includes('water') ? 'aquatic' : tags.includes('growth') ? 'tropical' : tags.includes('ancient') ? 'arid' : tags.includes('wildlife') ? 'frontier' : 'temperate';
  const merged: WorldDNA = {
    climate,
    architecture:{ structuralLanguage:'world-native structures', materials:['local materials'], buildingFamilies:['settlement','civic','landmark'], landmarkMotifs:['world-native motifs'] },
    ecology:{ lifeDensity:1, floraFamilies:['native flora'], faunaTraits:['native adaptation'], environmentalForces:['local weather'] },
    transit:{ gateLanguage:'world-native transit monument', materials:['local materials'], effects:['world-native energy'] },
    ambientLife:1,
    conceptKeywords:[...tags],
    creatureMorphology:{locomotion:['walk'],bodyPlans:['native'],adaptations:['environmental adaptation']},
    buildingStyle:{massing:'native',verticality:1,organicity:.5},
    presentation:{geometry:'flow',weather:'light',accentMotion:.5},
  };
  for (const tag of tags) {
    const preset=TAG_DEFAULTS[tag];
    if (!preset) continue;
    if (preset.architecture) merged.architecture={...merged.architecture,...preset.architecture};
    if (preset.creatureMorphology) merged.creatureMorphology={...merged.creatureMorphology,...preset.creatureMorphology};
    if (preset.buildingStyle) merged.buildingStyle={...merged.buildingStyle,...preset.buildingStyle};
    if (preset.ecology) merged.ecology={...merged.ecology,...preset.ecology};
    if (preset.transit) merged.transit={...merged.transit,...preset.transit};
  }
  merged.ambientLife=Math.max(.5, merged.ecology.lifeDensity);
  const tagSet = new Set(tags);
  const geometry = tagSet.has('volcanic') ? 'volcanic'
    : tagSet.has('crystal') ? 'crystalline'
    : tagSet.has('storm') ? 'storm'
    : tagSet.has('living') ? 'mineral-life'
    : tagSet.has('mixed-elements') ? 'primal'
    : tagSet.has('art') ? 'kinetic'
    : tagSet.has('ancient') ? 'monumental'
    : tagSet.has('wildlife') ? 'frontier'
    : tagSet.has('growth') ? 'organic' : 'flow';
  const weather = tagSet.has('volcanic') ? 'ash'
    : tagSet.has('crystal') ? 'crystal'
    : tagSet.has('storm') ? 'storm'
    : tagSet.has('living') ? 'spore'
    : tagSet.has('mixed-elements') ? 'elemental'
    : tagSet.has('water') ? 'mist'
    : tagSet.has('growth') ? 'pollen'
    : tagSet.has('ancient') ? 'dust'
    : tagSet.has('wildlife') ? 'leaf' : 'light';
  merged.presentation = { geometry, weather, accentMotion: .35 + Math.min(1.1, tags.length * .06) };
  return merged;
}

export function worldSpawnPosition(center: THREE.Vector3, radius:number, index:number) {
  const angle=index*2.399963;
  return new THREE.Vector3(center.x+Math.cos(angle)*radius, center.y, center.z+Math.sin(angle)*radius);
}
