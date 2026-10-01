import { createStableId } from "./GridStableIdentity";
import { loadWorldSnapshot, saveWorldSnapshot, type GridWorldSnapshot } from "./GridWorldRecovery";

export interface GridRuntimeSnapshot {
  player: { x: number; y: number; z: number; yaw: number; regionId: string };
  world: unknown;
  health: { savedAt: string };
}

const SCHEMA = 1;
const INTERVAL_MS = 15000;

export class GridWorldSnapshotManager {
  private elapsed = 0;
  private readonly worldId: string;
  private lastSnapshot: GridWorldSnapshot<GridRuntimeSnapshot> | null = null;

  constructor(worldId: string) {
    this.worldId = worldId;
    this.lastSnapshot = loadWorldSnapshot<GridRuntimeSnapshot>(worldId, SCHEMA);
  }

  tick(deltaMs: number, capture: () => GridRuntimeSnapshot) {
    this.elapsed += deltaMs;
    if (this.elapsed < INTERVAL_MS) return false;
    this.elapsed = 0;
    this.save(capture());
    return true;
  }

  save(data: GridRuntimeSnapshot) {
    const snapshot: GridWorldSnapshot<GridRuntimeSnapshot> = {
      snapshotId: createStableId("snapshot", this.worldId + ":" + Date.now()),
      worldId: this.worldId,
      schema: SCHEMA,
      createdAt: new Date().toISOString(),
      data,
    };
    saveWorldSnapshot(this.worldId, snapshot);
    this.lastSnapshot = snapshot;
  }

  recover() { return this.lastSnapshot; }
  export() { return this.lastSnapshot ? JSON.stringify(this.lastSnapshot, null, 2) : null; }
}
