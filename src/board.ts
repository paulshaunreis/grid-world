import './profile.css';
import { userBadge, currentUserBadge } from './social/UserBadge';
import { BOARD_CATEGORIES, boardPostsByCategory, postToBoard, replyToBoardPost, deleteBoardPost, type BoardCategory, type BoardPost } from './social/messageBoard';

const app = document.querySelector<HTMLDivElement>('#board-app')!;

let activeCat: BoardCategory | 'all' = 'all';
let replyOpen: string | null = null;

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
      <div class="studio-title"><span>MESSAGE BOARD</span><small>EVERY CITIZEN · EVERY VOICE</small></div>
      <div class="studio-actions"><a href="/" class="ghost">BACK TO GRID</a></div>
    </header>
    <main class="profile-page">
      <div class="board-composer module-card">
        <span class="module-label">NEW MESSAGE</span>
        <div class="board-composer-row">
          <select id="board-cat">${BOARD_CATEGORIES.map(c=>`<option value="${c.id}">${c.icon} ${c.label}</option>`).join('')}</select>
          <input id="board-title" placeholder="Subject…" maxlength="120">
        </div>
        <textarea id="board-body" rows="3" placeholder="What's happening on the Grid?" maxlength="2000"></textarea>
        <div class="board-composer-footer">
          <span class="board-as">Posting as ${userBadge(me)}</span>
          <button id="board-post" type="button">POST MESSAGE</button>
        </div>
      </div>

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
      <button data-board-reply="${esc(p.id)}" type="button">💬 REPLY (${p.replies.length})</button>
      ${canDelete?`<button data-board-delete="${esc(p.id)}" type="button">DELETE</button>`:''}
    </div>
    ${replyOpen===p.id?`<div class="board-reply-box">
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
    const me = currentUserBadge();
    if (deleteBoardPost(b.dataset.boardDelete!, me.handle)) render();
  }));
}

render();
