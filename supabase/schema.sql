-- Grid World persistence foundation.
-- Apply this schema only to the connected Supabase project when one exists.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Traveler',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.player_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  region_id text not null default 'first-light',
  x double precision not null default 0,
  y double precision not null default 0,
  z double precision not null default 8,
  yaw double precision not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.player_state enable row level security;

create policy "Players can read their profile" on public.profiles for select to authenticated
using ((select auth.uid()) = id);
create policy "Players can insert their profile" on public.profiles for insert to authenticated
with check ((select auth.uid()) = id);
create policy "Players can update their profile" on public.profiles for update to authenticated
using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "Players can read their state" on public.player_state for select to authenticated
using ((select auth.uid()) = user_id);
create policy "Players can insert their state" on public.player_state for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy "Players can update their state" on public.player_state for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
