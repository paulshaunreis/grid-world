export interface VersionedEnvelope<T> {
  schema: number;
  data: T;
}

export function readVersioned<T>(
  key: string,
  currentSchema: number,
  migrate: (data: unknown, schema: number) => T | null,
): T | null {
  const raw = localStorage.getItem(key);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as VersionedEnvelope<unknown>;
    if (!Number.isInteger(parsed.schema) || parsed.schema < 1) return null;
    return migrate(parsed.data, parsed.schema);
  } catch {
    return null;
  }
}

export function writeVersioned<T>(key: string, schema: number, data: T) {
  const envelope: VersionedEnvelope<T> = { schema, data };
  localStorage.setItem(key, JSON.stringify(envelope));
}

export function removeVersioned(key: string) {
  localStorage.removeItem(key);
}
