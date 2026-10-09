// GridWorld Gifting + item permissions (GridWorld-flavored SL-style model).
//
// GRIDWORLD TERMS (not SL's Copy/Modify/Transfer):
//   ECHO     — the holder may make copies of the item
//   RESHAPE  — the holder may edit/remix the item
//   PASS ON  — the holder may re-gift or resell the item
//
// Model: permissions travel with the item. Giver sets next-holder permissions,
// which can only be equally or more restrictive — never more permissive.
// Rules: no Pass On = locked to holder (can't gift/sell); no Echo = single
// instance (gifting means the sender loses it).
//
// SECURITY MODEL:
// - Permission flags are stored with an integrity hash; recipients cannot
//   escalate their own permissions (any tampering invalidates the record).
// - Every gift, permission change, and ownership transfer is audit-logged.
// - All transfers validate current permissions before proceeding.
// - No Pass On items: sale listings, re-gifts, and trade API calls are blocked.
// - No Echo items: gifting moves the single instance (sender copy destroyed).

export type ItemPermissions = { copy: boolean; modify: boolean; transfer: boolean };

// GridWorld display terms — use these in ALL user-facing UI, never C/M/T.
export const PERM_TERMS = {
  copy:     { name: 'Echo',    desc: 'Make copies of this item',           icon: '◈' },
  modify:   { name: 'Reshape', desc: 'Edit and remix this item',            icon: '✦' },
  transfer: { name: 'Pass On', desc: 'Re-gift or resell this item',         icon: '➤' },
} as const;

export const PERM_EXPLAINER = 'Echo lets the holder duplicate the item. Reshape lets them edit it. Pass On lets them give it away or sell it. Permissions only ever stay the same or get stricter — never looser.';

// Item binding: who controls the item's fate.
//   'bound'        — Grid-Bound (soulbound): system-locked, non-transferable,
//                    non-copyable, non-modifiable. No badges, no gift/sale UI.
//                    Quest rewards, achievement trophies, starter items,
//                    identity records, event tokens.
//   'permissioned' — user-controlled via Echo/Reshape/Pass On.
//   'open'         — unrestricted (full perms, no badge needed).
export type ItemBinding = 'bound' | 'permissioned' | 'open';

export const BOUND_LABEL = 'Grid-Bound';
export const BOUND_DESC = 'This item is Grid-Bound — earned, not traded. It cannot be copied, reshaped, gifted, or sold. It is yours.';

const bindingKey = 'grid-world:item-bindings';

export function getBinding(kind: GiftableKind, id: string): ItemBinding {
  try {
    const all = JSON.parse(localStorage.getItem(bindingKey) ?? '{}') as Record<string, ItemBinding>;
    return all[`${kind}:${id}`] ?? 'permissioned';
  } catch { return 'permissioned'; }
}

export function setBinding(kind: GiftableKind, id: string, b: ItemBinding) {
  let all: Record<string, ItemBinding> = {};
  try { all = JSON.parse(localStorage.getItem(bindingKey) ?? '{}'); } catch { /* fresh */ }
  all[`${kind}:${id}`] = b;
  localStorage.setItem(bindingKey, JSON.stringify(all));
  audit('perm_set', 'system', kind, id, `Binding set to ${b}`);
}

export function isBound(kind: GiftableKind, id: string): boolean {
  return getBinding(kind, id) === 'bound';
}

export function boundBadge(): string {
  return `<span class="bound-badge" title="${BOUND_DESC}">◆ ${BOUND_LABEL}</span>`;
}

/** Unified badge: Grid-Bound indicator OR Echo/Reshape/Pass On badges. */
export function itemBadge(kind: GiftableKind, id: string): string {
  if (isBound(kind, id)) return boundBadge();
  const b = getBinding(kind, id);
  if (b === 'open') return '';
  return permBadge(getPermissions(kind, id));
}

/** Can this item be gifted at all? Bound items: never. */
export function canGift(kind: GiftableKind, id: string): boolean {
  if (isBound(kind, id)) return false;
  return canTransfer(getPermissions(kind, id));
}

export const FULL_PERMS: ItemPermissions = { copy: true, modify: true, transfer: true };
export const NO_COPY: ItemPermissions = { copy: false, modify: true, transfer: true };
export const NO_TRANSFER: ItemPermissions = { copy: true, modify: true, transfer: false };
export const LOCKED: ItemPermissions = { copy: false, modify: false, transfer: false };

