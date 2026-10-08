-- Conversation lifecycle audit integration.
-- Every authoritative conversation mutation records an immutable evidence event.

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
  if v_user is null then raise exception 'authentication_required'; end if;
  if p_kind not in ('direct','group') then raise exception 'invalid_conversation_kind'; end if;
  if p_title is not null and length(trim(p_title)) > 200 then raise exception 'conversation_title_too_long'; end if;

  insert into public.grid_conversations(kind,created_by_user_id,title,metadata)
  values (p_kind,v_user,nullif(trim(p_title),''),coalesce(p_metadata,'{}'::jsonb))
  returning * into v_conversation;

  insert into public.grid_conversation_participants(conversation_id,user_id,role)
  values (v_conversation.id,v_user,'owner');

  perform private.grid_record_audit_event(
    v_user,'user','conversation_member','conversation.create',
    'grid_conversation',v_conversation.id::text,'success','info',
    'conversation created by authenticated owner',null,'conversation_authority',
    null,jsonb_build_object('kind',p_kind),null,
    to_jsonb(v_conversation),p_metadata
  );

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
    where p.conversation_id=p_conversation_id and p.user_id=v_actor
      and p.role='owner' and p.state='active'
  ) then raise exception 'conversation_owner_required'; end if;
  if not exists (select 1 from auth.users u where u.id=p_user_id) then raise exception 'participant_not_found'; end if;

  insert into public.grid_conversation_participants(conversation_id,user_id,role,state)
  values (p_conversation_id,p_user_id,'member','active')
  on conflict (conversation_id,user_id) do update set state='active',left_at=null
  returning * into v_participant;

  perform private.grid_record_audit_event(
    v_actor,'user','conversation_owner','conversation.participant.add',
    'grid_conversation',p_conversation_id::text,'success','info',
    'participant added by active owner',null,'conversation_authority',
    null,jsonb_build_object('participant_user_id',p_user_id),null,
    to_jsonb(v_participant),'{}'::jsonb
  );

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
  if length(trim(coalesce(p_body,'')))=0 or length(p_body)>10000 then raise exception 'invalid_message_body'; end if;
  if p_content_rating not in ('E','CHILD','TEEN','ADULT','GRAPHIC','RESTRICTED') then raise exception 'invalid_content_rating'; end if;
  if not exists (
    select 1 from public.grid_conversation_participants p
    where p.conversation_id=p_conversation_id and p.user_id=v_user and p.state='active'
  ) then raise exception 'active_conversation_participant_required'; end if;

  insert into public.grid_messages(conversation_id,sender_user_id,client_message_id,body,content_rating,provenance)
  values (p_conversation_id,v_user,p_client_message_id,p_body,p_content_rating,coalesce(p_provenance,'{}'::jsonb))
  on conflict (sender_user_id,client_message_id) do update set id=grid_messages.id
  returning * into v_message;

  update public.grid_conversations
  set updated_at=now(),last_message_at=v_message.created_at
  where id=p_conversation_id;

  perform private.grid_record_audit_event(
    v_user,'user','conversation_member','message.send',
    'grid_message',v_message.id::text,'success','info',
    'message accepted by server-authoritative conversation writer',null,'conversation_authority',
    null,jsonb_build_object('conversation_id',p_conversation_id,'content_rating',p_content_rating),
    null,null,p_provenance
  );

  return v_message;
end;
$$;
