import * as THREE from 'three';
import { WorldChunk } from './WorldChunk';
import { createWorldChunkState, worldChunkStateKey, type WorldChunkState } from './WorldChunkState';
import { LocalWorldChunkStore, type WorldChunkStore } from './WorldChunkStore';

export interface WorldChunkStreamerOptions {
  chunkSize?: number;
  loadRadius?: number;
  resolveRegionId?: (worldX: number, worldZ: number) => string;
}

export class WorldChunkStreamer {
  readonly chunkSize: number;
  readonly loadRadius: number;
  private readonly loaded = new Map<string, WorldChunk>();
  private readonly states = new Map<string, WorldChunkState>();
  private readonly store: WorldChunkStore;
  private readonly resolveRegionId: (worldX: number, worldZ: number) => string;

  constructor(
    private readonly scene: THREE.Scene,
    options: WorldChunkStreamerOptions = {},
    store: WorldChunkStore = new LocalWorldChunkStore(),
  ) {
    this.chunkSize = options.chunkSize ?? 32;
    this.loadRadius = options.loadRadius ?? 2;
    this.store = store;
    this.resolveRegionId = options.resolveRegionId ?? (() => 'unclaimed');
  }

  update(worldX: number, worldZ: number) {
    const center = WorldChunk.fromWorld(worldX, worldZ, this.chunkSize);
    const needed = new Set<string>();

    for (let dz = -this.loadRadius; dz <= this.loadRadius; dz += 1) {
      for (let dx = -this.loadRadius; dx <= this.loadRadius; dx += 1) {
        const x = center.x + dx;
        const z = center.z + dz;
        const chunkWorldX = x * this.chunkSize;
        const chunkWorldZ = z * this.chunkSize;
        const regionId = this.resolveRegionId(chunkWorldX, chunkWorldZ);
        const stateKey = worldChunkStateKey(regionId, x, z);
        needed.add(stateKey);

        if (!this.loaded.has(stateKey)) {
          const chunk = new WorldChunk({ x, z }, this.chunkSize);
          this.loaded.set(stateKey, chunk);
          void this.loadState(stateKey, regionId, x, z);
          this.scene.add(chunk.group);
        }
      }
    }

    for (const [key, chunk] of this.loaded) {
      if (needed.has(key)) continue;
      this.scene.remove(chunk.group);
      chunk.dispose();
      this.loaded.delete(key);
      this.states.delete(key);
    }
  }

  private async loadState(key: string, regionId: string, x: number, z: number) {
    const existing = await this.store.load(key);
    const state = existing ?? createWorldChunkState(regionId, x, z);
    this.states.set(key, state);
    if (!existing) await this.store.save(state);
  }

  getState(key: string): WorldChunkState | undefined {
    return this.states.get(key);
  }

  getLoaded(): WorldChunk[] {
    return [...this.loaded.values()];
  }

  getLoadedCount(): number {
    return this.loaded.size;
  }
}