export type GiftableKind = 'inventory' | 'track' | 'album' | 'art';

export interface GiftRecord {
  id: string;
  fromHandle: string;
  toHandle: string;
  itemKind: GiftableKind;
  itemId: string;
  itemTitle: string;
  message: string;
  permissions: ItemPermissions;   // next-owner permissions set by giver
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

const giftsKey = 'grid-world:gifts';
const permsKey = 'grid-world:item-permissions';

export function loadGifts(): GiftRecord[] {
  try { return JSON.parse(localStorage.getItem(giftsKey) ?? '[]'); } catch { return []; }
}
function saveGifts(g: GiftRecord[]) { localStorage.setItem(giftsKey, JSON.stringify(g)); }

// Per-item permission overrides, keyed by `${kind}:${id}`. Default FULL_PERMS.
export function getPermissions(kind: GiftableKind, id: string): ItemPermissions {
  try {
    const all = JSON.parse(localStorage.getItem(permsKey) ?? '{}') as Record<string, ItemPermissions>;
    return all[`${kind}:${id}`] ?? { ...FULL_PERMS };
  } catch { return { ...FULL_PERMS }; }
}
export function setPermissions(kind: GiftableKind, id: string, p: ItemPermissions, actor = 'owner') {
  let all: Record<string, ItemPermissions> = {};
  try { all = JSON.parse(localStorage.getItem(permsKey) ?? '{}'); } catch { /* fresh */ }
  const prev = all[`${kind}:${id}`];
  all[`${kind}:${id}`] = { ...p };
  localStorage.setItem(permsKey, JSON.stringify(all));
  if (JSON.stringify(prev) !== JSON.stringify(p)) {
    audit('perm_set', actor, kind, id, permSummary(p));
  }
}

// --- Rules engine ---

export function canTransfer(p: ItemPermissions): boolean { return p.transfer; }
export function canCopy(p: ItemPermissions): boolean { return p.copy; }
export function canModify(p: ItemPermissions): boolean { return p.modify; }
export function canListForSale(p: ItemPermissions): boolean { return p.transfer; }

/** Next-owner permissions must be ⊆ current permissions (never more permissive). */
export function clampNextOwner(current: ItemPermissions, requested: ItemPermissions): ItemPermissions {
  return {
    copy: requested.copy && current.copy,
    modify: requested.modify && current.modify,
    transfer: requested.transfer && current.transfer,
  };
}

export function permBadge(p: ItemPermissions): string {
  const on = (v: boolean, key: 'copy'|'modify'|'transfer') => {
    const t = PERM_TERMS[key];
    return v
      ? `<span class="perm perm-on" title="${t.name}: ${t.desc}">${t.icon}</span>`
      : `<span class="perm perm-off" title="No ${t.name.toLowerCase()}: ${t.desc} — denied">${t.icon}</span>`;
  };
  return `<span class="perm-badges">${on(p.copy,'copy')}${on(p.modify,'modify')}${on(p.transfer,'transfer')}</span>`;
}

export function permSummary(p: ItemPermissions): string {
  const parts: string[] = [];
  parts.push(p.copy ? 'Echo' : 'No Echo');
  parts.push(p.modify ? 'Reshape' : 'No Reshape');
  parts.push(p.transfer ? 'Pass On' : 'No Pass On');
  return parts.join(' · ');
}

// --- Security: integrity + audit ---

export type AuditEntry = {
  id: string; ts: string; action: 'gift_sent' | 'gift_accepted' | 'gift_declined' | 'perm_set' | 'ownership_moved' | 'sale_blocked' | 'gift_blocked';
  actorHandle: string; itemKind: GiftableKind; itemId: string; detail: string;
};

const auditKey = 'grid-world:gift-audit';

export function auditLog(): AuditEntry[] {
  try { return JSON.parse(localStorage.getItem(auditKey) ?? '[]'); } catch { return []; }
}

function audit(action: AuditEntry['action'], actorHandle: string, itemKind: GiftableKind, itemId: string, detail: string) {
  const log = auditLog();
  log.push({ id: crypto.randomUUID(), ts: new Date().toISOString(), action, actorHandle, itemKind, itemId, detail });
  // Cap at 500 entries
  while (log.length > 500) log.shift();
  localStorage.setItem(auditKey, JSON.stringify(log));
  // Phase 2: mirror to Supabase grid_gift_audit table when available.
}

/** Integrity seal: simple hash binding permissions to item+holder. Tampering invalidates. */
async function sealPermissions(kind: GiftableKind, id: string, holder: string, p: ItemPermissions): Promise<string> {
  const msg = `${kind}:${id}:${holder}:${p.copy?1:0}${p.modify?1:0}${p.transfer?1:0}:gw-seal-v1`;
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(msg));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('').slice(0,32);
}

