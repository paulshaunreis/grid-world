create extension if not exists pgcrypto with schema extensions;

create table public.grid_conversations (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('direct','group')),
  created_by_user_id uuid not null references auth.users(id) on delete restrict,
  title text,
  state text not null default 'active' check (state in ('active','archived','closed')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_message_at timestamptz
);

create table public.grid_conversation_participants (
  conversation_id uuid not null references public.grid_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','member')),
  state text not null default 'active' check (state in ('active','left','removed')),
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  muted_until timestamptz,
  primary key (conversation_id,user_id)
);

create table public.grid_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.grid_conversations(id) on delete cascade,
  sender_user_id uuid not null references auth.users(id) on delete restrict,
  client_message_id uuid not null,
  body text not null check (length(trim(body)) between 1 and 10000),
  content_rating text not null default 'E'
    check (content_rating in ('E','CHILD','TEEN','ADULT','GRAPHIC','RESTRICTED')),
  state text not null default 'active'
    check (state in ('active','edited','deleted','moderated')),
  provenance jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  deleted_at timestamptz,
  unique (sender_user_id,client_message_id)
);

create index grid_conversations_created_by_idx
  on public.grid_conversations(created_by_user_id);
create index grid_conversation_participants_user_idx
  on public.grid_conversation_participants(user_id,state);
create index grid_messages_conversation_created_idx
  on public.grid_messages(conversation_id,created_at);
create index grid_messages_sender_idx
  on public.grid_messages(sender_user_id,created_at);

alter table public.grid_conversations enable row level security;
alter table public.grid_conversation_participants enable row level security;
alter table public.grid_messages enable row level security;

create policy "conversation members can read conversations"
on public.grid_conversations for select
using (
  exists (
    select 1 from public.grid_conversation_participants p
    where p.conversation_id = grid_conversations.id
      and p.user_id = auth.uid()
      and p.state = 'active'
  )
);

create policy "conversation members can read participants"
on public.grid_conversation_participants for select
using (
  exists (
    select 1 from public.grid_conversation_participants me
    where me.conversation_id = grid_conversation_participants.conversation_id
      and me.user_id = auth.uid()
      and me.state = 'active'
  )
);

create policy "conversation members can read messages"
on public.grid_messages for select
using (
  exists (
    select 1 from public.grid_conversation_participants p
    where p.conversation_id = grid_messages.conversation_id
      and p.user_id = auth.uid()
      and p.state = 'active'
  )
);

revoke insert, update, delete on public.grid_conversations from anon, authenticated;
revoke insert, update, delete on public.grid_conversation_participants from anon, authenticated;
revoke insert, update, delete on public.grid_messages from anon, authenticated;

create or replace function public.grid_conversation_create(
  p_kind text default 'direct',
  p_title text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns public.grid_conversations
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_conversation public.grid_conversations;
begin
  if v_user is null then
    raise exception 'authentication_required';
  end if;
  if p_kind not in ('direct','group') then
    raise exception 'invalid_conversation_kind';
  end if;
  if p_title is not null and length(trim(p_title)) > 200 then
    raise exception 'conversation_title_too_long';
  end if;

  insert into public.grid_conversations(kind,created_by_user_id,title,metadata)
  values (p_kind,v_user,nullif(trim(p_title),''),coalesce(p_metadata,'{}'::jsonb))
  returning * into v_conversation;

  insert into public.grid_conversation_participants(conversation_id,user_id,role)
  values (v_conversation.id,v_user,'owner');

  return v_conversation;
end;
$$;

create or replace function public.grid_conversation_add_participant(
  p_conversation_id uuid,
  p_user_id uuid
)
returns public.grid_conversation_participants
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_participant public.grid_conversation_participants;
begin
  if v_actor is null then raise exception 'authentication_required'; end if;
  if not exists (
    select 1 from public.grid_conversation_participants p
    where p.conversation_id=p_conversation_id
      and p.user_id=v_actor
      and p.role='owner'
      and p.state='active'
  ) then
    raise exception 'conversation_owner_required';
  end if;
  if not exists (select 1 from auth.users u where u.id=p_user_id) then
    raise exception 'participant_not_found';
  end if;

  insert into public.grid_conversation_participants(conversation_id,user_id,role,state)
  values (p_conversation_id,p_user_id,'member','active')
  on conflict (conversation_id,user_id) do update
    set state='active', left_at=null
  returning * into v_participant;

  return v_participant;
end;
$$;

create or replace function public.grid_message_send(
  p_conversation_id uuid,
  p_client_message_id uuid,
  p_body text,
  p_content_rating text default 'E',
  p_provenance jsonb default '{}'::jsonb
)
returns public.grid_messages
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_message public.grid_messages;
begin
  if v_user is null then raise exception 'authentication_required'; end if;
  if length(trim(coalesce(p_body,''))) = 0 or length(p_body) > 10000 then
    raise exception 'invalid_message_body';
  end if;
  if p_content_rating not in ('E','CHILD','TEEN','ADULT','GRAPHIC','RESTRICTED') then
    raise exception 'invalid_content_rating';
  end if;
  if not exists (
    select 1 from public.grid_conversation_participants p
    where p.conversation_id=p_conversation_id
      and p.user_id=v_user
      and p.state='active'
  ) then
    raise exception 'active_conversation_participant_required';
  end if;

  insert into public.grid_messages(
    conversation_id,sender_user_id,client_message_id,body,content_rating,provenance
  )
  values (
    p_conversation_id,v_user,p_client_message_id,p_body,p_content_rating,
    coalesce(p_provenance,'{}'::jsonb)
  )
  on conflict (sender_user_id,client_message_id) do update
    set id=grid_messages.id
  returning * into v_message;

  update public.grid_conversations
  set updated_at=now(), last_message_at=v_message.created_at
  where id=p_conversation_id;

  return v_message;
end;
$$;

revoke all on function public.grid_conversation_create(text,text,jsonb) from public, anon;
revoke all on function public.grid_conversation_add_participant(uuid,uuid) from public, anon;
revoke all on function public.grid_message_send(uuid,uuid,text,text,jsonb) from public, anon;
grant execute on function public.grid_conversation_create(text,text,jsonb) to authenticated;
grant execute on function public.grid_conversation_add_participant(uuid,uuid) to authenticated;
grant execute on function public.grid_message_send(uuid,uuid,text,text,jsonb) to authenticated;
