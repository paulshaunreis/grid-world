export interface PersistedPlayerState {
  regionId: string;
  x: number;
  y: number;
  z: number;
  yaw: number;
  updatedAt: string;
}

const STORAGE_KEY = 'grid-world:player-state';

export class Persistence {
  loadPlayerState(): PersistedPlayerState | null {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    try { return JSON.parse(saved) as PersistedPlayerState; } catch { return null; }
  }

  savePlayerState(state: PersistedPlayerState) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}
