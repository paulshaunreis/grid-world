-- Grid World general audit and evidence foundation.
-- This is accountability history, not a financial ledger or analytics stream.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.grid_audit_events (
  id uuid primary key default gen_random_uuid(),
  occurred_at timestamptz not null default now(),
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_type text not null check (actor_type in ('user','ai_worker','service','system','anonymous')),
  authority text not null default 'none',
  action text not null,
  target_type text,
  target_id text,
  outcome text not null check (outcome in ('success','denied','failed','degraded','observed')),
  severity text not null default 'info' check (severity in ('info','notice','warning','critical')),
  reason text not null default '',
  policy_ref text,
  source text not null,
  request_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  before_state jsonb,
  after_state jsonb,
  provenance jsonb not null default '{}'::jsonb,
  event_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists grid_audit_events_occurred_at_idx on public.grid_audit_events (occurred_at desc);
create index if not exists grid_audit_events_actor_idx on public.grid_audit_events (actor_user_id, occurred_at desc);
create index if not exists grid_audit_events_target_idx on public.grid_audit_events (target_type, target_id, occurred_at desc);
create index if not exists grid_audit_events_request_idx on public.grid_audit_events (request_id) where request_id is not null;

alter table public.grid_audit_events enable row level security;
revoke all on public.grid_audit_events from anon, authenticated;

create or replace function public.grid_audit_event_hash(
  p_occurred_at timestamptz,
  p_actor_user_id uuid,
  p_actor_type text,
  p_authority text,
  p_action text,
  p_target_type text,
  p_target_id text,
  p_outcome text,
  p_severity text,
  p_reason text,
  p_policy_ref text,
  p_source text,
  p_request_id uuid,
  p_metadata jsonb,
  p_before_state jsonb,
  p_after_state jsonb,
  p_provenance jsonb
)
returns text
language sql
immutable
set search_path = ''
as $function$
  select encode(
    extensions.digest(
      convert_to(
        jsonb_build_object(
          'occurred_at', p_occurred_at,
          'actor_user_id', p_actor_user_id,
          'actor_type', p_actor_type,
          'authority', p_authority,
          'action', p_action,
          'target_type', p_target_type,
          'target_id', p_target_id,
          'outcome', p_outcome,
          'severity', p_severity,
          'reason', p_reason,
          'policy_ref', p_policy_ref,
          'source', p_source,
          'request_id', p_request_id,
          'metadata', p_metadata,
          'before_state', p_before_state,
          'after_state', p_after_state,
          'provenance', p_provenance
        )::text,
        'utf8'
      ),
      'sha256'
    ),
    'hex'
  );
$function$;

create or replace function public.grid_record_audit_event(
  p_actor_type text,
  p_authority text,
  p_action text,
  p_target_type text default null,
  p_target_id text default null,
  p_outcome text default 'observed',
  p_severity text default 'info',
  p_reason text default '',
  p_policy_ref text default null,
  p_source text default 'server',
  p_request_id uuid default null,
  p_metadata jsonb default '{}'::jsonb,
  p_before_state jsonb default null,
  p_after_state jsonb default null,
  p_provenance jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_actor_user_id uuid := auth.uid();
  v_id uuid;
  v_occurred_at timestamptz := now();
  v_hash text;
begin
  if auth.role() not in ('authenticated','service_role') then raise exception 'unauthorized'; end if;
  if p_actor_type not in ('user','ai_worker','service','system','anonymous') then raise exception 'invalid_actor_type'; end if;
  if p_actor_type = 'user' and v_actor_user_id is null then raise exception 'user_actor_requires_authenticated_user'; end if;
  if p_actor_type <> 'user' and auth.role() <> 'service_role' then raise exception 'trusted_actor_requires_service_role'; end if;
  if p_source = '' then raise exception 'source_required'; end if;

  v_hash := public.grid_audit_event_hash(
    v_occurred_at, v_actor_user_id, p_actor_type, p_authority, p_action,
    p_target_type, p_target_id, p_outcome, p_severity, p_reason, p_policy_ref,
    p_source, p_request_id, p_metadata, p_before_state, p_after_state, p_provenance
  );

  insert into public.grid_audit_events (
    occurred_at, actor_user_id, actor_type, authority, action, target_type, target_id,
    outcome, severity, reason, policy_ref, source, request_id, metadata,
    before_state, after_state, provenance, event_hash
  )
  values (
    v_occurred_at, v_actor_user_id, p_actor_type, p_authority, p_action, p_target_type, p_target_id,
    p_outcome, p_severity, p_reason, p_policy_ref, p_source, p_request_id, p_metadata,
    p_before_state, p_after_state, p_provenance, v_hash
  )
  returning id into v_id;

  return v_id;
end;
$function$;

revoke all on function public.grid_record_audit_event(
  text,text,text,text,text,text,text,text,text,text,uuid,jsonb,jsonb,jsonb
) from public, anon, authenticated;
grant execute on function public.grid_record_audit_event(
  text,text,text,text,text,text,text,text,text,text,uuid,jsonb,jsonb,jsonb
) to authenticated, service_role;

create or replace function public.grid_audit_events_are_immutable()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  raise exception 'audit_events_are_immutable';
end;
$function$;

drop trigger if exists grid_audit_events_immutable on public.grid_audit_events;
create trigger grid_audit_events_immutable
before update or delete on public.grid_audit_events
for each row execute function public.grid_audit_events_are_immutable();