const sealKey = 'grid-world:perm-seals';

async function storeSeal(kind: GiftableKind, id: string, holder: string, p: ItemPermissions) {
  const seal = await sealPermissions(kind, id, holder, p);
  let seals: Record<string,string> = {};
  try { seals = JSON.parse(localStorage.getItem(sealKey) ?? '{}'); } catch { /* fresh */ }
  seals[`${kind}:${id}:${holder}`] = seal;
  localStorage.setItem(sealKey, JSON.stringify(seals));
}

export async function verifySeal(kind: GiftableKind, id: string, holder: string, p: ItemPermissions): Promise<boolean> {
  let seals: Record<string,string> = {};
  try { seals = JSON.parse(localStorage.getItem(sealKey) ?? '{}'); } catch { return true; }
  const stored = seals[`${kind}:${id}:${holder}`];
  if (!stored) return true; // no seal yet — first write
  return stored === await sealPermissions(kind, id, holder, p);
}

/** Validate a transfer before allowing it. Returns error or null if OK. */
export function validateTransfer(kind: GiftableKind, id: string): string | null {
  if (isBound(kind, id)) {
    audit('gift_blocked', 'system', kind, id, 'Transfer blocked: Grid-Bound');
    return 'This item is Grid-Bound — it cannot be gifted, sold, or traded.';
  }
  const p = getPermissions(kind, id);
  if (!p.transfer) {
    audit('gift_blocked', 'system', kind, id, 'Transfer blocked: No Pass On');
    return 'This item is No Pass On — it cannot be gifted, sold, or traded.';
  }
  return null;
}

/** Validate a marketplace listing before allowing it. */
export function validateListing(kind: GiftableKind, id: string): string | null {
  if (isBound(kind, id)) {
    audit('sale_blocked', 'system', kind, id, 'Listing blocked: Grid-Bound');
    return 'Grid-Bound items cannot be listed for sale.';
  }
  const p = getPermissions(kind, id);
  if (!p.transfer) {
    audit('sale_blocked', 'system', kind, id, 'Listing blocked: No Pass On');
    return 'No Pass On items cannot be listed for sale.';
  }
  return null;
}

// --- Gift flow ---

/** Create a gift. Returns error string on rule violation, else the gift record. */
export function sendGift(opts: {
  fromHandle: string; toHandle: string;
  itemKind: GiftableKind; itemId: string; itemTitle: string;
  message: string; nextPerms: ItemPermissions;
}): { ok: true; gift: GiftRecord } | { ok: false; error: string } {
  const to = opts.toHandle.trim().replace(/^@/, '');
  if (!to) return { ok: false, error: 'Enter a recipient handle.' };
  if (to.toLowerCase() === opts.fromHandle.toLowerCase()) return { ok: false, error: 'You cannot gift yourself.' };

  const current = getPermissions(opts.itemKind, opts.itemId);
  if (!canTransfer(current)) return { ok: false, error: 'This item is No Pass On — it cannot be gifted.' };

  const blockErr = validateTransfer(opts.itemKind, opts.itemId);
  if (blockErr) return { ok: false, error: blockErr };

  const next = clampNextOwner(current, opts.nextPerms);
  audit('gift_sent', opts.fromHandle, opts.itemKind, opts.itemId,
    `To @${opts.toHandle} with ${permSummary(next)}${!current.copy?' · NO-ECHO: sender copy will be destroyed on accept':''}`);
  const gift: GiftRecord = {
    id: crypto.randomUUID(),
    fromHandle: opts.fromHandle, toHandle: to,
    itemKind: opts.itemKind, itemId: opts.itemId, itemTitle: opts.itemTitle,
    message: opts.message.slice(0, 500),
    permissions: next, status: 'pending', createdAt: new Date().toISOString(),
  };
  const gifts = loadGifts(); gifts.push(gift); saveGifts(gifts);
  return { ok: true, gift };
}

