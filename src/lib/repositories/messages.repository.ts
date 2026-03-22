import { createClient } from '../supabase/server'
import { Database } from '../../types/database.types'

type ConversationRow = Database['public']['Tables']['conversations']['Row']
type MessageRow = Database['public']['Tables']['messages']['Row']

export type ConversationWithParticipants = ConversationRow & {
  other_participant: {
    anonymous_alias: string
  } | null
}

export type MessageWithSender = MessageRow & {
  sender: {
    anonymous_alias: string
  } | null
}

export async function getConversations(userId: string): Promise<ConversationWithParticipants[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('conversations')
    .select(`
      id, participant_1_id, participant_2_id, context_event_id,
      last_message_at, last_message_preview,
      is_muted_by_p1, is_muted_by_p2, is_blocked_by_p1, is_blocked_by_p2,
      created_at,
      p1:participant_1_id (anonymous_alias),
      p2:participant_2_id (anonymous_alias)
    `)
    .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
    .order('last_message_at', { ascending: false, nullsFirst: false })

  if (error) {
    throw new Error(`Failed to fetch conversations: ${error.message}`)
  }

  // Format response to always expose the "other" participant's alias
  return (data || []).map((conv: any) => {
    const isP1 = conv.participant_1_id === userId
    const otherParticipant = isP1 ? conv.p2 : conv.p1

    return {
      id: conv.id,
      participant_1_id: conv.participant_1_id,
      participant_2_id: conv.participant_2_id,
      context_event_id: conv.context_event_id,
      last_message_at: conv.last_message_at,
      last_message_preview: conv.last_message_preview,
      is_muted_by_p1: conv.is_muted_by_p1,
      is_muted_by_p2: conv.is_muted_by_p2,
      is_blocked_by_p1: conv.is_blocked_by_p1,
      is_blocked_by_p2: conv.is_blocked_by_p2,
      created_at: conv.created_at,
      p1_deleted_at: conv.p1_deleted_at,
      p2_deleted_at: conv.p2_deleted_at,
      other_participant: otherParticipant,
    }
  })
}

export async function getMessages(conversationId: string, userId: string): Promise<MessageWithSender[]> {
  const supabase = await createClient()

  // Verify participation first to ensure security
  const { data: conv, error: convError } = await supabase
    .from('conversations')
    .select('id')
    .eq('id', conversationId)
    .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
    .single()

  if (convError || !conv) {
    throw new Error('Not authorized to view messages in this conversation')
  }

  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:sender_id(anonymous_alias)
    `)
    .eq('conversation_id', conversationId)
    .eq('is_deleted_by_sender', false) // assuming if receiver deletes we might have complex logic, but we follow requirement
    .order('created_at', { ascending: true })
    .limit(50)

  if (error) {
    throw new Error(`Failed to fetch messages: ${error.message}`)
  }

  // Clean data structure returned by PostgREST
  return (data || []).map((msg: any) => ({
    ...msg,
    sender: Array.isArray(msg.sender) ? msg.sender[0] : msg.sender,
  }))
}
