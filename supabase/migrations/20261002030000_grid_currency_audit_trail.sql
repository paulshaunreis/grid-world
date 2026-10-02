create or replace function public.grid_bazaar_buy(p_listing_id uuid, p_amount integer)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  uid uuid := auth.uid();
  l record;
  total numeric;
  tx uuid;
begin
  if uid is null then raise exception 'unauthorized'; end if;
  if p_amount<=0 or p_amount>1000 then raise exception 'invalid_amount'; end if;
  select * into l from public.grid_bazaar_listings where id=p_listing_id and status='ACTIVE' for update;
  if not found or l.remaining<p_amount then raise exception 'listing_unavailable'; end if;
  if l.seller_type='USER' and l.seller_user_id=uid then raise exception 'self_purchase'; end if;
  total:=round(l.unit_price*p_amount,2);
  update public.grid_wallets set balance=balance-total,updated_at=now()
    where user_id=uid and currency_id=l.currency_id and balance>=total;
  if not found then raise exception 'insufficient_funds'; end if;
  update public.grid_bazaar_listings set remaining=remaining-p_amount,
    status=case when remaining-p_amount=0 then 'SOLD_OUT' else 'ACTIVE' end,updated_at=now()
    where id=l.id;
  insert into public.grid_ledger_transactions(idempotency_key,actor_user_id,transaction_type,status,memo,metadata)
    values('bazaar-buy:'||uid::text||':'||l.id::text||':'||clock_timestamp()::text,uid,
      case when l.seller_type='USER' then 'USER_BAZAAR_PURCHASE' else 'NPC_BAZAAR_PURCHASE' end,
      'posted','Grid Bazaar purchase',
      jsonb_build_object('listing_id',l.id,'seller_type',l.seller_type,'seller_user_id',l.seller_user_id,
        'seller_npc_id',l.seller_npc_id,'item',l.item_id,'amount',p_amount,'unit_price',l.unit_price,
        'total',total,'currency_id',l.currency_id)) returning id into tx;
  insert into public.grid_ledger_entries(transaction_id,user_id,currency_id,amount)
    values(tx,uid,l.currency_id,-total);
  if l.seller_type='USER' then
    insert into public.grid_wallets(user_id,currency_id,balance,updated_at)
      values(l.seller_user_id,l.currency_id,total,now())
      on conflict(user_id,currency_id) do update set balance=public.grid_wallets.balance+excluded.balance,updated_at=now();
    insert into public.grid_ledger_entries(transaction_id,user_id,currency_id,amount)
      values(tx,l.seller_user_id,l.currency_id,total);
  end if;
  if l.item_id like 'GRID_%' then
    insert into public.grid_mineral_inventory(user_id,mineral_kind,amount) values(uid,l.item_id,p_amount)
      on conflict(user_id,mineral_kind) do update set amount=public.grid_mineral_inventory.amount+excluded.amount;
    insert into public.grid_vault_inventory(user_id,item_id,quantity,mined_quantity) values(uid,l.item_id,p_amount,0)
      on conflict(user_id,item_id) do update set quantity=public.grid_vault_inventory.quantity+excluded.quantity,updated_at=now();
  else
    insert into public.grid_player_inventory(user_id,item_id,quantity,updated_at) values(uid,l.item_id,p_amount,now())
      on conflict(user_id,item_id) do update set quantity=public.grid_player_inventory.quantity+excluded.quantity,updated_at=now();
  end if;
  return jsonb_build_object('ok',true,'listing_id',l.id,'item_id',l.item_id,'amount',p_amount,'total',total,
    'currency_id',l.currency_id,'seller_type',l.seller_type,'seller_npc_id',l.seller_npc_id,
    'seller_user_id',l.seller_user_id,'transaction_id',tx);
end;
$function$;

create or replace function public.grid_claim_starter_currency()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare uid uuid:=auth.uid(); reserve numeric; cap numeric; issued numeric; starter numeric; policy_cap numeric; tx uuid;
begin
  if uid is null then raise exception 'unauthorized'; end if;
  if not exists(select 1 from public.profiles where id=uid and onboarding_complete=true) then raise exception 'onboarding_incomplete'; end if;
  if exists(select 1 from public.grid_omni_bank_issuance where user_id=uid and reason='STARTER_GRANT')
    then return jsonb_build_object('ok',true,'granted',false,'reason','already_claimed'); end if;
  select starter_grant,reserve_cap into starter,policy_cap from public.grid_economy_monetary_policy where id=true;
  select reserve_balance,issuance_cap,lifetime_issued into reserve,cap,issued from public.grid_omni_bank_reserves where currency_id='grid' for update;
  if reserve<starter or issued+starter>least(cap,policy_cap) then raise exception 'starter_fund_limit_reached'; end if;
  insert into public.grid_wallets(user_id,currency_id,balance,updated_at) values(uid,'grid',starter,now())
    on conflict(user_id,currency_id) do update set balance=public.grid_wallets.balance+excluded.balance,updated_at=now();
  insert into public.grid_player_inventory(user_id,item_id,quantity,updated_at) values
    (uid,'GRID_COMPASS',1,now()),(uid,'GRID_MATTER_TOOL',1,now()),(uid,'GRID_SEED_PACK',5,now()),(uid,'GRID_RATION',3,now())
    on conflict(user_id,item_id) do update set quantity=public.grid_player_inventory.quantity+excluded.quantity,updated_at=now();
  update public.grid_omni_bank_reserves set reserve_balance=reserve_balance-starter,lifetime_issued=lifetime_issued+starter,updated_at=now()
    where currency_id='grid';
  insert into public.grid_omni_bank_issuance(user_id,currency_id,amount,reason,idempotency_key)
    values(uid,'grid',starter,'STARTER_GRANT','starter:'||uid::text);
  insert into public.grid_ledger_transactions(idempotency_key,actor_user_id,transaction_type,status,memo,metadata)
    values('starter-grant:'||uid::text,uid,'OMNI_BANK_STARTER_GRANT','posted','One-time Omni Bank starter grant',
      jsonb_build_object('source','omni_bank','currency','grid','amount',starter,
        'starter_inventory',jsonb_build_object('GRID_COMPASS',1,'GRID_MATTER_TOOL',1,'GRID_SEED_PACK',5,'GRID_RATION',3))) returning id into tx;
  insert into public.grid_ledger_entries(transaction_id,user_id,currency_id,amount) values(tx,uid,'grid',starter);
  return jsonb_build_object('ok',true,'granted',true,'currency_id','grid','amount',starter,
    'remaining_reserve',reserve-starter,'transaction_id',tx,
    'starter_inventory',jsonb_build_object('GRID_COMPASS',1,'GRID_MATTER_TOOL',1,'GRID_SEED_PACK',5,'GRID_RATION',3));
end;
$function$;