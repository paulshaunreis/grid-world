import * as THREE from 'three';
import { createStarterPBRMaterial } from './GridPBRLibrary';

export type GridFreeObjectId =
  | 'grid-wayfinder-lamp'
  | 'grid-profile-prism'
  | 'grid-creator-bench'
  | 'grid-gallery-plinth'
  | 'grid-signal-beacon'
  | 'grid-portal-arch'
  | 'grid-aurora-crystal'
  | 'grid-eco-planter'
  | 'grid-hover-drone'
  | 'grid-waypoint-sign';

export interface GridFreeObjectDefinition {
  id: GridFreeObjectId;
  title: string;
  description: string;
  category: 'decor' | 'creator' | 'social' | 'world' | 'utility' | 'nature';
  priceGRD: number;
  rights: 'Grid World Original';
  version: string;
}

export const GRID_FREE_OBJECTS: readonly GridFreeObjectDefinition[] = [
  { id: 'grid-wayfinder-lamp', title: 'Wayfinder Lamp', description: 'A luminous navigation lamp for paths, plazas, and portals.', category: 'decor', priceGRD: 0, rights: 'Grid World Original', version: '1.0.0' },
  { id: 'grid-profile-prism', title: 'Profile Prism', description: 'A floating inspection prism that can host identity and object profiles.', category: 'social', priceGRD: 0, rights: 'Grid World Original', version: '1.0.0' },
  { id: 'grid-creator-bench', title: 'Creator Bench', description: 'A modular workbench for the Grid World Studio creator workflow.', category: 'creator', priceGRD: 25, rights: 'Grid World Original', version: '1.0.0' },
  { id: 'grid-gallery-plinth', title: 'Gallery Plinth', description: 'A clean display pedestal for creator art and collectible objects.', category: 'social', priceGRD: 10, rights: 'Grid World Original', version: '1.0.0' },
  { id: 'grid-signal-beacon', title: 'Signal Beacon', description: 'A programmable world signal with safe Grid Code hooks.', category: 'utility', priceGRD: 60, rights: 'Grid World Original', version: '1.0.0' },
  { id: 'grid-portal-arch', title: 'Portal Arch', description: 'A region gateway primitive for future streaming and teleport links.', category: 'world', priceGRD: 120, rights: 'Grid World Original', version: '1.0.0' },
  { id: 'grid-aurora-crystal', title: 'Aurora Crystal', description: 'A luminous environmental accent for caves, gardens, and galleries.', category: 'nature', priceGRD: 15, rights: 'Grid World Original', version: '1.0.0' },
  { id: 'grid-eco-planter', title: 'Eco Planter', description: 'A living planter that can host vegetation and ecology components.', category: 'nature', priceGRD: 8, rights: 'Grid World Original', version: '1.0.0' },
  { id: 'grid-hover-drone', title: 'Survey Drone', description: 'A small hovering utility drone for world diagnostics and discovery.', category: 'utility', priceGRD: 90, rights: 'Grid World Original', version: '1.0.0' },
  { id: 'grid-waypoint-sign', title: 'Waypoint Sign', description: 'A readable world marker for navigation, quests, and accessibility.', category: 'world', priceGRD: 5, rights: 'Grid World Original', version: '1.0.0' },
];

export function getGridFreeObjectDefinition(id: GridFreeObjectId) {
  return GRID_FREE_OBJECTS.find(object => object.id === id);
}

