// Grid World Forum page — categories, topics, posts, likes.
// Reads/writes through GridSocialService (anon-key Supabase client, RLS-aware).
// No service-role keys, no RLS bypass. Honest in-development framing:
// posts are real and stored in the signed-in user's Grid account.
// The in-game Community panel keeps its own overlay forum (GridForumPanel);
// this page is the standalone Forums section linked from the main nav.

import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, supabaseConfigured } from './persistence/config';
import { GridSocialService } from './social/GridSocialService';

const app = document.querySelector<HTMLDivElement>('#forum-app')!;

function escapeHtml(s: string): string {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function fmtDate(v: unknown): string {
  const t = new Date(String(v ?? ''));
  return Number.isNaN(t.getTime()) ? '' : t.toLocaleString();
}

function authorLabel(p: any): string {
  if (p?.author_npc) return 'Grid NPC';
  const h = String(p?.author_handle ?? p?.author_name ?? '').trim();
  if (h) return h.startsWith('@') ? h : '@' + h;
  return 'Grid citizen';
}

function ratingLabel(r: unknown): string {
  const v = String(r ?? 'E');
  return v === 'E' ? 'E · EVERYONE' : v;
}

if (!supabaseConfigured || !SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  app.innerHTML = '<div class="forum-kicker">GRID WORLD // FORUMS</div><h1>Forums<span>.</span></h1>'
    + '<p class="forum-sub">The forum backend is not configured yet. Grid World is in active development.</p>'
    + '<p class="forum-note"><a href="/" style="color:#7ee7ff">← Back to Grid World</a></p>';
  throw new Error('Supabase not configured');
}

const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
const social = new GridSocialService(client);

type Category = any;
type Topic = any;
type Post = any;

let categories: Category[] = [];
let topics: Topic[] = [];
let posts: Post[] = [];
let selectedCategory = '';
let selectedTopic: number | null = null;
let signedIn = false;
let liked = new Set<number>();
let statusMsg = '';

function syncUrl(): void {
  const params = new URLSearchParams();
  if (selectedCategory) params.set('category', selectedCategory);
  if (selectedTopic !== null) params.set('topic', String(selectedTopic));
  const q = params.toString();
  window.history.replaceState(null, '', '/forum.html' + (q ? '?' + q : ''));
}

function setStatus(msg: string): void {
  statusMsg = msg;
  const el = app.querySelector<HTMLDivElement>('#gf-status');
  if (el) {
    el.textContent = msg;
    el.style.display = msg ? '' : 'none';
  }
}

async function loadCategories(): Promise<void> {
  const catsEl = app.querySelector<HTMLElement>('#gf-cats');
  if (catsEl) catsEl.innerHTML = '<div class="gf-empty">Loading categories…</div>';
  try {
    categories = await social.categories();
  } catch (err) {
    if (catsEl) {
      catsEl.innerHTML = '<div class="gf-error">Forums could not be loaded. The forum backend may be unavailable — try again in a bit.</div>';
    }
    console.warn('Forum categories load failed.', err);
    return;
  }
  if (!categories.length) {
    if (catsEl) catsEl.innerHTML = '<div class="gf-empty">No forum categories yet.</div>';
    renderTopics();
    return;
  }
  const params = new URLSearchParams(window.location.search);
  const wanted = params.get('category') ?? '';
  selectedCategory = categories.some((c) => String(c.id) === wanted) ? wanted : String(categories[0].id);
  renderCats();
  await loadTopics();
}

function renderCats(): void {
  const catsEl = app.querySelector<HTMLElement>('#gf-cats');
  if (!catsEl) return;
  catsEl.innerHTML = categories.map((c) => '<button class="gf-cat' + (String(c.id) === selectedCategory ? ' active' : '') + '" data-cat="' + escapeHtml(String(c.id)) + '">'
    + '<b>' + escapeHtml(String(c.label ?? 'Category')) + '</b><small>' + escapeHtml(ratingLabel(c.content_rating)) + '</small>'
    + (c.description ? '<span>' + escapeHtml(String(c.description)) + '</span>' : '') + '</button>').join('');
  catsEl.querySelectorAll<HTMLButtonElement>('[data-cat]').forEach((b) => {
    b.onclick = () => {
      selectedCategory = b.dataset.cat!;
      selectedTopic = null;
      syncUrl();
      renderCats();
      void loadTopics();
    };
  });
}

async function loadTopics(): Promise<void> {
  const topicsEl = app.querySelector<HTMLElement>('#gf-topics');
  if (topicsEl) topicsEl.innerHTML = '<div class="gf-empty">Loading topics…</div>';
  try {
    topics = await social.topics(selectedCategory);
  } catch (err) {
    if (topicsEl) {
      topicsEl.innerHTML = '<div class="gf-error">Topics could not be loaded. Try again in a bit.</div>';
    }
    console.warn('Forum topics load failed.', err);
    return;
  }
  const params = new URLSearchParams(window.location.search);
  const wantedTopic = Number(params.get('topic'));
  const match = topics.find((t) => Number(t.id) === wantedTopic);
  if (match) selectedTopic = Number(match.id);
  renderTopics();
  await loadPosts();
}

function renderTopics(): void {
  const topicsEl = app.querySelector<HTMLElement>('#gf-topics');
  if (!topicsEl) return;
  const header = '<div class="gf-toolbar"><b>TOPICS</b>' + (signedIn ? '<button class="gf-btn" id="gf-new-topic">NEW TOPIC</button>' : '') + '</div>';
  if (!topics.length) {
    topicsEl.innerHTML = header + '<div class="gf-empty">No topics yet in this category.</div>' + createTopicForm();
    wireCreateTopic();
    return;
  }
  topicsEl.innerHTML = header + topics.map((t) => '<button class="gf-topic' + (Number(t.id) === selectedTopic ? ' active' : '') + '" data-topic="' + Number(t.id) + '">'
    + '<strong>' + escapeHtml(String(t.title ?? 'Untitled topic')) + '</strong>'
    + '<small>' + escapeHtml(ratingLabel(t.content_rating)) + (t.updated_at ? ' · ' + escapeHtml(fmtDate(t.updated_at)) : '') + '</small>'
    + (t.description ? '<span>' + escapeHtml(String(t.description)) + '</span>' : '') + '</button>').join('')
    + createTopicForm();
  topicsEl.querySelectorAll<HTMLButtonElement>('[data-topic]').forEach((b) => {
    b.onclick = () => {
      selectedTopic = Number(b.dataset.topic);
      syncUrl();
      renderTopics();
      void loadPosts();
    };
  });
  wireCreateTopic();
}

function createTopicForm(): string {
  if (!signedIn) return '';
  return '<form id="gf-create-topic" class="forum-card" style="margin-top:14px">'
    + '<h2>START A TOPIC</h2>'
    + '<div class="gf-field"><label for="gf-title">TITLE</label><input id="gf-title" maxlength="200" required placeholder="What is this topic about?"></div>'
    + '<div class="gf-field"><label for="gf-desc">DESCRIPTION</label><textarea id="gf-desc" maxlength="2000" placeholder="A short intro for the conversation (optional)."></textarea></div>'
    + '<button class="gf-btn" type="submit">CREATE TOPIC</button></form>';
}

function wireCreateTopic(): void {
  const form = app.querySelector<HTMLFormElement>('#gf-create-topic');
  if (!form) return;
  form.onsubmit = async (e) => {
    e.preventDefault();
    const title = (form.querySelector<HTMLInputElement>('#gf-title')!.value || '').trim();
    const description = (form.querySelector<HTMLTextAreaElement>('#gf-desc')!.value || '').trim();
    if (!title) return;
    const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    btn.disabled = true;
    try {
      const created = await social.createTopic(selectedCategory, title, description || 'Community-created topic', 'E');
      setStatus('Topic created.');
      await loadTopics();
      if (created?.id !== undefined) {
        selectedTopic = Number(created.id);
        syncUrl();
        renderTopics();
        await loadPosts();
      }
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Could not create the topic. Try again.');
    } finally {
      btn.disabled = false;
    }
  };
}

async function loadPosts(): Promise<void> {
  const postsEl = app.querySelector<HTMLElement>('#gf-posts');
  if (!postsEl) return;
  if (selectedTopic === null) {
    postsEl.innerHTML = '<div class="gf-empty">Select a topic to read the conversation.</div>';
    return;
  }
  postsEl.innerHTML = '<div class="gf-empty">Loading posts…</div>';
  try {
    posts = await social.posts(selectedTopic);
  } catch (err) {
    postsEl.innerHTML = '<div class="gf-error">Posts could not be loaded. Try again in a bit.</div>';
    console.warn('Forum posts load failed.', err);
    return;
  }
  // Prime liked state from the service's own toggle check is intentionally
  // skipped: one extra query per post. Buttons start as "Like" and flip on tap.
  renderPosts();
}

function renderPosts(): void {
  const postsEl = app.querySelector<HTMLElement>('#gf-posts');
  if (!postsEl || selectedTopic === null) return;
  const topic = topics.find((t) => Number(t.id) === selectedTopic);
  const head = '<div class="gf-back"><button class="gf-btn gf-btn-ghost" id="gf-back">← ALL TOPICS</button></div>'
    + '<div class="gf-toolbar"><b>CONVERSATION</b><span>' + escapeHtml(String(topic?.title ?? 'Topic')) + '</span></div>';
  const list = !posts.length
    ? '<div class="gf-empty">No replies yet — be the first to reply.</div>'
    : posts.map((p) => '<article class="gf-post"><header><span>' + escapeHtml(authorLabel(p)) + '</span><small>' + escapeHtml(fmtDate(p.created_at)) + '</small></header>'
      + '<p>' + escapeHtml(String(p.body ?? '')) + '</p>'
      + '<footer><span>' + escapeHtml(ratingLabel(p.content_rating)) + '</span>'
      + '<button class="gf-like' + (liked.has(Number(p.id)) ? ' liked' : '') + '" data-like="' + Number(p.id) + '">' + (liked.has(Number(p.id)) ? '♥ LIKED' : '♡ LIKE') + '</button></footer></article>').join('');
  const reply = signedIn
    ? '<form id="gf-reply-form" class="forum-card" style="margin-top:14px"><h2>REPLY</h2>'
      + '<div class="gf-field"><label for="gf-reply-body">YOUR REPLY</label><textarea id="gf-reply-body" maxlength="5000" required placeholder="Write your reply…"></textarea></div>'
      + '<button class="gf-btn" type="submit">POST REPLY</button></form>'
    : '';
  postsEl.innerHTML = head + list + reply;
  const back = postsEl.querySelector<HTMLButtonElement>('#gf-back');
  if (back) {
    back.onclick = () => {
      selectedTopic = null;
      syncUrl();
      renderTopics();
      void loadPosts();
    };
  }
  postsEl.querySelectorAll<HTMLButtonElement>('[data-like]').forEach((b) => {
    b.onclick = async () => {
      if (!signedIn) {
        setStatus('Sign in to like posts.');
        return;
      }
      const id = Number(b.dataset.like);
      try {
        const nowLiked = await social.toggleLike(id);
        if (nowLiked) liked.add(id); else liked.delete(id);
        b.classList.toggle('liked', nowLiked);
        b.textContent = nowLiked ? '♥ LIKED' : '♡ LIKE';
      } catch (err) {
        setStatus('Could not update the like. Try again.');
        console.warn('Forum like failed.', err);
      }
    };
  });
  const replyForm = postsEl.querySelector<HTMLFormElement>('#gf-reply-form');
  if (replyForm) {
    replyForm.onsubmit = async (e) => {
      e.preventDefault();
      const body = (replyForm.querySelector<HTMLTextAreaElement>('#gf-reply-body')!.value || '').trim();
      if (!body || selectedTopic === null) return;
      const btn = replyForm.querySelector<HTMLButtonElement>('button[type="submit"]')!;
      btn.disabled = true;
      try {
        await social.createPost(selectedTopic, body, 'E');
        setStatus('Reply posted.');
        await loadPosts();
      } catch (err) {
        setStatus(err instanceof Error ? err.message : 'Could not post the reply. Try again.');
      } finally {
        btn.disabled = false;
      }
    };
  }
}

app.innerHTML = '<div class="forum-kicker">GRID WORLD // COMMUNITY</div>'
  + '<h1>Forums<span>.</span></h1>'
  + '<p class="forum-sub">Conversations for every world, creator, interest and community — guides, ideas, builds and collaboration, all in one Grid identity.</p>'
  + '<p class="forum-note">Forums are in active development. Posts are real and stored in your Grid account.</p>'
  + '<div id="gf-status" class="gf-status" style="display:none"></div>'
  + '<div id="gf-signin-banner" class="gf-signin-banner" style="display:none">You are browsing as a guest. <a href="/signin.html">Sign in</a> to start topics, reply and like posts.</div>'
  + '<div class="forum-layout"><aside class="forum-card"><h2>CATEGORIES</h2><div id="gf-cats"></div></aside>'
  + '<main><section class="forum-card"><div id="gf-topics"></div></section>'
  + '<section class="forum-card" style="margin-top:16px"><div id="gf-posts"><div class="gf-empty">Select a topic to read the conversation.</div></div></section></main></div>';

if (statusMsg) setStatus(statusMsg);

void client.auth.getSession().then(({ data }) => {
  signedIn = Boolean(data.session);
  const banner = app.querySelector<HTMLElement>('#gf-signin-banner');
  if (banner) banner.style.display = signedIn ? 'none' : '';
  void loadCategories();
});

client.auth.onAuthStateChange((_event, session) => {
  const was = signedIn;
  signedIn = Boolean(session);
  if (signedIn !== was) {
    const banner = app.querySelector<HTMLElement>('#gf-signin-banner');
    if (banner) banner.style.display = signedIn ? 'none' : '';
    renderTopics();
    if (selectedTopic !== null) void loadPosts();
  }
});
