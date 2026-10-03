import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils.js';

export type GridRuntimeModelId =
  | 'building-a'
  | 'building-b'
  | 'building-c'
  | 'building-d'
  | 'building-e'
  | 'tree-oak'
  | 'tree-pine'
  | 'tree-palm'
  | 'animal-deer'
  | 'animal-fox'
  | 'animal-cat'
  | 'character-a';

const ASSET_ROOT = 'https://hidencod.github.io/tge-assets/packs';

export const GRID_RUNTIME_MODEL_URLS: Record<GridRuntimeModelId, string> = {
  'building-a': `${ASSET_ROOT}/city-kit-suburban/building-type-a.glb`,
  'building-b': `${ASSET_ROOT}/city-kit-suburban/building-type-b.glb`,
  'building-c': `${ASSET_ROOT}/city-kit-suburban/building-type-c.glb`,
  'building-d': `${ASSET_ROOT}/city-kit-suburban/building-type-d.glb`,
  'building-e': `${ASSET_ROOT}/city-kit-suburban/building-type-e.glb`,
  'tree-oak': `${ASSET_ROOT}/nature-kit/tree-oak.glb`,
  'tree-pine': `${ASSET_ROOT}/nature-kit/tree-pinedefaulta.glb`,
  'tree-palm': `${ASSET_ROOT}/nature-kit/tree-palm.glb`,
  'animal-deer': `${ASSET_ROOT}/cube-pets/animal-deer.glb`,
  'animal-fox': `${ASSET_ROOT}/cube-pets/animal-fox.glb`,
  'animal-cat': `${ASSET_ROOT}/cube-pets/animal-cat.glb`,
  'character-a': `${ASSET_ROOT}/blocky-characters/character-a.glb`,
};

const loader = new GLTFLoader();
const cache = new Map<string, Promise<THREE.Group>>();

function prepareModel(root: THREE.Object3D) {
  root.traverse(object => {
    object.userData.gridRuntimeAsset = true;
    if (object instanceof THREE.Mesh) {
      object.castShadow = true;
      object.receiveShadow = true;
      if (object.material instanceof THREE.MeshStandardMaterial) {
        object.material.roughness = Math.min(object.material.roughness, .82);
      }
    }
  });
}

export function loadGridRuntimeModel(id: GridRuntimeModelId): Promise<THREE.Group> {
  const cached = cache.get(id);
  if (cached) return cached;

  const promise = new Promise<THREE.Group>((resolve, reject) => {
    loader.load(
      GRID_RUNTIME_MODEL_URLS[id],
      gltf => {
        const source = gltf.scene;
        prepareModel(source);
        resolve(source as THREE.Group);
      },
      undefined,
      error => reject(error),
    );
  });

  cache.set(id, promise);
  return promise;
}

export async function cloneGridRuntimeModel(id: GridRuntimeModelId): Promise<THREE.Group> {
  const source = await loadGridRuntimeModel(id);
  const clone = SkeletonUtils.clone(source) as THREE.Group;
  prepareModel(clone);
  clone.userData.gridRuntimeAssetId = id;
  return clone;
}
