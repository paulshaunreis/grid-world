create table if not exists public.grid_worlds (
  id text primary key,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  description text not null default '',
  center_x double precision not null default 0,
  center_y double precision not null default 0,
  center_z double precision not null default 0,
  color integer not null default 0,
  secondary integer not null default 0,
  resource_kind text,
  tags text[] not null default '{}',
  event text not null default 'quiet' check (event in ('quiet','tide','migration','market','bloom','aurora','storm')),
  gate_id text,
  enabled boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists grid_worlds_owner_created_idx on public.grid_worlds(owner_user_id, created_at desc);
create index if not exists grid_worlds_public_idx on public.grid_worlds(enabled, created_at desc);

alter table public.grid_worlds enable row level security;

create policy "Grid worlds are publicly readable when enabled"
on public.grid_worlds for select
using (enabled = true or owner_user_id = auth.uid());

create policy "Grid users can create their own worlds"
on public.grid_worlds for insert
with check (owner_user_id = auth.uid());

create policy "Grid users can update their own worlds"
on public.grid_worlds for update
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

create policy "Grid users can delete their own worlds"
on public.grid_worlds for delete
using (owner_user_id = auth.uid());

create or replace function public.grid_worlds_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger grid_worlds_touch_updated_at
before update on public.grid_worlds
for each row execute function public.grid_worlds_touch_updated_at();
