alter table public.grid_bazaar_listings
  add column if not exists item_name text not null default '',
  add column if not exists category text not null default 'UNKNOWN',
  add column if not exists quality numeric,
  add column if not exists art_key text not null default '',
  add column if not exists model_key text not null default '',
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create or replace function public.grid_bazaar_create_listing(
  p_world text, p_item_id text, p_quantity integer, p_currency_id text, p_unit_price numeric
)
returns jsonb language plpgsql security definer set search_path=''
as $function$
declare uid uuid:=auth.uid(); available numeric; listing uuid; display_name text; category text; slug text;
begin
 if uid is null then raise exception 'unauthorized'; end if;
 if p_quantity<=0 or p_quantity>10000 or p_unit_price<=0 or length(p_item_id)=0 or length(p_world)=0 then raise exception 'invalid_listing'; end if;
 if p_item_id like 'GRID_%' then
   select amount into available from public.grid_mineral_inventory where user_id=uid and mineral_kind=p_item_id for update;
   if coalesce(available,0)<p_quantity then raise exception 'insufficient_materials'; end if;
   update public.grid_mineral_inventory set amount=amount-p_quantity where user_id=uid and mineral_kind=p_item_id;
   update public.grid_vault_inventory set quantity=greatest(0,quantity-p_quantity),updated_at=now()
     where user_id=uid and item_id=p_item_id and quantity>=p_quantity;
 else
   select quantity into available from public.grid_player_inventory where user_id=uid and item_id=p_item_id for update;
   if coalesce(available,0)<p_quantity then raise exception 'insufficient_materials'; end if;
   update public.grid_player_inventory set quantity=quantity-p_quantity,updated_at=now() where user_id=uid and item_id=p_item_id;
 end if;
 display_name:=initcap(replace(lower(p_item_id),'_',' '));
 category:=case
   when p_item_id ilike 'GRID_%' then 'RESOURCE'
   when p_item_id ilike '%FOOD%' or p_item_id in ('GRID_RATION','FRESH_HARVEST') then 'FOOD'
   when p_item_id ilike '%TOOL%' then 'TOOL'
   when p_item_id ilike '%QUEST%' then 'QUEST'
   when p_item_id ilike '%BLUEPRINT%' then 'BLUEPRINT'
   else 'MATERIAL'
 end;
 slug:=lower(regexp_replace(p_item_id,'[^a-zA-Z0-9]+','-','g'));
 insert into public.grid_bazaar_listings(
   seller_type,seller_user_id,world_id,item_id,quantity,remaining,currency_id,unit_price,
   item_name,category,art_key,model_key,metadata
 ) values(
   'USER',uid,p_world,p_item_id,p_quantity,p_quantity,p_currency_id,p_unit_price,
   display_name,category,'marketplace/item/'||slug,'marketplace/model/'||slug,
   jsonb_build_object('item_id',p_item_id,'category',category,'art_key','marketplace/item/'||slug,'model_key','marketplace/model/'||slug)
 ) returning id into listing;
 return jsonb_build_object('ok',true,'listing_id',listing,'item_id',p_item_id,'item_name',display_name,
   'category',category,'art_key','marketplace/item/'||slug,'model_key','marketplace/model/'||slug);
end;
$function$;
