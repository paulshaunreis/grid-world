export type AvatarStyle = 'azure' | 'sunset' | 'forest' | 'violet';

export interface PlayerIdentity {
  id: string;
  displayName: string;
  avatarStyle: AvatarStyle;
  createdAt: string;
}

const STORAGE_KEY = 'grid-world:identity';

export function loadOrCreateIdentity(): PlayerIdentity {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const identity = JSON.parse(saved) as PlayerIdentity;
      if (identity.id && identity.displayName) {
        return { ...identity, avatarStyle: identity.avatarStyle ?? 'azure' };
      }
    } catch { /* recreate below */ }
  }

  const identity: PlayerIdentity = {
    id: crypto.randomUUID(),
    displayName: 'Traveler',
    avatarStyle: 'azure',
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
  return identity;
}
