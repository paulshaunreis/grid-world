create table if not exists public.grid_player_inventory (
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null,
  quantity numeric not null default 0 check (quantity >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, item_id)
);
alter table public.grid_player_inventory enable row level security;
drop policy if exists "users can read own grid inventory" on public.grid_player_inventory;
create policy "users can read own grid inventory" on public.grid_player_inventory for select to authenticated using (auth.uid() = user_id);

create table if not exists public.grid_world_resource_state (
  node_id text primary key,
  world text not null,
  kind text not null,
  x double precision not null,
  z double precision not null,
  amount numeric not null default 100 check (amount >= 0),
  max_amount numeric not null default 100 check (max_amount >= 0),
  updated_at timestamptz not null default now()
);
alter table public.grid_world_resource_state enable row level security;
drop policy if exists "public can read world resource state" on public.grid_world_resource_state;
create policy "public can read world resource state" on public.grid_world_resource_state for select to anon, authenticated using (true);
insert into public.grid_world_resource_state(node_id,world,kind,x,z) values
('harbor-resource-0','HARBOR','TIDE_SALT',18,-24),('harbor-resource-1','HARBOR','TIDE_SALT',24,-27),('harbor-resource-2','HARBOR','TIDE_SALT',29,-20),('harbor-resource-3','HARBOR','TIDE_SALT',21,-17),
('gardens-resource-0','GARDENS','BLOOM_RESIN',17,18),('gardens-resource-1','GARDENS','BLOOM_RESIN',24,23),('gardens-resource-2','GARDENS','BLOOM_RESIN',29,14),('gardens-resource-3','GARDENS','BLOOM_RESIN',20,27),
('citadel-resource-0','CITADEL','CROWN_RELIC',-19,-23),('citadel-resource-1','CITADEL','CROWN_RELIC',-26,-19),('citadel-resource-2','CITADEL','CROWN_RELIC',-14,-27),('citadel-resource-3','CITADEL','CROWN_RELIC',-22,-15),
('arts-resource-0','ARTS','MUSE_INK',14,-17),('arts-resource-1','ARTS','MUSE_INK',20,-21),('arts-resource-2','ARTS','MUSE_INK',26,-15),('arts-resource-3','ARTS','MUSE_INK',18,-11),
('wilds-resource-0','WILDS','FRONTIER_ORE',-25,20),('wilds-resource-1','WILDS','FRONTIER_ORE',-18,25),('wilds-resource-2','WILDS','FRONTIER_ORE',-29,27),('wilds-resource-3','WILDS','FRONTIER_ORE',-21,15)
on conflict (node_id) do nothing;
create index if not exists grid_world_resource_kind_idx on public.grid_world_resource_state(kind);
