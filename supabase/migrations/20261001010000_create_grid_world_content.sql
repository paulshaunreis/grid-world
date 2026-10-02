create table public.grid_world_content (
  world_id text primary key references public.grid_worlds(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  builds jsonb not null default '[]'::jsonb,
  terrain jsonb not null default '[]'::jsonb,
  quests jsonb not null default '{}'::jsonb,
  consequences jsonb not null default '{}'::jsonb,
  npc_state jsonb not null default '[]'::jsonb,
  creature_state jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index grid_world_content_owner_idx on public.grid_world_content(owner_user_id);
alter table public.grid_world_content enable row level security;
create policy "grid world content public read" on public.grid_world_content for select using (exists (select 1 from public.grid_worlds w where w.id = grid_world_content.world_id and (w.enabled = true or w.owner_user_id = auth.uid())));
create policy "grid world content owner insert" on public.grid_world_content for insert with check (owner_user_id = auth.uid());
create policy "grid world content owner update" on public.grid_world_content for update using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
create policy "grid world content owner delete" on public.grid_world_content for delete using (owner_user_id = auth.uid());