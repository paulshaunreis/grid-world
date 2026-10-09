// GridWorld closed-access gate (Paul's direction 2026-10-08).
//
// GridWorld is in closed development. Only 'team' and 'approved' (beta)
// accounts get full access. Everyone else is redirected to /beta.html.
//
// Client-side redirects are UX — the real enforcement is Supabase RLS
// (see supabase/migrations/20261008170000_beta_access.sql).
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, supabaseConfigured } from '../persistence/config';

export type AccessLevel = 'team' | 'approved' | 'pending' | 'rejected' | 'anon';

// Pages anyone can visit without an approved account.
const PUBLIC_PATHS = new Set([
  '/', '/index.html',
  '/home.html',
  '/beta.html',
  '/join.html',
  '/signin.html',
  '/confirmed.html',
  '/recover.html',
  '/store.html',
  '/docs.html',
]);

export function isPublicPath(path: string): boolean {
  const clean = path.split('?')[0].split('#')[0];
  return PUBLIC_PATHS.has(clean);
}

export async function getAccessLevel(): Promise<AccessLevel> {
  if (!supabaseConfigured || !SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) return 'anon';
  try {
    const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
    const { data: { user } } = await client.auth.getUser();
    if (!user) return 'anon';
    const { data: profile } = await client.from('profiles')
      .select('beta_status')
      .eq('id', user.id)
      .maybeSingle();
    const status = (profile as any)?.beta_status;
    if (status === 'team' || status === 'approved' || status === 'pending' || status === 'rejected') {
      return status;
    }
    return 'pending'; // profile row missing → treat as pending, not open
  } catch {
    return 'pending'; // fail closed
  }
}

export function hasFullAccess(level: AccessLevel): boolean {
  return level === 'team' || level === 'approved';
}

/**
 * Call at the top of member-only pages. If the signed-in user is not
 * approved/team (or there's no profile row yet), redirect to /beta.html.
 * Public pages and anon visitors are left alone.
 */
export async function requireAccess(reason = 'signin'): Promise<AccessLevel> {
  const level = await getAccessLevel();
  if (level === 'anon') return level; // public pages handle anon themselves
  if (isPublicPath(window.location.pathname)) return level;
  if (!hasFullAccess(level)) {
    window.location.href = `/beta.html?reason=${reason}`;
    // Return a never-resolving promise so callers don't continue rendering.
    await new Promise(() => {});
  }
  return level;
}
