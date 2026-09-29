import * as THREE from 'three';

export type CyberpackMaterialKey =
  | 'pcb'
  | 'carbon'
  | 'gunmetal'
  | 'hazard'
  | 'technical-leather'
  | 'iridescent-glass';

export interface CyberpackMaterialSpec {
  key: CyberpackMaterialKey;
  label: string;
  baseColor: number;
  roughness: number;
  metalness: number;
  clearcoat: number;
  emissive: number;
  emissiveIntensity: number;
  description: string;
}

export const CYBERPACK_MATERIALS: Record<CyberpackMaterialKey, CyberpackMaterialSpec> = {
  pcb: {
    key: 'pcb',
    label: 'Circuit Board / PCB',
    baseColor: 0x071a29,
    roughness: .48,
    metalness: .58,
    clearcoat: .2,
    emissive: 0x27dfff,
    emissiveIntensity: .55,
    description: 'Dark technical substrate with cyan circuit traces and restrained gold contacts.',
  },
  carbon: {
    key: 'carbon',
    label: 'Carbon Weave / Hex',
    baseColor: 0x11151b,
    roughness: .31,
    metalness: .7,
    clearcoat: .32,
    emissive: 0x07111c,
    emissiveIntensity: .08,
    description: 'Tight woven composite for armor, frames and high-performance structures.',
  },
  gunmetal: {
    key: 'gunmetal',
    label: 'Riveted Gunmetal / Panel',
    baseColor: 0x262b30,
    roughness: .56,
    metalness: .86,
    clearcoat: .16,
    emissive: 0x07121c,
    emissiveIntensity: .05,
    description: 'Heavy modular plate language for industrial architecture and machinery.',
  },
  hazard: {
    key: 'hazard',
    label: 'Hazard Stripe / Blue',
    baseColor: 0x0b1720,
    roughness: .62,
    metalness: .52,
    clearcoat: .18,
    emissive: 0x1a9dff,
    emissiveIntensity: .16,
    description: 'Safety marking language used selectively around infrastructure and service zones.',
  },
  'technical-leather': {
    key: 'technical-leather',
    label: 'Technical Leather / Black',
    baseColor: 0x080a0d,
    roughness: .76,
    metalness: .08,
    clearcoat: .22,
    emissive: 0x060b10,
    emissiveIntensity: .03,
    description: 'Fine-grain flexible surface for avatar clothing, seating and soft architectural details.',
  },
  'iridescent-glass': {
    key: 'iridescent-glass',
    label: 'Fractured Iridescent Glass',
    baseColor: 0x384e87,
    roughness: .08,
    metalness: .22,
    clearcoat: .95,
    emissive: 0x6c55ff,
    emissiveIntensity: .22,
    description: 'Prismatic transparent accent for galleries, signage, interfaces and Muse artifacts.',
  },
};

export function createCyberpackMaterial(key: CyberpackMaterialKey, options: Partial<THREE.MeshPhysicalMaterialParameters> = {}) {
  const spec = CYBERPACK_MATERIALS[key];
  return new THREE.MeshPhysicalMaterial({
    color: spec.baseColor,
    roughness: spec.roughness,
    metalness: spec.metalness,
    clearcoat: spec.clearcoat,
    emissive: spec.emissive,
    emissiveIntensity: spec.emissiveIntensity,
    ...options,
  });
}

export function applyCyberpackMaterial(mesh: THREE.Mesh, key: CyberpackMaterialKey) {
  mesh.material = createCyberpackMaterial(key);
  mesh.userData.materialFamily = key;
  mesh.userData.materialSpec = CYBERPACK_MATERIALS[key];
  return mesh;
}
