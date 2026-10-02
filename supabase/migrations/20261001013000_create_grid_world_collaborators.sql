create table public.grid_world_collaborators (
  world_id text not null references public.grid_worlds(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('viewer','builder','editor','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (world_id,user_id)
);

create index grid_world_collaborators_user_idx on public.grid_world_collaborators(user_id);

alter table public.grid_world_collaborators enable row level security;

create policy "grid world collaborators visible to participants"
on public.grid_world_collaborators for select to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1 from public.grid_worlds w
    where w.id = grid_world_collaborators.world_id
      and w.owner_user_id = auth.uid()
  )
);

create policy "grid world owner manages collaborators"
on public.grid_world_collaborators for insert to authenticated
with check (
  exists (
    select 1 from public.grid_worlds w
    where w.id = grid_world_collaborators.world_id
      and w.owner_user_id = auth.uid()
  )
);

create policy "grid world owner updates collaborators"
on public.grid_world_collaborators for update to authenticated
using (
  exists (
    select 1 from public.grid_worlds w
    where w.id = grid_world_collaborators.world_id
      and w.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.grid_worlds w
    where w.id = grid_world_collaborators.world_id
      and w.owner_user_id = auth.uid()
  )
);

create policy "grid world owner removes collaborators"
on public.grid_world_collaborators for delete to authenticated
using (
  exists (
    select 1 from public.grid_worlds w
    where w.id = grid_world_collaborators.world_id
      and w.owner_user_id = auth.uid()
  )
);

drop policy if exists "grid world content owner insert" on public.grid_world_content;
drop policy if exists "grid world content owner update" on public.grid_world_content;

create policy "grid world content participant insert"
on public.grid_world_content for insert
with check (
  owner_user_id = auth.uid()
  or exists (
    select 1 from public.grid_world_collaborators c
    where c.world_id = grid_world_content.world_id
      and c.user_id = auth.uid()
      and c.role in ('builder','editor','admin')
  )
);

create policy "grid world content participant update"
on public.grid_world_content for update
using (
  owner_user_id = auth.uid()
  or exists (
    select 1 from public.grid_world_collaborators c
    where c.world_id = grid_world_content.world_id
      and c.user_id = auth.uid()
      and c.role in ('builder','editor','admin')
  )
)
with check (
  owner_user_id = auth.uid()
  or exists (
    select 1 from public.grid_world_collaborators c
    where c.world_id = grid_world_content.world_id
      and c.user_id = auth.uid()
      and c.role in ('builder','editor','admin')
  )
);