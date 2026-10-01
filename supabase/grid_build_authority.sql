-- Grid Build collaborative region authority
-- Applied to the connected Supabase project during the Grid World build.

create or replace function public.grid_build_claim_region(
  p_world_id text,
  p_region_id text,
  p_access_mode text default 'collaborative'
)
returns table(world_id text, region_id text, owner_user_id uuid, access_mode text)
language plpgsql security definer set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_existing public.grid_build_regions%rowtype;
begin
  if v_uid is null then raise exception 'authentication required'; end if;
  if nullif(trim(p_world_id),'') is null or nullif(trim(p_region_id),'') is null then raise exception 'world and region are required'; end if;
  if p_access_mode not in ('private','collaborative','public') then raise exception 'invalid access mode'; end if;
  insert into public.grid_build_regions(world_id,region_id,owner_user_id,access_mode)
  values(p_world_id,p_region_id,v_uid,p_access_mode)
  on conflict (world_id,region_id) do nothing;
  select * into v_existing from public.grid_build_regions
    where grid_build_regions.world_id=p_world_id and grid_build_regions.region_id=p_region_id;
  return query select v_existing.world_id,v_existing.region_id,v_existing.owner_user_id,v_existing.access_mode;
end;
$$;
revoke all on function public.grid_build_claim_region(text,text,text) from public, anon;
grant execute on function public.grid_build_claim_region(text,text,text) to authenticated;


-- Collaborative regions are readable by authenticated builders/visitors; mutation remains server-authorized.
drop policy if exists "build regions collaborative read" on public.grid_build_regions;
create policy "build regions collaborative read" on public.grid_build_regions for select to authenticated using (access_mode='collaborative');
drop policy if exists "grid builds collaborative read" on public.grid_build_objects;
create policy "grid builds collaborative read" on public.grid_build_objects for select to authenticated using (exists (select 1 from public.grid_build_regions r where r.world_id=grid_build_objects.world_id and r.region_id=grid_build_objects.region_id and r.access_mode='collaborative'));
