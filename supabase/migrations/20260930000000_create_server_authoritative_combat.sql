create table if not exists public.grid_combat_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  region_id text not null default 'first-light',
  mode text not null default 'PVE' check (mode in ('PVE','PVP','SAFE')),
  x double precision not null default 0,
  y double precision not null default 0,
  z double precision not null default 0,
  yaw double precision not null default 0,
  health double precision not null default 100,
  max_health double precision not null default 100,
  last_attack_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.grid_combat_state enable row level security;
drop policy if exists "combat state self read" on public.grid_combat_state;
drop policy if exists "combat state self insert" on public.grid_combat_state;
drop policy if exists "combat state self update" on public.grid_combat_state;
create index if not exists grid_combat_state_region_idx on public.grid_combat_state(region_id);
create index if not exists grid_combat_state_updated_idx on public.grid_combat_state(updated_at);