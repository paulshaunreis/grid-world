// GridWorld Message Board — site bulletin board + in-world kiosk share the same data.
// Categories: General, Trade, Events, Help. Newest first. Identity on every post.

import type { BadgeUser } from './UserBadge';

export type BoardCategory = 'general' | 'trade' | 'events' | 'help';

export const BOARD_CATEGORIES: { id: BoardCategory; label: string; icon: string }[] = [
  { id: 'general', label: 'General', icon: '💬' },
  { id: 'trade', label: 'Trade', icon: '◈' },
  { id: 'events', label: 'Events', icon: '📅' },
  { id: 'help', label: 'Help', icon: '🛟' },
];

export type BoardPost = {
  id: string;
  category: BoardCategory;
  title: string;
  body: string;
  author: BadgeUser;
  createdAt: string;
  replies: BoardReply[];
};

export type BoardReply = {
  id: string;
  body: string;
  author: BadgeUser;
  createdAt: string;
};

const boardKey = 'grid-world:message-board';

export function loadBoardPosts(): BoardPost[] {
  try {
    const posts = JSON.parse(localStorage.getItem(boardKey) ?? '[]') as BoardPost[];
    return posts.sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
  } catch { return []; }
}

function saveBoardPosts(posts: BoardPost[]) {
  localStorage.setItem(boardKey, JSON.stringify(posts));
}

export function postToBoard(category: BoardCategory, title: string, body: string, author: BadgeUser): BoardPost | null {
  if (!author.handle || !title.trim() || !body.trim()) return null; // no anonymous, no empty
  const post: BoardPost = {
    id: crypto.randomUUID(), category,
    title: title.trim().slice(0, 120), body: body.trim().slice(0, 2000),
    author, createdAt: new Date().toISOString(), replies: [],
  };
  const posts = loadBoardPosts(); posts.push(post); saveBoardPosts(posts);
  // Phase 2: mirror to Supabase grid_board_posts.
  return post;
}

export function replyToBoardPost(postId: string, body: string, author: BadgeUser): boolean {
  if (!author.handle || !body.trim()) return false;
  const posts = loadBoardPosts();
  const post = posts.find(p=>p.id===postId);
  if (!post) return false;
  post.replies.push({ id: crypto.randomUUID(), body: body.trim().slice(0, 1000), author, createdAt: new Date().toISOString() });
  saveBoardPosts(posts);
  return true;
}

export function deleteBoardPost(postId: string, handle: string): boolean {
  const posts = loadBoardPosts();
  const idx = posts.findIndex(p=>p.id===postId);
  if (idx < 0) return false;
  // Only author can delete
  if (posts[idx].author.handle.toLowerCase() !== handle.toLowerCase().replace(/^@/,'') && handle.toLowerCase() !== 'aurora') return false;
  posts.splice(idx, 1); saveBoardPosts(posts);
  return true;
}

export function boardPostsByCategory(cat: BoardCategory | 'all'): BoardPost[] {
  const posts = loadBoardPosts();
  return cat === 'all' ? posts : posts.filter(p=>p.category===cat);
}
