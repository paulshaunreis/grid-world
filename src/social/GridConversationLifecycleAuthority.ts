import type { SupabaseClient } from '@supabase/supabase-js';
import type { GridMessage, GridConversationParticipant } from './GridConversationAuthority';

export class GridConversationLifecycleAuthority {
  constructor(private readonly client: SupabaseClient) {}

  async editMessage(messageId: string, body: string): Promise<GridMessage> {
    const { data, error } = await this.client.rpc('grid_message_edit', {
      p_message_id: messageId, p_body: body,
    });
    if (error) throw error;
    return (Array.isArray(data) ? data[0] : data) as GridMessage;
  }

  async deleteMessage(messageId: string): Promise<GridMessage> {
    const { data, error } = await this.client.rpc('grid_message_delete', {
      p_message_id: messageId,
    });
    if (error) throw error;
    return (Array.isArray(data) ? data[0] : data) as GridMessage;
  }

  async leaveConversation(conversationId: string): Promise<GridConversationParticipant> {
    const { data, error } = await this.client.rpc('grid_conversation_leave', {
      p_conversation_id: conversationId,
    });
    if (error) throw error;
    return (Array.isArray(data) ? data[0] : data) as GridConversationParticipant;
  }

  async removeParticipant(conversationId: string, userId: string): Promise<GridConversationParticipant> {
    const { data, error } = await this.client.rpc('grid_conversation_remove_participant', {
      p_conversation_id: conversationId, p_user_id: userId,
    });
    if (error) throw error;
    return (Array.isArray(data) ? data[0] : data) as GridConversationParticipant;
  }

  async moderateMessage(messageId: string, state: 'active' | 'moderated', reason: string): Promise<GridMessage> {
    const { data, error } = await this.client.rpc('grid_message_moderate', {
      p_message_id: messageId, p_new_state: state, p_reason: reason,
    });
    if (error) throw error;
    return (Array.isArray(data) ? data[0] : data) as GridMessage;
  }
}
