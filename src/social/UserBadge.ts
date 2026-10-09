// GridWorld UserBadge — ONE identity component used everywhere.
// Every post, comment, forum reply, message, gallery piece, and blog entry
// shows: [avatar + online dot] "Display Name" [Type badge] → links to profile.
// No anonymous posting. No exceptions.

export type BadgeUser = {
  handle: string;
  displayName: string;
  /** Staff: full "First Last" name. */
  fullName?: string | null;
  /** Staff job title, e.g. "Systems Architect". */
  title?: string | null;
  /** 'staff' shows TEAM badge; 'citizen' shows type badge. */
  badge?: 'staff' | 'citizen' | null;
  avatarUrl?: string | null;
  userType?: string | null;
  userTypeLabel?: string | null;
  onlineStatus?: 'online' | 'away' | 'offline' | null;
};

function esc(s: string): string {
  return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
}

function avatarForBadge(u: BadgeUser): string {
  if (u.avatarUrl) return u.avatarUrl;
  if (u.handle.toLowerCase() === 'aurora') return '/avatars/aurora.webp';
  if (u.userType) return `/avatars/type-${u.userType}.webp`;
  return '/avatars/default-avatar.webp';
}

/**
 * Renders a clickable user badge. Size: 'sm' | 'md'.
 * Links to /profile.html?handle=@x (or /aurora.html for Aurora).
 */
export function userBadge(u: BadgeUser, size: 'sm' | 'md' = 'sm'): string {
  // Canonical clean URLs: /user/<username>
  const profileUrl = u.handle.toLowerCase() === 'aurora'
    ? '/user/aurora'
    : `/user/${esc(u.handle.toLowerCase())}`;
  const status = u.onlineStatus ?? 'offline';
  const name = u.fullName || u.displayName;
  const isStaff = u.badge === 'staff';
  const sub = isStaff ? (u.title ?? '') : (u.userTypeLabel ?? u.userType ?? '');
  return `<a class="user-badge user-badge-${size}" href="${profileUrl}">
    <span class="ub-avatar-wrap status-${status}">
      <img class="ub-avatar" src="${esc(avatarForBadge(u))}" alt="${esc(name)}" loading="lazy">
      <span class="ub-status-dot" title="${status}"></span>
    </span>
    <span class="ub-text"><span class="ub-name">${esc(name)}</span>${sub ? `<span class="ub-sub">${esc(sub)}</span>` : ''}</span>
    ${isStaff ? `<span class="ub-staff">TEAM</span>` : ''}
  </a>`;
}

/** Build a BadgeUser from the local profile draft (current user). */
export function currentUserBadge(): BadgeUser {
  try {
    const draft = JSON.parse(localStorage.getItem('grid-world:profile-draft') ?? '{}');
    return {
      handle: (draft.handle ?? 'gridtraveler').replace(/^@/, ''),
      displayName: draft.displayName ?? 'Grid Traveler',
      avatarUrl: draft.avatarUrl ?? null,
      userType: draft.userType ?? 'explorer',
      userTypeLabel: typeLabel(draft.userType ?? 'explorer'),
      onlineStatus: draft.onlineStatus ?? 'online',
    };
  } catch {
    return { handle: 'gridtraveler', displayName: 'Grid Traveler', userType: 'explorer', userTypeLabel: 'Explorer', onlineStatus: 'online' };
  }
}

const TYPE_LABELS: Record<string,string> = {
  navigator: 'Navigator', muse: 'Muse', explorer: 'Explorer', builder: 'Builder',
  scholar: 'Scholar', sentinel: 'Sentinel', wanderer: 'Wanderer', artist: 'Artist',
  ranger: 'Ranger', architect: 'Architect',
};

export function typeLabel(id: string): string {
  return TYPE_LABELS[id] ?? 'Explorer';
}

/** Resolve a handle to a BadgeUser. Checks local profile, then Aurora, else generic. */
export function badgeForHandle(handle: string): BadgeUser {
  const h = handle.trim().replace(/^@/, '').toLowerCase();
  if (h === 'aurora') {
    return { handle: 'aurora', displayName: 'Aurora', avatarUrl: '/avatars/aurora.webp', userTypeLabel: 'World Guide', onlineStatus: 'online' };
  }
  const me = currentUserBadge();
  if (me.handle.toLowerCase() === h) return me;
  // Unknown user: generic badge with default avatar (no anonymous posting — handle required)
  return { handle: h, displayName: '@' + h, userTypeLabel: '', onlineStatus: 'offline' };
}
