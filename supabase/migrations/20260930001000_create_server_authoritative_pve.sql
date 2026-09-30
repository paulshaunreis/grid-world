create table if not exists public.grid_creature_combat_state (
  creature_id text primary key,
  species text not null,
  world text not null,
  x double precision not null,
  y double precision not null,
  z double precision not null,
  health double precision not null default 100,
  max_health double precision not null default 100,
  last_attack_at timestamptz,
  respawn_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.grid_creature_combat_state enable row level security;
drop policy if exists "creature combat public read" on public.grid_creature_combat_state;
drop policy if exists "creature combat client write" on public.grid_creature_combat_state;
create policy "creature combat public read" on public.grid_creature_combat_state for select using (true);
create index if not exists grid_creature_combat_world_idx on public.grid_creature_combat_state(world);
create index if not exists grid_creature_combat_updated_idx on public.grid_creature_combat_state(updated_at);

alter table public.grid_combat_state add column if not exists last_pve_attack_at timestamptz;