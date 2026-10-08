-- GridWorld team feed: daily posts from team members (Paul's request 2026-10-08)
-- Replaces the hardcoded mock posts array in site.ts with live data.
-- Each of the 24 team members contributes on rotation.

create table if not exists public.grid_team_posts (
  id uuid primary key default gen_random_uuid(),
  -- Team member id from TEAM_AVATARS (e.g. 'aurora', 'link', 'rey')
  author_id text not null,
  author_name text not null,
  author_role text not null,
  region text,
  tag text not null,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

alter table public.grid_team_posts enable row level security;

-- Public read: the site feed is visible to everyone.
drop policy if exists "team posts public read" on public.grid_team_posts;
create policy "team posts public read"
  on public.grid_team_posts for select
  to anon, authenticated
  using (true);

-- Only service role can write (posts go through the daily rotation job).
-- No insert/update/delete policies for anon/authenticated.

create index if not exists grid_team_posts_created_idx on public.grid_team_posts(created_at desc);
create index if not exists grid_team_posts_author_idx on public.grid_team_posts(author_id, created_at desc);
