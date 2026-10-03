import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

/** Shared Draco decoder — singleton so the WASM loads once. */
let draco: DRACOLoader | null = null;
function getDraco(): DRACOLoader {
  if (!draco) {
    draco = new DRACOLoader();
    draco.setDecoderPath('/libs/draco/');
  }
  return draco;
}

/** GLTF loader with Draco support for compressed meshes. */
export function createGLTFLoader(): GLTFLoader {
  const loader = new GLTFLoader();
  loader.setDRACOLoader(getDraco());
  return loader;
}