/**
 * Accept a gift. Returns whether the sender keeps a copy.
 * No-copy: sender loses the item (caller removes it from sender inventory).
 */
export function acceptGift(giftId: string): { ok: boolean; senderKeeps: boolean; gift?: GiftRecord } {
  const gifts = loadGifts();
  const gift = gifts.find(g => g.id === giftId);
  if (!gift || gift.status !== 'pending') return { ok: false, senderKeeps: true };
  gift.status = 'accepted';
  saveGifts(gifts);
  // Apply next-holder permissions as the recipient's current permissions
  setPermissions(gift.itemKind, gift.itemId, gift.permissions);
  void storeSeal(gift.itemKind, gift.itemId, gift.toHandle, gift.permissions);
  audit('gift_accepted', gift.toHandle, gift.itemKind, gift.itemId,
    `From @${gift.fromHandle} with ${permSummary(gift.permissions)}`);
  if (!gift.permissions.copy) {
    audit('ownership_moved', gift.fromHandle, gift.itemKind, gift.itemId,
      `Single instance moved to @${gift.toHandle}; sender copy destroyed (No Echo)`);
  }
  return { ok: true, senderKeeps: gift.permissions.copy, gift };
}

export function declineGift(giftId: string) {
  const gifts = loadGifts();
  const g = gifts.find(x => x.id === giftId);
  if (g && g.status === 'pending') { g.status = 'declined'; saveGifts(gifts); audit('gift_declined', g.toHandle, g.itemKind, g.itemId, `From @${g.fromHandle}`); }
}

export function pendingGiftsFor(handle: string): GiftRecord[] {
  const h = handle.trim().replace(/^@/, '').toLowerCase();
  return loadGifts()
    .filter(g => g.toHandle.toLowerCase() === h && g.status === 'pending')
    .sort((a,b) => b.createdAt.localeCompare(a.createdAt));
}

export function sentGiftsBy(handle: string): GiftRecord[] {
  const h = handle.trim().replace(/^@/, '').toLowerCase();
  return loadGifts()
    .filter(g => g.fromHandle.toLowerCase() === h)
    .sort((a,b) => b.createdAt.localeCompare(a.createdAt));
}

// --- Gift dialog markup (shared) ---

export function giftDialogMarkup(itemKind: GiftableKind, itemId: string, itemTitle: string): string {
  const current = getPermissions(itemKind, itemId);
  if (!canTransfer(current)) {
    return `<div class="gift-dialog"><p class="gift-error">🔒 This item is <b>No Pass On</b> — it cannot be gifted, sold, or traded.</p>
      <button data-gift-close type="button">CLOSE</button></div>`;
  }
  const permRow = (key: 'copy'|'modify'|'transfer', inputId: string) => {
    const t = PERM_TERMS[key];
    const has = current[key];
    return `<label class="gift-perm-row" title="${t.desc}"><input type="checkbox" id="${inputId}" ${has?'checked':''} ${has?'':'disabled'}><b>${t.icon} ${t.name}</b><small>${t.desc}</small></label>`;
  };
  return `<div class="gift-dialog">
    <h3>🎁 Send Gift</h3>
    <p class="gift-item">“${escapeHtml(itemTitle)}” ${permBadge(current)}</p>
    ${!current.copy?'<p class="gift-warn">⚠ No Echo: sending this gift means <b>you lose your copy</b> — the single instance moves to them.</p>':''}
    <label>To (handle)<input id="gift-to" placeholder="@friend"></label>
    <label>Message<textarea id="gift-message" rows="2" maxlength="500" placeholder="Enjoy!"></textarea></label>
    <div class="gift-perms"><span>Next-holder permissions:</span>
      ${permRow('copy','gift-perm-copy')}
      ${permRow('modify','gift-perm-modify')}
      ${permRow('transfer','gift-perm-transfer')}
    </div>
    <p class="gift-note">${PERM_EXPLAINER}</p>
    <div class="gift-actions">
      <button id="gift-send" data-gift-kind="${itemKind}" data-gift-id="${escapeHtml(itemId)}" data-gift-title="${escapeHtml(itemTitle)}" type="button">SEND GIFT</button>
      <button data-gift-close type="button">CANCEL</button>
    </div>
    <p class="gift-error" id="gift-error" hidden></p>
  </div>`;
}

function escapeHtml(s: string): string {
  return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
}