export function createGridFreeObject(id: GridFreeObjectId): THREE.Group {
  const group = new THREE.Group();
  const definition = getGridFreeObjectDefinition(id);
  group.userData.gridObjectId = id;
  group.userData.interactable = true;
  group.userData.interactionName = definition?.title ?? id;
  group.userData.gridFreeObject = true;

  const metal = createStarterPBRMaterial('metal', { color: '#17324a', metalness: .78, roughness: .28 });
  const glass = createStarterPBRMaterial('glass', { color: '#6cecff', emissive: '#2ab9ff', emissiveIntensity: 1.1, roughness: .12 });
  const fabric = createStarterPBRMaterial('fabric', { color: '#203b52', roughness: .72, metalness: .1 });
  const foliage = createStarterPBRMaterial('foliage', { color: '#3f8060', roughness: .86 });
  const gold = createStarterPBRMaterial('metal', { color: '#c79b4a', metalness: .86, roughness: .22 });

  switch (id) {
    case 'grid-wayfinder-lamp': {
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(.08, .12, 1.5, 12), metal);
      const orb = new THREE.Mesh(new THREE.SphereGeometry(.25, 16, 12), glass);
      orb.position.y = .82;
      group.add(stem, orb);
      break;
    }
    case 'grid-profile-prism': {
      const prism = new THREE.Mesh(new THREE.OctahedronGeometry(.65, 1), glass);
      prism.rotation.y = Math.PI / 4;
      group.add(prism);
      break;
    }
    case 'grid-creator-bench': {
      const top = new THREE.Mesh(new THREE.BoxGeometry(1.7, .18, .75), fabric);
      top.position.y = .9;
      const legs = [-.65, .65].flatMap(x => [-.25, .25].map(z => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(.12, .9, .12), metal);
        leg.position.set(x, .45, z);
        return leg;
      }));
      group.add(top, ...legs);
      break;
    }
    case 'grid-gallery-plinth': {
      const base = new THREE.Mesh(new THREE.CylinderGeometry(.55, .65, .35, 16), metal);
      const top = new THREE.Mesh(new THREE.CylinderGeometry(.42, .42, .08, 16), glass);
      top.position.y = .22;
      group.add(base, top);
      break;
    }
    case 'grid-signal-beacon': {
      const base = new THREE.Mesh(new THREE.CylinderGeometry(.38, .5, .45, 16), metal);
      const core = new THREE.Mesh(new THREE.CylinderGeometry(.18, .18, 1.4, 12), glass);
      core.position.y = .82;
      const ring = new THREE.Mesh(new THREE.TorusGeometry(.52, .035, 8, 32), gold);
      ring.position.y = .75;
      group.add(base, core, ring);
      break;
    }
    case 'grid-portal-arch': {
      const left = new THREE.Mesh(new THREE.BoxGeometry(.24, 2.4, .32), metal);
      const right = left.clone();
      left.position.x = -.9;
      right.position.x = .9;
      const top = new THREE.Mesh(new THREE.BoxGeometry(2.0, .24, .32), gold);
      top.position.y = 1.2;
      const field = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 2.1), glass);
      field.position.z = -.02;
      group.add(left, right, top, field);
      break;
    }
    case 'grid-aurora-crystal': {
      const crystal = new THREE.Mesh(new THREE.ConeGeometry(.34, 1.4, 6), glass);
      crystal.position.y = .7;
      crystal.rotation.z = -.16;
      group.add(crystal);
      break;
    }
    case 'grid-eco-planter': {
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(.45, .36, .42, 16), metal);
      const leaves = new THREE.Mesh(new THREE.IcosahedronGeometry(.6, 1), foliage);
      leaves.position.y = .72;
      group.add(pot, leaves);
      break;
    }
    case 'grid-hover-drone': {
      const core = new THREE.Mesh(new THREE.SphereGeometry(.28, 14, 10), metal);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(.48, .045, 8, 24), glass);
      group.add(core, ring);
      break;
    }
    case 'grid-waypoint-sign': {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(.06, .08, 1.3, 8), metal);
      const sign = new THREE.Mesh(new THREE.BoxGeometry(1.2, .45, .08), gold);
      sign.position.y = .95;
      group.add(post, sign);
      break;
    }
  }

  group.traverse(child => {
    if (child instanceof THREE.Mesh) child.castShadow = true;
  });
  return group;
}
