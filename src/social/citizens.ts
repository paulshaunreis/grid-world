// GridWorld Citizen Directory ("Yellow Pages") — searchable registry of all citizens.
// Discord-style discriminators: display names need not be unique; identity is
// Name#1234. Unique constraint on (username, discriminator).

export type CitizenType = 'citizen' | 'staff' | 'system';

export interface CitizenRecord {
  username: string;           // URL-safe, lowercase (e.g., "johndoe")
  discriminator: string;      // 4-digit (e.g., "1748")
  displayName: string;        // Display name (e.g., "JohnDoe")
  firstName?: string;         // Staff: required
  lastName?: string;          // Staff: required
  title?: string;             // Staff: e.g., "Systems Architect", "Moderator"
  type: CitizenType;
  userType?: string;          // Citizen type: explorer, navigator, etc.
  userTypeLabel?: string;
  bio?: string;
  avatarUrl?: string | null;
  onlineStatus?: 'online' | 'away' | 'offline';
  createdAt: string;
}

const citizensKey = 'grid-world:citizens';

/** Full tagged name: Name#1234 */
export function taggedName(c: Pick<CitizenRecord,'displayName'|'discriminator'>): string {
  return `${c.displayName}#${c.discriminator}`;
}

/** URL-safe profile path: /user/johndoe-1748 */
export function citizenUrl(c: Pick<CitizenRecord,'username'|'discriminator'>): string {
  return `/user/${c.username}-${c.discriminator}`;
}

/** Staff display: "First Last" (never just a handle). */
export function staffDisplayName(c: CitizenRecord): string {
  if (c.firstName && c.lastName) return `${c.firstName} ${c.lastName}`;
  return c.displayName;
}

export function loadCitizens(): CitizenRecord[] {
  try { return JSON.parse(localStorage.getItem(citizensKey) ?? '[]'); }
  catch { return []; }
}

function saveCitizens(c: CitizenRecord[]) {
  localStorage.setItem(citizensKey, JSON.stringify(c));
}

/** Check if a (username, discriminator) pair is taken. */
export function isTaken(username: string, discriminator: string): boolean {
  const u = username.toLowerCase();
  return loadCitizens().some(c => c.username === u && c.discriminator === discriminator);
}

/** Generate a random 4-digit discriminator not taken for this username. */
export function generateDiscriminator(username: string): string {
  const u = username.toLowerCase();
  for (let i = 0; i < 50; i++) {
    const d = String(Math.floor(1000 + Math.random() * 9000));
    if (!loadCitizens().some(c => c.username === u && c.discriminator === d)) return d;
  }
  return String(Math.floor(1000 + Math.random() * 9000));
}

/** Validate username: URL-safe, 3-24 chars, alphanumeric + underscore/hyphen/dot. */
export function validateUsername(username: string): string | null {
  const u = username.trim();
  if (u.length < 3) return 'Username must be at least 3 characters.';
  if (u.length > 24) return 'Username must be 24 characters or less.';
  if (!/^[A-Za-z0-9_.-]+$/.test(u)) return 'Username may only contain letters, numbers, underscore, hyphen, dot.';
  return null;
}

/**
 * Register a citizen. If displayName taken (case-insensitive username match),
 * auto-assigns a discriminator. Staff MUST provide firstName + lastName.
 */
export function registerCitizen(input: {
  displayName: string;
  type?: CitizenType;
  firstName?: string; lastName?: string; title?: string;
  userType?: string; userTypeLabel?: string;
  bio?: string; avatarUrl?: string | null;
}): { ok: true; citizen: CitizenRecord } | { ok: false; error: string } {
  const displayName = input.displayName.trim();
  if (!displayName) return { ok: false, error: 'Display name required.' };
  const username = displayName.toLowerCase().replace(/[^a-z0-9_.-]/g, '');
  const uErr = validateUsername(username);
  if (uErr) return { ok: false, error: uErr };

  const type = input.type ?? 'citizen';
  if (type === 'staff') {
    if (!input.firstName?.trim() || !input.lastName?.trim()) {
      return { ok: false, error: 'Staff accounts require first AND last name.' };
    }
  }

  const discriminator = generateDiscriminator(username);
  const citizen: CitizenRecord = {
    username, discriminator, displayName,
    firstName: input.firstName?.trim(), lastName: input.lastName?.trim(),
    title: input.title?.trim(),
    type, userType: input.userType, userTypeLabel: input.userTypeLabel,
    bio: input.bio, avatarUrl: input.avatarUrl ?? null,
    onlineStatus: 'online', createdAt: new Date().toISOString(),
  };
  const all = loadCitizens(); all.push(citizen); saveCitizens(all);
  // Phase 2: mirror to Supabase citizens table (unique on username+discriminator, indexed).
  return { ok: true, citizen };
}

/** Find citizen by username + optional discriminator. */
export function findCitizen(username: string, discriminator?: string): CitizenRecord | null {
  const u = username.toLowerCase().replace(/[^a-z0-9_.-]/g, '');
  const all = loadCitizens();
  if (discriminator) return all.find(c => c.username === u && c.discriminator === discriminator) ?? null;
  // No discriminator: return first match (oldest)
  return all.find(c => c.username === u) ?? null;
}

/** Parse /user/johndoe-1748 → {username, discriminator} */
export function parseCitizenUrl(path: string): { username: string; discriminator?: string } | null {
  const m = path.match(/^\/(?:user|citizen)\/([A-Za-z0-9_.-]+?)(?:-(\d{4}))?\/?$/);
  if (!m) return null;
  return { username: m[1], discriminator: m[2] };
}

/** Search citizens by name, type, or online status. */
export function searchCitizens(query: string, filters?: { type?: CitizenType; onlineOnly?: boolean; userType?: string }): CitizenRecord[] {
  const q = query.trim().toLowerCase();
  let results = loadCitizens();
  if (q) {
    results = results.filter(c =>
      c.displayName.toLowerCase().includes(q) ||
      c.username.includes(q) ||
      taggedName(c).toLowerCase().includes(q) ||
      (c.firstName && `${c.firstName} ${c.lastName}`.toLowerCase().includes(q))
    );
  }
  if (filters?.type) results = results.filter(c => c.type === filters.type);
  if (filters?.onlineOnly) results = results.filter(c => c.onlineStatus === 'online');
  if (filters?.userType) results = results.filter(c => c.userType === filters.userType);
  // Staff first, then by name
  return results.sort((a,b) => {
    if (a.type !== b.type) return a.type === 'staff' ? -1 : 1;
    return a.displayName.localeCompare(b.displayName);
  });
}

/** Seed the directory with the current user + Aurora if empty. */
export function ensureSeedCitizens() {
  if (loadCitizens().length > 0) return;
  try {
    const draft = JSON.parse(localStorage.getItem('grid-world:profile-draft') ?? '{}');
    if (draft.handle) {
      registerCitizen({
        displayName: draft.displayName ?? draft.handle,
        userType: draft.userType ?? 'explorer',
        bio: draft.bio, avatarUrl: draft.avatarUrl ?? null,
      });
    }
  } catch { /* no local profile yet */ }
  // Aurora is always in the directory
  if (!findCitizen('aurora')) {
    const all = loadCitizens();
    all.push({
      username: 'aurora', discriminator: '0001', displayName: 'Aurora',
      firstName: 'Aurora', lastName: 'Prime', title: 'World Guide',
      type: 'staff', bio: 'World Guide of GridWorld. 100% synthetic — honestly AI.',
      avatarUrl: '/avatars/aurora.webp', onlineStatus: 'online',
      createdAt: new Date().toISOString(),
    });
    saveCitizens(all);
  }
}
