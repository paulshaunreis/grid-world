import * as THREE from 'three';

export type GridPBRFamily = 'ground' | 'stone' | 'wood' | 'metal' | 'foliage' | 'fabric' | 'glass' | 'technical' | 'skin';

export interface GridPBRSource {
  id: string;
  name: string;
  family: GridPBRFamily;
  source: 'Grid World' | 'Poly Haven' | 'ambientCG' | 'CGBookcase';
  url: string;
  license: 'CC0' | 'Grid World Original';
  maps: readonly string[];
}

export const GRID_PBR_SOURCES: readonly GridPBRSource[] = [
  { id:'grass-ground',name:'Grass Ground',family:'ground',source:'Poly Haven',url:'https://polyhaven.com/hi/a/grass_ground',license:'CC0',maps:['albedo','normal','roughness','displacement','ao'] },
  { id:'forest-ground-06',name:'Forest Ground 06',family:'ground',source:'Poly Haven',url:'https://polyhaven.com/zh/a/forest_ground_06',license:'CC0',maps:['albedo','normal','roughness','displacement','ao'] },
  { id:'farm-soil',name:'Farm Soil',family:'ground',source:'Poly Haven',url:'https://polyhaven.com/textures/ground-terrain?setting=outdoor',license:'CC0',maps:['albedo','normal','roughness','displacement'] },
  { id:'dry-river-pebbles',name:'Dry River Pebbles',family:'stone',source:'Poly Haven',url:'https://polyhaven.com/textures/ground-terrain?setting=outdoor',license:'CC0',maps:['albedo','normal','roughness','displacement'] },
  { id:'rocky-terrain-02',name:'Rocky Terrain 02',family:'stone',source:'Poly Haven',url:'https://polyhaven.com/textures/ground-terrain?setting=outdoor',license:'CC0',maps:['albedo','normal','roughness','displacement'] },
  { id:'gray-rocks',name:'Gray Rocks',family:'stone',source:'Poly Haven',url:'https://polyhaven.com/textures/ground-terrain?setting=outdoor',license:'CC0',maps:['albedo','normal','roughness','displacement'] },
  { id:'dense-sand',name:'Dense Sand',family:'ground',source:'Poly Haven',url:'https://polyhaven.com/textures/ground-terrain?setting=outdoor',license:'CC0',maps:['albedo','normal','roughness','displacement'] },
  { id:'damp-beach-sand',name:'Damp Beach Sand',family:'ground',source:'Poly Haven',url:'https://polyhaven.com/textures/ground-terrain?setting=outdoor',license:'CC0',maps:['albedo','normal','roughness','displacement'] },
  { id:'mossy-bark',name:'Mossy Bark',family:'foliage',source:'CGBookcase',url:'https://www.cgbookcase.com/textures',license:'CC0',maps:['albedo','normal','roughness','height'] },
  { id:'grass-01',name:'Grass 01',family:'foliage',source:'CGBookcase',url:'https://www.cgbookcase.com/textures',license:'CC0',maps:['albedo','normal','roughness','height'] },
  { id:'smooth-concrete-floor',name:'Smooth Concrete Floor',family:'stone',source:'Poly Haven',url:'https://polyhaven.com/textures/concrete',license:'CC0',maps:['albedo','normal','roughness','displacement'] },
  { id:'brushed-concrete-04',name:'Brushed Concrete 04',family:'stone',source:'Poly Haven',url:'https://polyhaven.com/textures/concrete',license:'CC0',maps:['albedo','normal','roughness','displacement'] },
  { id:'concrete-wall-009',name:'Concrete Wall 009',family:'stone',source:'Poly Haven',url:'https://polyhaven.com/textures/concrete',license:'CC0',maps:['albedo','normal','roughness','displacement'] },
  { id:'cracked-concrete-02',name:'Cracked Concrete 02',family:'stone',source:'Poly Haven',url:'https://polyhaven.com/textures/concrete',license:'CC0',maps:['albedo','normal','roughness','displacement'] },
  { id:'red-brick',name:'Red Brick',family:'stone',source:'Poly Haven',url:'https://polyhaven.com/textures',license:'CC0',maps:['albedo','normal','roughness','displacement'] },
  { id:'brick-pavement-04',name:'Brick Pavement 04',family:'stone',source:'Poly Haven',url:'https://polyhaven.com/textures',license:'CC0',maps:['albedo','normal','roughness','displacement'] },
  { id:'clean-asphalt',name:'Clean Asphalt',family:'ground',source:'Poly Haven',url:'https://polyhaven.com/textures',license:'CC0',maps:['albedo','normal','roughness','displacement'] },
  { id:'weathered-peeling-timber',name:'Weathered Peeling Timber',family:'wood',source:'Poly Haven',url:'https://polyhaven.com/textures/wood/boards-planks',license:'CC0',maps:['albedo','normal','roughness','displacement'] },
  { id:'oak-wood-planks',name:'Oak Wood Planks',family:'wood',source:'Poly Haven',url:'https://polyhaven.com/textures/wood',license:'CC0',maps:['albedo','normal','roughness','displacement'] },
  { id:'hinoki-planks',name:'Hinoki Planks',family:'wood',source:'Poly Haven',url:'https://polyhaven.com/textures/wood/boards-planks',license:'CC0',maps:['albedo','normal','roughness','displacement'] },
  { id:'old-wood-floor-03',name:'Old Wooden Floor 03',family:'wood',source:'Poly Haven',url:'https://polyhaven.com/textures/wood',license:'CC0',maps:['albedo','normal','roughness','displacement'] },
  { id:'blue-metal-plate',name:'Blue Metal Plate',family:'metal',source:'Poly Haven',url:'https://polyhaven.com/textures',license:'CC0',maps:['albedo','normal','roughness','metalness'] },
  { id:'rusty-metal-04',name:'Rusty Metal 04',family:'metal',source:'Poly Haven',url:'https://polyhaven.com/textures',license:'CC0',maps:['albedo','normal','roughness','metalness'] },
  { id:'wood-siding-006',name:'Wood Siding 006',family:'wood',source:'ambientCG',url:'https://ambientcg.com/view?id=WoodSiding006',license:'CC0',maps:['albedo','normal','roughness','displacement'] },
  { id:'forest-floor-01',name:'Forest Floor 01',family:'ground',source:'CGBookcase',url:'https://www.cgbookcase.com/textures',license:'CC0',maps:['albedo','normal','roughness','height'] },
  { id:'rock-13',name:'Rock 13',family:'stone',source:'CGBookcase',url:'https://www.cgbookcase.com/textures',license:'CC0',maps:['albedo','normal','roughness','height'] },
  { id:'gray-rock-05',name:'Grey Rock 05',family:'stone',source:'CGBookcase',url:'https://www.cgbookcase.com/textures',license:'CC0',maps:['albedo','normal','roughness','height'] },
  { id:'fabric-01',name:'Fabric 01',family:'fabric',source:'CGBookcase',url:'https://www.cgbookcase.com/textures?category=Fabric',license:'CC0',maps:['albedo','normal','roughness','height'] },
  { id:'black-leather-01',name:'Black Leather 01',family:'fabric',source:'CGBookcase',url:'https://www.cgbookcase.com/textures?category=Fabric',license:'CC0',maps:['albedo','normal','roughness','height'] },
  { id:'scratched-painted-metal-01',name:'Scratched Painted Metal 01',family:'metal',source:'CGBookcase',url:'https://www.cgbookcase.com/textures',license:'CC0',maps:['albedo','normal','roughness','height'] },
  { id:'grid-aurora-veil',name:'Aurora Veil',family:'technical',source:'Grid World',url:'https://grid-world-qghn.onrender.com',license:'Grid World Original',maps:['albedo','normal','roughness','emissive'] },
];

