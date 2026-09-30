import * as THREE from 'three';

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

export type WorldDNA = {
  architecture: WorldArchitectureProfile;
  ecology: WorldEcologyProfile;
  transit: WorldTransitProfile;
  ambientLife: number;
  conceptKeywords: string[];
};

const TAG_DEFAULTS: Record<string, Partial<WorldDNA>> = {
  water: {
    architecture: { structuralLanguage:'tidal, flowing structures', materials:['glass','stone','oxidized metal'], buildingFamilies:['harbor','aquatic civic','bridge'], landmarkMotifs:['arches','canals','tide towers'] },
    ecology: { lifeDensity:1.25, floraFamilies:['shore flora','floating vegetation'], faunaTraits:['aquatic','amphibious','surface-skimming'], environmentalForces:['tides','mist','rain'] },
    transit: { gateLanguage:'pressure-lock / tidal arch', materials:['glass','stone','metal'], effects:['water-ring','mist','refraction'] },
  },
  growth: {
    architecture: { structuralLanguage:'biomorphic, grown architecture', materials:['wood','living fiber','glass'], buildingFamilies:['canopy homes','terraces','groves'], landmarkMotifs:['roots','canopies','living arches'] },
    ecology: { lifeDensity:1.5, floraFamilies:['canopy','moss','flowering growth'], faunaTraits:['arboreal','pollinating','camouflaged'], environmentalForces:['growth','pollen','dew'] },
    transit: { gateLanguage:'living root portal', materials:['wood','living fiber','crystal'], effects:['pollen','leaf-light','bioluminescence'] },
  },
  ancient: {
    architecture: { structuralLanguage:'monumental, ancient geometry', materials:['stone','bronze','ceramic'], buildingFamilies:['temple','citadel','archive'], landmarkMotifs:['monoliths','colonnades','rings'] },
    ecology: { lifeDensity:0.95, floraFamilies:['lichen','hardy grasses','sacred groves'], faunaTraits:['stone-adapted','nocturnal','territorial'], environmentalForces:['dust','wind','aurora'] },
    transit: { gateLanguage:'monumental rune aperture', materials:['stone','bronze','crystal'], effects:['runes','dust','aurora'] },
  },
  art: {
    architecture: { structuralLanguage:'kinetic, expressive structures', materials:['glass','fabric','painted metal'], buildingFamilies:['galleries','studios','markets'], landmarkMotifs:['ribbons','frames','suspended stages'] },
    ecology: { lifeDensity:1.1, floraFamilies:['ornamental','floating gardens'], faunaTraits:['social','colorful','curious'], environmentalForces:['light','music','wind'] },
    transit: { gateLanguage:'kinetic gallery portal', materials:['glass','painted metal','light'], effects:['ribbons','particles','color-shift'] },
  },
  wildlife: {
    architecture: { structuralLanguage:'low-impact frontier structures', materials:['timber','stone','earth'], buildingFamilies:['ranger lodges','burrows','watchtowers'], landmarkMotifs:['fallen trunks','stone circles','lookouts'] },
    ecology: { lifeDensity:1.7, floraFamilies:['old growth','grassland','fungi'], faunaTraits:['pack','burrowing','migratory'], environmentalForces:['wind','rain','seasonal change'] },
    transit: { gateLanguage:'stone-circle wilderness gate', materials:['stone','wood','mineral'], effects:['fireflies','leaf swirl','earth pulse'] },
  },
};

export function deriveWorldDNA(tags: readonly string[] = []): WorldDNA {
  const merged: WorldDNA = {
    architecture:{ structuralLanguage:'world-native structures', materials:['local materials'], buildingFamilies:['settlement','civic','landmark'], landmarkMotifs:['world-native motifs'] },
    ecology:{ lifeDensity:1, floraFamilies:['native flora'], faunaTraits:['native adaptation'], environmentalForces:['local weather'] },
    transit:{ gateLanguage:'world-native transit monument', materials:['local materials'], effects:['world-native energy'] },
    ambientLife:1,
    conceptKeywords:[...tags],
  };
  for (const tag of tags) {
    const preset=TAG_DEFAULTS[tag];
    if (!preset) continue;
    if (preset.architecture) merged.architecture={...merged.architecture,...preset.architecture};
    if (preset.ecology) merged.ecology={...merged.ecology,...preset.ecology};
    if (preset.transit) merged.transit={...merged.transit,...preset.transit};
  }
  merged.ambientLife=Math.max(.5, merged.ecology.lifeDensity);
  return merged;
}

export function worldSpawnPosition(center: THREE.Vector3, radius:number, index:number) {
  const angle=index*2.399963;
  return new THREE.Vector3(center.x+Math.cos(angle)*radius, center.y, center.z+Math.sin(angle)*radius);
}
