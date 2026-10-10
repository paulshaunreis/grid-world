create or replace function public.grid_message_edit(p_message_id uuid,p_body text)
returns public.grid_messages language plpgsql security definer set search_path=''
as $$
declare v_user uuid:=auth.uid(); v_old public.grid_messages; v_new public.grid_messages;
begin
 if v_user is null then raise exception 'authentication_required'; end if;
 if length(trim(coalesce(p_body,'')))=0 or length(p_body)>10000 then raise exception 'invalid_message_body'; end if;
 select * into v_old from public.grid_messages where id=p_message_id for update;
 if v_old.id is null then raise exception 'message_not_found'; end if;
 if v_old.sender_user_id<>v_user then raise exception 'message_owner_required'; end if;
 if v_old.state not in ('active','edited') then raise exception 'message_not_editable'; end if;
 update public.grid_messages set body=p_body,state='edited',edited_at=now() where id=p_message_id returning * into v_new;
 perform private.grid_record_audit_event(v_user,'user','conversation_member','message.edit','grid_message',p_message_id::text,'success','info','message edited by sender',to_jsonb(v_old),'conversation_authority',null,null,to_jsonb(v_old),to_jsonb(v_new),v_new.provenance);
 return v_new;
end; $$;

create or replace function public.grid_message_delete(p_message_id uuid)
returns public.grid_messages language plpgsql security definer set search_path=''
as $$
declare v_user uuid:=auth.uid(); v_old public.grid_messages; v_new public.grid_messages;
begin
 if v_user is null then raise exception 'authentication_required'; end if;
 select * into v_old from public.grid_messages where id=p_message_id for update;
 if v_old.id is null then raise exception 'message_not_found'; end if;
 if v_old.sender_user_id<>v_user then raise exception 'message_owner_required'; end if;
 if v_old.state='deleted' then return v_old; end if;
 update public.grid_messages set state='deleted',deleted_at=now(),body='[deleted]' where id=p_message_id returning * into v_new;
 perform private.grid_record_audit_event(v_user,'user','conversation_member','message.delete','grid_message',p_message_id::text,'success','info','message deleted by sender',to_jsonb(v_old),'conversation_authority',null,null,to_jsonb(v_old),to_jsonb(v_new),v_new.provenance);
 return v_new;
end; $$;

create or replace function public.grid_conversation_leave(p_conversation_id uuid)
returns public.grid_conversation_participants language plpgsql security definer set search_path=''
as $$
declare v_user uuid:=auth.uid(); v_old public.grid_conversation_participants; v_new public.grid_conversation_participants;
begin
 if v_user is null then raise exception 'authentication_required'; end if;
 select * into v_old from public.grid_conversation_participants where conversation_id=p_conversation_id and user_id=v_user for update;
 if v_old.user_id is null then raise exception 'participant_not_found'; end if;
 if v_old.state<>'active' then return v_old; end if;
 if v_old.role='owner' then raise exception 'owner_transfer_required'; end if;
 update public.grid_conversation_participants set state='left',left_at=now() where conversation_id=p_conversation_id and user_id=v_user returning * into v_new;
 perform private.grid_record_audit_event(v_user,'user','conversation_member','conversation.leave','grid_conversation',p_conversation_id::text,'success','info','participant left conversation',to_jsonb(v_old),'conversation_authority',null,null,to_jsonb(v_old),to_jsonb(v_new),'{}'::jsonb);
 return v_new;
end; $$;

create or replace function public.grid_conversation_remove_participant(p_conversation_id uuid,p_user_id uuid)
returns public.grid_conversation_participants language plpgsql security definer set search_path=''
as $$
declare v_actor uuid:=auth.uid(); v_old public.grid_conversation_participants; v_new public.grid_conversation_participants;
begin
 if v_actor is null then raise exception 'authentication_required'; end if;
 if not exists(select 1 from public.grid_conversation_participants where conversation_id=p_conversation_id and user_id=v_actor and role='owner' and state='active') then raise exception 'conversation_owner_required'; end if;
 select * into v_old from public.grid_conversation_participants where conversation_id=p_conversation_id and user_id=p_user_id for update;
 if v_old.user_id is null then raise exception 'participant_not_found'; end if;
 if v_old.role='owner' then raise exception 'owner_cannot_be_removed'; end if;
 update public.grid_conversation_participants set state='removed',left_at=coalesce(left_at,now()) where conversation_id=p_conversation_id and user_id=p_user_id returning * into v_new;
 perform private.grid_record_audit_event(v_actor,'user','conversation_owner','conversation.participant.remove','grid_conversation',p_conversation_id::text,'success','warning','participant removed by active owner',to_jsonb(v_old),'conversation_authority',null,jsonb_build_object('participant_user_id',p_user_id),to_jsonb(v_old),to_jsonb(v_new),'{}'::jsonb);
 return v_new;
end; $$;

create or replace function public.grid_message_moderate(p_message_id uuid,p_new_state text,p_reason text)
returns public.grid_messages language plpgsql security definer set search_path=''
as $$
declare v_actor uuid:=auth.uid(); v_old public.grid_messages; v_new public.grid_messages;
begin
 if v_actor is null then raise exception 'authentication_required'; end if;
 if p_new_state not in ('active','moderated') then raise exception 'invalid_moderation_state'; end if;
 if length(trim(coalesce(p_reason,'')))=0 or length(p_reason)>1000 then raise exception 'moderation_reason_required'; end if;
 if not exists(select 1 from public.grid_conversation_participants where conversation_id=(select conversation_id from public.grid_messages where id=p_message_id) and user_id=v_actor and role='owner' and state='active') then raise exception 'conversation_owner_required'; end if;
 select * into v_old from public.grid_messages where id=p_message_id for update;
 if v_old.id is null then raise exception 'message_not_found'; end if;
 update public.grid_messages set state=p_new_state where id=p_message_id returning * into v_new;
 perform private.grid_record_audit_event(v_actor,'user','conversation_owner','message.moderate','grid_message',p_message_id::text,'success','warning',p_reason,to_jsonb(v_old),'conversation_authority',null,jsonb_build_object('reason',p_reason),to_jsonb(v_old),to_jsonb(v_new),v_new.provenance);
 return v_new;
end; $$;

revoke all on function public.grid_message_edit(uuid,text) from public,anon;
revoke all on function public.grid_message_delete(uuid) from public,anon;
revoke all on function public.grid_conversation_leave(uuid) from public,anon;
revoke all on function public.grid_conversation_remove_participant(uuid,uuid) from public,anon;
revoke all on function public.grid_message_moderate(uuid,text,text) from public,anon;
grant execute on function public.grid_message_edit(uuid,text) to authenticated;
grant execute on function public.grid_message_delete(uuid) to authenticated;
grant execute on function public.grid_conversation_leave(uuid) to authenticated;
grant execute on function public.grid_conversation_remove_participant(uuid,uuid) to authenticated;
grant execute on function public.grid_message_moderate(uuid,text,text) to authenticated;
