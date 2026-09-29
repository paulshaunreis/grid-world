import * as THREE from 'three';
import type { GridEngineFrame, GridEngineRenderer } from './GridEngine';

export class ThreeGridRenderer implements GridEngineRenderer {
  readonly id = 'grid-renderer.three-webgl';
  private readonly renderer: THREE.WebGLRenderer;

  constructor(renderer: THREE.WebGLRenderer) {
    this.renderer = renderer;
  }

  render(scene: THREE.Scene, camera: THREE.Camera, _frame: GridEngineFrame) {
    this.renderer.render(scene, camera);
  }

  resize(width: number, height: number, pixelRatio = 1) {
    this.renderer.setPixelRatio(Math.min(pixelRatio, 2));
    this.renderer.setSize(width, height);
  }

  dispose() {
    this.renderer.dispose();
  }
}
