import { readVersioned, writeVersioned } from './VersionedStorage';
import type { AvatarCustomization } from '../ui/GridAvatarCreator';

export type AvatarStyle = 'navigator' | 'muse' | 'explorer' | 'builder' | 'scholar' | 'sentinel' | 'wanderer' | 'artist' | 'ranger' | 'architect' | 'guardian' | 'signal';

export interface PlayerIdentity {
  id: string;
  displayName: string;
  avatarStyle: AvatarStyle;
  avatarCustomization: AvatarCustomization;
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
    && !!identity.avatarCustomization && typeof identity.avatarCustomization === 'object'
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
    avatarStyle: 'navigator',
    avatarCustomization: { skin: 0, hair: 0, eyes: 0, build: 0, accent: 0, age: 3, species: 0, lineage: -1, hairStyle: 0, hairLength: 2, face: 0, shoulders: 0, torso: 0, arms: 0, legs: 0, hands: 0 },
    createdAt: new Date().toISOString(),
  };
  writeVersioned(STORAGE_KEY, SCHEMA_VERSION, created);
  return created;
}
