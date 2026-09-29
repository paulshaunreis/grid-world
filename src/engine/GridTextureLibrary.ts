export type GridTextureCategory =
  | 'stone' | 'wood' | 'metal' | 'glass' | 'fabric' | 'ground'
  | 'foliage' | 'organic' | 'abstract' | 'technical' | 'special';

export type GridTextureRights =
  | 'unknown' | 'original' | 'licensed' | 'public_domain' | 'blocked';

export interface GridTextureMaterial {
  baseColor: string;
  roughness: number;
  metalness: number;
  normalScale?: number;
  emissive?: string;
  emissiveIntensity?: number;
  tiling?: { x: number; y: number };
}

export interface GridTextureDefinition {
  id: string;
  name: string;
  category: GridTextureCategory;
  description: string;
  tags: readonly string[];
  rights: GridTextureRights;
  version: string;
  material: GridTextureMaterial;
}

export const GRID_TEXTURE_LIBRARY: readonly GridTextureDefinition[] = [
  { id: 'grid.stone.moon-slate', name: 'Moon Slate', category: 'stone', description: 'Cool layered architectural stone for paths and foundations.', tags: ['slate','architecture','foundation'], rights: 'original', version: '1.0.0', material: { baseColor: '#59616b', roughness: .82, metalness: .02, tiling: {x:2,y:2} } },
  { id: 'grid.stone.obsidian', name: 'Obsidian Glassstone', category: 'stone', description: 'Dark volcanic stone with a subtle polished response.', tags: ['volcanic','dark','polished'], rights: 'original', version: '1.0.0', material: { baseColor: '#171a20', roughness: .38, metalness: .08, tiling: {x:2,y:2} } },
  { id: 'grid.wood.wayfinder', name: 'Wayfinder Timber', category: 'wood', description: 'Warm structural timber for creator-built interiors and docks.', tags: ['timber','warm','structure'], rights: 'original', version: '1.0.0', material: { baseColor: '#765a42', roughness: .74, metalness: 0, tiling: {x:1,y:3} } },
  { id: 'grid.metal.aether', name: 'Aether Alloy', category: 'metal', description: 'Neutral engineered alloy for Grid infrastructure.', tags: ['alloy','infrastructure','engineering'], rights: 'original', version: '1.0.0', material: { baseColor: '#9aa5ad', roughness: .28, metalness: .86, tiling: {x:2,y:2} } },
  { id: 'grid.metal.sentinel', name: 'Sentinel Plate', category: 'metal', description: 'Durable armored surface used by Grid security architecture.', tags: ['security','armor','sentinel'], rights: 'original', version: '1.0.0', material: { baseColor: '#303943', roughness: .34, metalness: .78, tiling: {x:2,y:2} } },
  { id: 'grid.glass.prism', name: 'Prism Glass', category: 'glass', description: 'Architectural glass intended for luminous interfaces and galleries.', tags: ['glass','gallery','interface'], rights: 'original', version: '1.0.0', material: { baseColor: '#b8e6ed', roughness: .12, metalness: .08, tiling: {x:1,y:1} } },
  { id: 'grid.ground.first-light', name: 'First Light Soil', category: 'ground', description: 'Neutral living ground for the First Light region.', tags: ['soil','first-light','terrain'], rights: 'original', version: '1.0.0', material: { baseColor: '#655d50', roughness: .94, metalness: 0, tiling: {x:4,y:4} } },
  { id: 'grid.foliage.living-moss', name: 'Living Moss', category: 'foliage', description: 'Soft organic ground cover for living-world environments.', tags: ['moss','organic','living-world'], rights: 'original', version: '1.0.0', material: { baseColor: '#526052', roughness: .98, metalness: 0, tiling: {x:4,y:4} } },
  { id: 'grid.technical.signal', name: 'Signal Mesh', category: 'technical', description: 'Dark technical surface with restrained emissive accents.', tags: ['signal','tech','grid'], rights: 'original', version: '1.0.0', material: { baseColor: '#242b31', roughness: .48, metalness: .55, emissive: '#65d9e8', emissiveIntensity: .35, tiling: {x:4,y:4} } },
  { id: 'grid.special.aurora', name: 'Aurora Veil', category: 'special', description: 'Luminous surface language for navigation artifacts and Muse spaces.', tags: ['aurora','navigation','muse','luminous'], rights: 'original', version: '1.0.0', material: { baseColor: '#4b5b75', roughness: .24, metalness: .28, emissive: '#7ce7ef', emissiveIntensity: .7, tiling: {x:2,y:2} } },
];

export class GridTextureLibrary {
  private readonly textures = new Map(GRID_TEXTURE_LIBRARY.map(texture => [texture.id, texture]));

  get(id: string) {
    return this.textures.get(id);
  }

  list(category?: GridTextureCategory) {
    return [...this.textures.values()].filter(texture => !category || texture.category === category);
  }

  search(query: string) {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return this.list();
    return this.list().filter(texture =>
      [texture.id, texture.name, texture.description, ...texture.tags]
        .join(' ').toLowerCase().includes(normalized),
    );
  }

  register(texture: GridTextureDefinition) {
    if (this.textures.has(texture.id)) throw new Error('Texture already registered: ' + texture.id);
    this.textures.set(texture.id, texture);
  }
}
