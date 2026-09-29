export type GridModelFamily = 'building' | 'avatar' | 'animal' | 'plant' | 'tree';

export interface GridModelSource {
  id: string;
  family: GridModelFamily;
  name: string;
  source: 'Kenney' | 'Poly Haven' | 'Grid World Original';
  url: string;
  license: 'CC0' | 'Grid World Original';
  animated: boolean;
  role: string;
  runtimeMode: 'selected' | 'procedural-fallback';
}

export const GRID_MODEL_SOURCES: readonly GridModelSource[] = [
  { id:'kenney.modular-buildings', family:'building', name:'Modular Buildings', source:'Kenney', url:'https://kenney.nl/assets/modular-buildings', license:'CC0', animated:false, role:'District architecture and modular shells', runtimeMode:'selected' },
  { id:'kenney.building-kit', family:'building', name:'Building Kit', source:'Kenney', url:'https://kenney.nl/assets/building-kit', license:'CC0', animated:true, role:'Secondary structures and animated architectural details', runtimeMode:'selected' },
  { id:'kenney.blocky-characters', family:'avatar', name:'Blocky Characters', source:'Kenney', url:'https://kenney.nl/assets/blocky-characters', license:'CC0', animated:true, role:'Low-cost NPC/avatar animation reference set', runtimeMode:'selected' },
  { id:'kenney.mini-characters', family:'avatar', name:'Mini Characters', source:'Kenney', url:'https://kenney.nl/assets/mini-characters', license:'CC0', animated:true, role:'Small-scale inhabitants and accessibility variants', runtimeMode:'selected' },
  { id:'kenney.cube-pets', family:'animal', name:'Cube Pets', source:'Kenney', url:'https://kenney.nl/assets/cube-pets', license:'CC0', animated:true, role:'Companion animals and starter wildlife', runtimeMode:'selected' },
  { id:'kenney.prototype-kit', family:'animal', name:'Prototype Kit', source:'Kenney', url:'https://kenney.nl/assets/prototype-kit', license:'CC0', animated:true, role:'Rapid animal/vehicle/world prototyping', runtimeMode:'selected' },
  { id:'polyhaven.tree-small-02', family:'tree', name:'Tree Small 02', source:'Poly Haven', url:'https://polyhaven.com/a/tree_small_02', license:'CC0', animated:false, role:'Broadleaf hero tree', runtimeMode:'selected' },
  { id:'polyhaven.fir-tree-01', family:'tree', name:'Fir Tree 01', source:'Poly Haven', url:'https://polyhaven.com/a/fir_tree_01', license:'CC0', animated:false, role:'Conifer forest layer', runtimeMode:'selected' },
  { id:'polyhaven.island-tree-03', family:'tree', name:'Island Tree 03', source:'Poly Haven', url:'https://polyhaven.com/a/island_tree_03', license:'CC0', animated:false, role:'Hero/coastal tree', runtimeMode:'selected' },
  { id:'polyhaven.shrub-01', family:'plant', name:'Shrub 01', source:'Poly Haven', url:'https://polyhaven.com/models/nature/plants', license:'CC0', animated:false, role:'Shrub massing and habitat cover', runtimeMode:'selected' },
  { id:'polyhaven.fern-02', family:'plant', name:'Fern 02', source:'Poly Haven', url:'https://polyhaven.com/models/nature/plants', license:'CC0', animated:false, role:'Understory and wetland vegetation', runtimeMode:'selected' },
  { id:'polyhaven.wildflowers', family:'plant', name:'Wildflowers', source:'Poly Haven', url:'https://polyhaven.com/models/nature/plants', license:'CC0', animated:false, role:'Color variation and pollinator habitat', runtimeMode:'selected' },
  { id:'grid.original.navigator', family:'avatar', name:'Grid Navigator', source:'Grid World Original', url:'/avatars.html', license:'Grid World Original', animated:true, role:'Canonical Grid avatar family', runtimeMode:'selected' },
];

export const AURORA_ART_DIRECTION = {
  identity: 'Aurora / Muse',
  palette: { skin: 0x4f79b7, hair: 0x9b67d8, eyes: 0xffe84a, neonCyan: 0x37e8ff, neonMagenta: 0xff4fd8, armor: 0x101521, galaxy: 0x735cff, accentGold: 0xffd36a },
  silhouette: 'athletic utility silhouette with layered luminous technical outerwear',
  materials: 'wet reflective surfaces, translucent iridescent panels, starfield/nebula accents, restrained emissive circuitry',
  animation: 'calm grounded idle, subtle weight shift, responsive head/eye motion, purposeful traversal',
  environment: 'rain-slick neon city, cosmic interfaces, gallery and market districts',
  symbol: 'luminous feather / Muse signal',
} as const;

export const GRID_MODEL_FAMILIES = ['building','avatar','animal','plant','tree'] as const;
