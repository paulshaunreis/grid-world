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
  select * into v_existing from public.grid_build_regions
    where grid_build_regions.world_id=p_world_id and grid_build_regions.region_id=p_region_id for update;
  if not found then
    insert into public.grid_build_regions(world_id,region_id,owner_user_id,access_mode)
    values(p_world_id,p_region_id,v_uid,p_access_mode) returning * into v_existing;
  end if;
  return query select v_existing.world_id,v_existing.region_id,v_existing.owner_user_id,v_existing.access_mode;
end;
$$;
revoke all on function public.grid_build_claim_region(text,text,text) from public, anon;
grant execute on function public.grid_build_claim_region(text,text,text) to authenticated;
