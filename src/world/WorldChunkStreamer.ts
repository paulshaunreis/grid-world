import * as THREE from 'three';
import { WorldChunk } from './WorldChunk';

export interface WorldChunkStreamerOptions {
  chunkSize?: number;
  loadRadius?: number;
}

export class WorldChunkStreamer {
  readonly chunkSize: number;
  readonly loadRadius: number;
  private readonly loaded = new Map<string, WorldChunk>();

  constructor(private readonly scene: THREE.Scene, options: WorldChunkStreamerOptions = {}) {
    this.chunkSize = options.chunkSize ?? 32;
    this.loadRadius = options.loadRadius ?? 2;
  }

  update(worldX: number, worldZ: number) {
    const center = WorldChunk.fromWorld(worldX, worldZ, this.chunkSize);
    const needed = new Set<string>();

    for (let dz = -this.loadRadius; dz <= this.loadRadius; dz += 1) {
      for (let dx = -this.loadRadius; dx <= this.loadRadius; dx += 1) {
        const x = center.x + dx;
        const z = center.z + dz;
        const key = WorldChunk.keyOf(x, z);
        needed.add(key);

        if (!this.loaded.has(key)) {
          const chunk = new WorldChunk({ x, z }, this.chunkSize);
          this.loaded.set(key, chunk);
          this.scene.add(chunk.group);
        }
      }
    }

    for (const [key, chunk] of this.loaded) {
      if (needed.has(key)) continue;
      this.scene.remove(chunk.group);
      chunk.dispose();
      this.loaded.delete(key);
    }
  }

  getLoaded(): WorldChunk[] {
    return [...this.loaded.values()];
  }

  getLoadedCount(): number {
    return this.loaded.size;
  }
}
