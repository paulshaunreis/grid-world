import * as THREE from 'three';
import { WorldChunk } from './WorldChunk';
import { createWorldChunkState, worldChunkStateKey, type WorldChunkState } from './WorldChunkState';
import { LocalWorldChunkStore, type WorldChunkStore } from './WorldChunkStore';

export interface WorldChunkStreamerOptions {
  chunkSize?: number;
  loadRadius?: number;
  resolveRegionId?: (worldX: number, worldZ: number) => string;
  hydrateState?: (state: WorldChunkState) => Promise<WorldChunkState> | WorldChunkState;
}

export class WorldChunkStreamer {
  readonly chunkSize: number;
  readonly loadRadius: number;
  private readonly loaded = new Map<string, WorldChunk>();
  private readonly states = new Map<string, WorldChunkState>();
  private readonly store: WorldChunkStore;
  private readonly resolveRegionId: (worldX: number, worldZ: number) => string;
  private readonly hydrateState: (state: WorldChunkState) => Promise<WorldChunkState> | WorldChunkState;

  constructor(
    private readonly scene: THREE.Scene,
    options: WorldChunkStreamerOptions = {},
    store: WorldChunkStore = new LocalWorldChunkStore(),
  ) {
    this.chunkSize = options.chunkSize ?? 32;
    this.loadRadius = options.loadRadius ?? 2;
    this.store = store;
    this.resolveRegionId = options.resolveRegionId ?? (() => 'unclaimed');
    this.hydrateState = options.hydrateState ?? (state => state);
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
      const state = this.states.get(key);
      if (state) void this.store.save(state);
      chunk.dispose();
      this.loaded.delete(key);
      this.states.delete(key);
    }
  }

  private async loadState(key: string, regionId: string, x: number, z: number) {
    const existing = await this.store.load(key);
    const state = existing ?? createWorldChunkState(regionId, x, z);
    const hydrated = await this.hydrateState(state);
    this.states.set(key, hydrated);
    if (!existing) await this.store.save(hydrated);
  }

  getState(key: string): WorldChunkState | undefined {
    return this.states.get(key);
  }

  setState(state: WorldChunkState) {
    this.states.set(state.key, state);
  }

  getLoaded(): WorldChunk[] {
    return [...this.loaded.values()];
  }

  getLoadedStates(): WorldChunkState[] {
    return [...this.states.values()];
  }

  getLoadedCount(): number {
    return this.loaded.size;
  }
}
