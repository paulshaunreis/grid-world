create table public.grid_world_player_state (
  world_id text not null references public.grid_worlds(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  quests jsonb not null default '{}'::jsonb,
  discoveries jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (world_id,user_id)
);
create index grid_world_player_state_user_idx on public.grid_world_player_state(user_id);
alter table public.grid_world_player_state enable row level security;
create policy "grid world player state own select" on public.grid_world_player_state for select to authenticated using ((select auth.uid()) = user_id);
create policy "grid world player state own insert" on public.grid_world_player_state for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "grid world player state own update" on public.grid_world_player_state for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "grid world player state own delete" on public.grid_world_player_state for delete to authenticated using ((select auth.uid()) = user_id);