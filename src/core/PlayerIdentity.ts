import { readVersioned, writeVersioned } from './VersionedStorage';

export type AvatarStyle = 'navigator' | 'muse' | 'explorer' | 'builder' | 'scholar' | 'sentinel' | 'wanderer' | 'artist' | 'ranger' | 'architect' | 'guardian' | 'signal';

export interface PlayerIdentity {
  id: string;
  displayName: string;
  avatarStyle: AvatarStyle;
  createdAt: string;
}

const STORAGE_KEY = 'grid-world:identity';
const SCHEMA_VERSION = 1;

function isAvatarStyle(value: unknown): value is AvatarStyle {
  return ['navigator','muse','explorer','builder','scholar','sentinel','wanderer','artist','ranger','architect','guardian','signal'].includes(value as string);
}

function isIdentity(value: unknown): value is PlayerIdentity {
  if (!value || typeof value !== 'object') return false;
  const identity = value as Record<string, unknown>;
  return typeof identity.id === 'string'
    && /^[0-9a-f-]{20,}$/i.test(identity.id)
    && typeof identity.displayName === 'string'
    && /^[A-Za-z0-9 _-]{2,20}$/.test(identity.displayName)
    && isAvatarStyle(identity.avatarStyle)
    && typeof identity.createdAt === 'string';
}

export function loadOrCreateIdentity(): PlayerIdentity {
  const identity = readVersioned(STORAGE_KEY, SCHEMA_VERSION, (data, schema) => {
    if (schema === 1 && isIdentity(data)) return data;
    return null;
  });

  if (identity) return identity;

  const created: PlayerIdentity = {
    id: crypto.randomUUID(),
    displayName: 'Traveler',
    avatarStyle: 'azure',
    createdAt: new Date().toISOString(),
  };
  writeVersioned(STORAGE_KEY, SCHEMA_VERSION, created);
  return created;
}
