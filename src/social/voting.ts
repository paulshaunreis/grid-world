// GridWorld unified voting — like AND dislike on everything.
// One vote per user per item: toggle off, or swap like↔dislike.
// Same component everywhere: gallery, blog, board, forum, tracks, videos.

export type VoteState = 'like' | 'dislike' | null;

export interface VoteCounts {
  likes: number;
  dislikes: number;
  userVote: VoteState;
}

const votesKey = 'grid-world:votes';

/** Keyed by item id. Value: {likes, dislikes, userVote} */
function loadAll(): Record<string, VoteCounts> {
  try { return JSON.parse(localStorage.getItem(votesKey) ?? '{}'); }
  catch { return {}; }
}
function saveAll(v: Record<string, VoteCounts>) {
  localStorage.setItem(votesKey, JSON.stringify(v));
}

export function getVotes(itemId: string): VoteCounts {
  return loadAll()[itemId] ?? { likes: 0, dislikes: 0, userVote: null };
}

/**
 * Cast a vote. Toggles off if same vote, swaps if different.
 * Returns the new counts.
 */
export function vote(itemId: string, v: 'like' | 'dislike'): VoteCounts {
  const all = loadAll();
  const cur = all[itemId] ?? { likes: 0, dislikes: 0, userVote: null };
  if (cur.userVote === v) {
    // Toggle off
    if (v === 'like') cur.likes = Math.max(0, cur.likes - 1);
    else cur.dislikes = Math.max(0, cur.dislikes - 1);
    cur.userVote = null;
  } else {
    // Remove old vote, add new
    if (cur.userVote === 'like') cur.likes = Math.max(0, cur.likes - 1);
    if (cur.userVote === 'dislike') cur.dislikes = Math.max(0, cur.dislikes - 1);
    if (v === 'like') cur.likes++;
    else cur.dislikes++;
    cur.userVote = v;
  }
  all[itemId] = cur;
  saveAll(all);
  // Phase 2: mirror to Supabase grid_votes (unique on user_id+item_id).
  return cur;
}

function esc(s: string): string {
  return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
}

/** Renders like/dislike buttons with counts. Compact, GridWorld-styled. */
export function voteButtons(itemId: string): string {
  const v = getVotes(itemId);
  return `<span class="vote-group" data-vote-group="${esc(itemId)}">
    <button class="vote-btn vote-like ${v.userVote==='like'?'active':''}" data-vote="like" data-vote-id="${esc(itemId)}" type="button" title="Like">👍 <b>${v.likes}</b></button>
    <button class="vote-btn vote-dislike ${v.userVote==='dislike'?'active':''}" data-vote="dislike" data-vote-id="${esc(itemId)}" type="button" title="Dislike">👎 <b>${v.dislikes}</b></button>
  </span>`;
}

/** Net score (likes - dislikes). For "most liked" sorting. */
export function voteScore(itemId: string): number {
  const v = getVotes(itemId);
  return v.likes - v.dislikes;
}

/** Bind all vote buttons in the document. Call after render. onUpdate re-renders. */
export function bindVotes(onUpdate: () => void) {
  document.querySelectorAll<HTMLButtonElement>('[data-vote]').forEach(b => {
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      vote(b.dataset.voteId!, b.dataset.vote as 'like' | 'dislike');
      onUpdate();
    });
  });
}
