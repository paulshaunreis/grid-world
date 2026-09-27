export interface PlayerIdentity {
  id: string;
  displayName: string;
  createdAt: string;
}

const STORAGE_KEY = 'grid-world:identity';

export function loadOrCreateIdentity(): PlayerIdentity {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try { return JSON.parse(saved) as PlayerIdentity; } catch { /* recreate below */ }
  }

  const identity: PlayerIdentity = {
    id: crypto.randomUUID(),
    displayName: 'Traveler',
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
  return identity;
}
