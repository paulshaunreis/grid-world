import type { WorldChunkState } from './WorldChunkState';

export interface WorldChunkStore {
  load(key: string): Promise<WorldChunkState | null>;
  save(state: WorldChunkState): Promise<void>;
}

export class LocalWorldChunkStore implements WorldChunkStore {
  private readonly prefix = 'grid-world:chunk:';

  async load(key: string): Promise<WorldChunkState | null> {
    const raw = localStorage.getItem(this.prefix + key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as WorldChunkState;
    } catch {
      return null;
    }
  }

  async save(state: WorldChunkState): Promise<void> {
    localStorage.setItem(this.prefix + state.key, JSON.stringify(state));
  }
}
