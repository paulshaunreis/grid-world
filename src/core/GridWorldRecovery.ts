import { readVersioned, writeVersioned } from "./VersionedStorage";

export interface GridWorldSnapshot<T = unknown> {
  snapshotId: string;
  worldId: string;
  schema: number;
  createdAt: string;
  data: T;
}

const prefix = "grid-world:snapshot:";

export function saveWorldSnapshot<T>(worldId: string, snapshot: GridWorldSnapshot<T>) {
  writeVersioned(prefix + worldId, snapshot.schema, snapshot);
}

export function loadWorldSnapshot<T>(worldId: string, schema: number): GridWorldSnapshot<T> | null {
  return readVersioned(prefix + worldId, schema, (data, stored) =>
    stored === schema && isSnapshot<T>(data) ? data : null
  );
}

function isSnapshot<T>(v: unknown): v is GridWorldSnapshot<T> {
  if (!v || typeof v !== "object") return false;
  const x = v as Record<string, unknown>;
  return (
    typeof x.snapshotId === "string" &&
    typeof x.worldId === "string" &&
    typeof x.schema === "number" &&
    typeof x.createdAt === "string" &&
    "data" in x
  );
}

export function exportWorldSnapshot<T>(worldId: string, schema: number): string | null {
  const snapshot = loadWorldSnapshot<T>(worldId, schema);
  return snapshot ? JSON.stringify(snapshot, null, 2) : null;
}
