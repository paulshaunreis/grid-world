import { readVersioned, writeVersioned } from "./VersionedStorage";

export interface GridWorldSnapshot<T = unknown> {
  snapshotId: string;
  worldId: string;
  regionId: string;
  failureDomain: string;
  schema: number;
  createdAt: string;
  data: T;
}

const prefix = "grid-world:snapshot:";

function storageKey(worldId: string, regionId: string) {
  return prefix + encodeURIComponent(worldId) + ":" + encodeURIComponent(regionId);
}

export function saveWorldSnapshot<T>(worldId: string, snapshot: GridWorldSnapshot<T>) {
  if (snapshot.worldId !== worldId) throw new Error("Grid snapshot world identity mismatch");
  writeVersioned(storageKey(worldId, snapshot.regionId), snapshot.schema, snapshot);
}

export function loadWorldSnapshot<T>(worldId: string, schema: number, regionId = "default"): GridWorldSnapshot<T> | null {
  return readVersioned(storageKey(worldId, regionId), schema, (data, stored) =>
    stored === schema && isSnapshot<T>(data) && data.worldId === worldId && data.regionId === regionId ? data : null
  );
}

function isSnapshot<T>(v: unknown): v is GridWorldSnapshot<T> {
  if (!v || typeof v !== "object") return false;
  const x = v as Record<string, unknown>;
  return (
    typeof x.snapshotId === "string" &&
    typeof x.worldId === "string" &&
    typeof x.regionId === "string" &&
    typeof x.failureDomain === "string" &&
    typeof x.schema === "number" &&
    typeof x.createdAt === "string" &&
    "data" in x
  );
}

export function exportWorldSnapshot<T>(worldId: string, schema: number, regionId = "default"): string | null {
  const snapshot = loadWorldSnapshot<T>(worldId, schema, regionId);
  return snapshot ? JSON.stringify(snapshot, null, 2) : null;
}