const baseColors: Record<GridPBRFamily, string> = {
  ground:'#4f5649', stone:'#707983', wood:'#765640', metal:'#71818d',
  foliage:'#3e6d4b', fabric:'#725d68', glass:'#a8dce5', technical:'#26394a', skin:'#c58f72',
};

const textureCache = new Map<string, { color: THREE.CanvasTexture; normal: THREE.CanvasTexture }>();

function starterMap(seed: string, base: string, roughness: number) {
  const cached = textureCache.get(seed + base);
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = base; ctx.fillRect(0, 0, 256, 256);
  let hash = 2166136261;
  for (const char of seed) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  for (let i = 0; i < 900; i++) {
    hash ^= hash << 13; hash ^= hash >>> 17; hash ^= hash << 5;
    const x = Math.abs(hash) % 256;
    hash ^= hash << 13; hash ^= hash >>> 17; hash ^= hash << 5;
    const y = Math.abs(hash) % 256;
    const size = 1 + (Math.abs(hash) % 5);
    ctx.globalAlpha = .05 + (Math.abs(hash) % 20) / 100;
    ctx.fillStyle = i % 7 === 0 ? '#ffffff' : '#101820';
    ctx.fillRect(x, y, size, size);
  }
  ctx.globalAlpha = 1;

  const normalCanvas = document.createElement('canvas');
  normalCanvas.width = 256; normalCanvas.height = 256;
  const nctx = normalCanvas.getContext('2d')!;
  nctx.fillStyle = '#8080ff'; nctx.fillRect(0, 0, 256, 256);
  nctx.globalAlpha = .2;
  nctx.fillStyle = '#ffffff';
  for (let i = 0; i < 260; i++) {
    const x = (i * 73 + seed.length * 11) % 256;
    const y = (i * 41 + seed.length * 17) % 256;
    nctx.fillRect(x, y, 1 + (i % 4), 1 + (i % 3));
  }
  nctx.globalAlpha = 1;

  const color = new THREE.CanvasTexture(canvas);
  const normal = new THREE.CanvasTexture(normalCanvas);
  for (const texture of [color, normal]) {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
  }
  color.colorSpace = THREE.SRGBColorSpace;
  const pair = { color, normal };
  textureCache.set(seed + base, pair);
  return pair;
}
