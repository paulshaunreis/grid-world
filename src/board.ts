// GridWorld Message Board page — site bulletin board (General, Trade, Events, Help).
// DISTINCT FROM THE FORUM: the Forum (forum.html) is threaded Supabase-backed
// discussion (categories/topics/posts/likes). The Message Board is a flat
// bulletin board for short notices. Conversations/DMs (grid_conversations /
// grid_messages) are a third, separate thing — not this page.
//
// Storage, honestly: posts are still saved in THIS BROWSER ONLY (localStorage).
// There is no grid_board_posts table live — see
// supabase/drafts/DO-NOT-APPLY_board_posts.sql for the shared-backend migration,
// which is draft-only until Paul approves + applies it. Do NOT wire this page
// to Supabase until that migration is applied live, or posting will break.
// Auth: guests browse read-only and get a sign-in prompt; only signed-in users
// can compose/reply/delete. No anonymous posting. No exceptions.

import './profile.css';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, supabaseConfigured } from './persistence/config';
import { userBadge, currentUserBadge } from './social/UserBadge';
import { BOARD_CATEGORIES, boardPostsByCategory, postToBoard, replyToBoardPost, deleteBoardPost, type BoardCategory, type BoardPost } from './social/messageBoard';

const app = document.querySelector<HTMLDivElement>('#board-app')!;

let activeCat: BoardCategory | 'all' = 'all';
let replyOpen: string | null = null;
let signedIn = false;

function esc(s: string): string {
  return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
}

function fmtDate(iso: string): string {
  try { return new Date(iso).toLocaleString(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}); }
  catch { return iso; }
}

function catLabel(id: string): string {
  return BOARD_CATEGORIES.find(c=>c.id===id)?.label ?? id;
}

function render() {
  const me = currentUserBadge();
  const posts = boardPostsByCategory(activeCat);
  app.innerHTML = `
    <header class="studio-header">
      <a class="brand" href="/"><span class="brand-mark">◇</span><span>GRID WORLD</span></a>
      <div class="studio-title"><span>MESSAGE BOARD</span><small>SHARED NOTICES · SAVED IN THIS BROWSER</small></div>
      <div class="studio-actions"><a href="/" class="ghost">BACK TO GRID</a></div>
    </header>
    <main class="profile-page">
      <p class="board-local-note">Message Board posts are saved in this browser only until the shared board launches. They are not visible to other citizens yet.</p>
      ${signedIn ? `<div class="board-composer module-card">
        <span class="module-label">NEW MESSAGE</span>
        <div class="board-composer-row">
          <select id="board-cat">${BOARD_CATEGORIES.map(c=>`<option value="${c.id}">${c.icon} ${c.label}</option>`).join('')}</select>
          <input id="board-title" placeholder="Subject…" maxlength="120">
        </div>
        <textarea id="board-body" rows="3" placeholder="What's happening on the Grid?" maxlength="2000"></textarea>
        <div class="board-composer-footer">
          <span class="board-as">Posting as ${userBadge(me)} · saved in this browser</span>
          <button id="board-post" type="button">POST MESSAGE</button>
        </div>
      </div>` : `<div class="module-card board-signin-banner">You are browsing as a guest. <a href="/signin.html">Sign in</a> to post messages and replies.</div>`}

      <nav class="profile-tabs board-tabs">
        ${['all',...BOARD_CATEGORIES.map(c=>c.id)].map(c=>`<button class="${activeCat===c?'active':''}" data-board-cat="${c}" type="button">${c==='all'?'ALL':BOARD_CATEGORIES.find(x=>x.id===c)!.label.toUpperCase()}</button>`).join('')}
      </nav>

      <div class="board-list">
        ${posts.length ? posts.map(p=>postHtml(p, me.handle)).join('') : '<div class="module-card"><p>No messages yet. Start the conversation.</p></div>'}
      </div>
    </main>`;
  bind();
}

function postHtml(p: BoardPost, myHandle: string): string {
  const cat = BOARD_CATEGORIES.find(c=>c.id===p.category);
  const canDelete = p.author.handle.toLowerCase() === myHandle.toLowerCase();
  return `<article class="module-card board-post-card">
    <div class="board-post-top"><span class="board-cat-tag">${cat?.icon} ${cat?.label}</span><small>${fmtDate(p.createdAt)}</small></div>
    <h3>${esc(p.title)}</h3>
    <div class="board-post-author">${userBadge(p.author)}</div>
    <p class="board-post-body">${esc(p.body)}</p>
    <div class="board-post-actions">
      ${signedIn ? `<button data-board-reply="${esc(p.id)}" type="button">💬 REPLY (${p.replies.length})</button>` : ''}
      ${signedIn && canDelete ? `<button data-board-delete="${esc(p.id)}" type="button">DELETE</button>` : ''}
    </div>
    ${signedIn && replyOpen === p.id ? `<div class="board-reply-box">
      <textarea id="board-reply-body" rows="2" placeholder="Write a reply…" maxlength="1000"></textarea>
      <button data-board-send-reply="${esc(p.id)}" type="button">SEND REPLY</button>
    </div>`:''}
    ${p.replies.length?`<div class="board-replies">${p.replies.map(r=>`
      <div class="board-reply"><div class="board-reply-head">${userBadge(r.author)}<small>${fmtDate(r.createdAt)}</small></div><p>${esc(r.body)}</p></div>
    `).join('')}</div>`:''}
  </article>`;
}

function bind() {
  document.querySelectorAll<HTMLButtonElement>('[data-board-cat]').forEach(b=>b.addEventListener('click',()=>{
    activeCat = b.dataset.boardCat as typeof activeCat;
    replyOpen = null;
    render();
  }));
  document.querySelector<HTMLButtonElement>('#board-post')?.addEventListener('click',()=>{
    const me = currentUserBadge();
    const cat = (document.querySelector<HTMLSelectElement>('#board-cat')?.value ?? 'general') as BoardCategory;
    const title = document.querySelector<HTMLInputElement>('#board-title')?.value ?? '';
    const body = document.querySelector<HTMLTextAreaElement>('#board-body')?.value ?? '';
    if (postToBoard(cat, title, body, me)) render();
  });
  document.querySelectorAll<HTMLButtonElement>('[data-board-reply]').forEach(b=>b.addEventListener('click',()=>{
    replyOpen = replyOpen === b.dataset.boardReply ? null : b.dataset.boardReply!;
    render();
  }));
  document.querySelectorAll<HTMLButtonElement>('[data-board-send-reply]').forEach(b=>b.addEventListener('click',()=>{
    const me = currentUserBadge();
    const body = document.querySelector<HTMLTextAreaElement>('#board-reply-body')?.value ?? '';
    if (replyToBoardPost(b.dataset.boardSendReply!, body, me)) { replyOpen = null; render(); }
  }));
  document.querySelectorAll<HTMLButtonElement>('[data-board-delete]').forEach(b=>b.addEventListener('click',()=>{
    if (!signedIn) return;
    const me = currentUserBadge();
    if (deleteBoardPost(b.dataset.boardDelete!, me.handle)) render();
  }));
}

// Session gate: guests browse read-only; only signed-in users compose/reply/delete.
if (!supabaseConfigured || !SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  // No backend configured — still allow local browsing, but no posting.
  signedIn = false;
  render();
} else {
  const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  void client.auth.getSession().then(({ data }) => {
    signedIn = Boolean(data.session);
    render();
  });
  client.auth.onAuthStateChange((_event, session) => {
    const was = signedIn;
    signedIn = Boolean(session);
    if (signedIn !== was) render();
  });
}
