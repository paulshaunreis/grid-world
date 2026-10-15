-- ============================================================
-- DO-NOT-APPLY — DRAFT ONLY. NOT A MIGRATION.
-- This file lives in supabase/drafts/ so no migration tooling picks it up.
-- Do NOT apply until Paul explicitly approves + the Message Board client
-- is wired to Supabase in a follow-up change. Applying it alone changes
-- nothing the site uses; wiring the client before it is applied BREAKS
-- posting (table won't exist). The two must land together.
-- ============================================================
-- GridWorld Message Board — shared backend (draft).
-- Mirrors the localStorage shape in src/social/messageBoard.ts:
-- flat bulletin board, categories general/trade/events/help, newest first.
-- DISTINCT from the Forum (grid_forum_* — threaded discussion) and from
-- Conversations/DMs (grid_conversations / grid_messages).
-- ============================================================

create table if not exists public.grid_board_posts (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('general', 'trade', 'events', 'help')),
  title text not null check (char_length(title) <= 120),
  body text not null check (char_length(body) <= 2000),
  author_id uuid not null references auth.users (id) on delete cascade,
  author_handle text not null,
  author_display_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.grid_board_replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.grid_board_posts (id) on delete cascade,
  body text not null check (char_length(body) <= 1000),
  author_id uuid not null references auth.users (id) on delete cascade,
  author_handle text not null,
  author_display_name text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists grid_board_posts_category_created_idx
  on public.grid_board_posts (category, created_at desc);
create index if not exists grid_board_replies_post_created_idx
  on public.grid_board_replies (post_id, created_at asc);

alter table public.grid_board_posts enable row level security;
alter table public.grid_board_replies enable row level security;

-- Everyone can read the board (anon + authenticated).
do $$ begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'grid_board_posts' and policyname = 'grid_board_posts_public_read') then
    create policy grid_board_posts_public_read on public.grid_board_posts
      for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'grid_board_replies' and policyname = 'grid_board_replies_public_read') then
    create policy grid_board_replies_public_read on public.grid_board_replies
      for select to anon, authenticated using (true);
  end if;
  -- Signed-in users can post as themselves.
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'grid_board_posts' and policyname = 'grid_board_posts_self_insert') then
    create policy grid_board_posts_self_insert on public.grid_board_posts
      for insert to authenticated with check (author_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'grid_board_replies' and policyname = 'grid_board_replies_self_insert') then
    create policy grid_board_replies_self_insert on public.grid_board_replies
      for insert to authenticated with check (author_id = auth.uid());
  end if;
  -- Authors can delete their own posts/replies.
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'grid_board_posts' and policyname = 'grid_board_posts_self_delete') then
    create policy grid_board_posts_self_delete on public.grid_board_posts
      for delete to authenticated using (author_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'grid_board_replies' and policyname = 'grid_board_replies_self_delete') then
    create policy grid_board_replies_self_delete on public.grid_board_replies
      for delete to authenticated using (author_id = auth.uid());
  end if;
end $$;

-- Grants: read for anon + authenticated; writes for authenticated only.
-- Deliberately NO TRUNCATE/REFERENCES/TRIGGER grants (cf. Phase 0 finding:
-- live tables hand anon+authenticated all 7 privileges incl. TRUNCATE).
grant select on public.grid_board_posts, public.grid_board_replies to anon, authenticated;
grant insert, update, delete on public.grid_board_posts, public.grid_board_replies to authenticated;
