import type { SupabaseClient } from '@supabase/supabase-js';

/** Row shape returned by public.grid_messages lifecycle RPCs. */
export interface GridMessageLifecycleRecord {
  id: string;
  conversation_id: string;
  sender_user_id: string;
  client_message_id: string;
  body: string;
  content_rating: 'E' | 'CHILD' | 'TEEN' | 'ADULT' | 'GRAPHIC' | 'RESTRICTED';
  state: 'active' | 'edited' | 'deleted' | 'moderated';
  provenance: Record<string, unknown>;
  created_at: string;
  edited_at: string | null;
  deleted_at: string | null;
}

/** Row shape returned by public.grid_conversation_participants lifecycle RPCs. */
export interface GridConversationParticipantLifecycleRecord {
  conversation_id: string;
  user_id: string;
  role: 'owner' | 'member';
  state: 'active' | 'left' | 'removed';
  joined_at: string;
  left_at: string | null;
  muted_until: string | null;
}

function requireRow<T>(data: unknown, operation: string): T {
  const value = Array.isArray(data) ? data[0] : data;
  if (!value || typeof value !== 'object') {
    throw new Error(`Grid conversation lifecycle ${operation} returned no row.`);
  }
  return value as T;
}

/**
 * Typed client for server-authoritative conversation lifecycle RPCs.
 * Authorization remains inside the database functions; this wrapper is not
 * an authorization boundary and deliberately performs no direct table writes.
 */
export class GridConversationLifecycleAuthority {
  constructor(private readonly client: SupabaseClient) {}

  async editMessage(messageId: string, body: string): Promise<GridMessageLifecycleRecord> {
    const { data, error } = await this.client.rpc('grid_message_edit', {
      p_message_id: messageId,
      p_body: body,
    });
    if (error) throw error;
    return requireRow<GridMessageLifecycleRecord>(data, 'editMessage');
  }

  async deleteMessage(messageId: string): Promise<GridMessageLifecycleRecord> {
    const { data, error } = await this.client.rpc('grid_message_delete', {
      p_message_id: messageId,
    });
    if (error) throw error;
    return requireRow<GridMessageLifecycleRecord>(data, 'deleteMessage');
  }

  async leaveConversation(conversationId: string): Promise<GridConversationParticipantLifecycleRecord> {
    const { data, error } = await this.client.rpc('grid_conversation_leave', {
      p_conversation_id: conversationId,
    });
    if (error) throw error;
    return requireRow<GridConversationParticipantLifecycleRecord>(data, 'leaveConversation');
  }

  async removeParticipant(
    conversationId: string,
    userId: string,
  ): Promise<GridConversationParticipantLifecycleRecord> {
    const { data, error } = await this.client.rpc('grid_conversation_remove_participant', {
      p_conversation_id: conversationId,
      p_user_id: userId,
    });
    if (error) throw error;
    return requireRow<GridConversationParticipantLifecycleRecord>(data, 'removeParticipant');
  }

  async moderateMessage(
    messageId: string,
    state: 'active' | 'moderated',
    reason: string,
  ): Promise<GridMessageLifecycleRecord> {
    const { data, error } = await this.client.rpc('grid_message_moderate', {
      p_message_id: messageId,
      p_new_state: state,
      p_reason: reason,
    });
    if (error) throw error;
    return requireRow<GridMessageLifecycleRecord>(data, 'moderateMessage');
  }
}
