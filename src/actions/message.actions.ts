'use server'

import { createClient } from '../lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Basic HTML stripper
function stripHtml(text: string) {
  return text.replace(/<[^>]*>?/gm, '')
}

export async function startConversationAction(recipientId: string, contextEventId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const currentUserId = user.id

  // Verify not blocked by recipient
  const { data: blockCheck } = await (supabase
    .from('user_blocks') as any)
    .select('id')
    .eq('blocker_id', recipientId)
    .eq('blocked_id', currentUserId)
    .single()

  if (blockCheck) {
    throw new Error('You cannot start a conversation with this user.')
  }

  // Consistent ordering
  const p1 = currentUserId < recipientId ? currentUserId : recipientId
  const p2 = currentUserId < recipientId ? recipientId : currentUserId

  // Check if conversation exists
  // First, we can simply attempt an insert and catch error, or query first
  const { data: existing } = await (supabase
    .from('conversations') as any)
    .select('id')
    .eq('participant_1_id', p1)
    .eq('participant_2_id', p2)
    .single()

  if (existing) {
    return { success: true, conversationId: (existing as any).id }
  }

  // Insert new conversation
  const { data: newConv, error } = await (supabase
    .from('conversations') as any)
    .insert({
      participant_1_id: p1,
      participant_2_id: p2,
      context_event_id: contextEventId || null,
    })
    .select('id')
    .single()

  if (error) {
    throw new Error(`Failed to start conversation: ${error.message}`)
  }

  return { success: true, conversationId: (newConv as any).id }
}

export async function sendMessageAction(conversationId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const currentUserId = user.id

  // Verify conversation and participation
  const { data: conv, error: convError } = await (supabase
    .from('conversations') as any)
    .select('*')
    .eq('id', conversationId)
    .single()

  if (convError || !conv) {
    throw new Error('Conversation not found')
  }

  if ((conv as any).participant_1_id !== currentUserId && (conv as any).participant_2_id !== currentUserId) {
    throw new Error('Unauthorized for this conversation')
  }

  // Check blocked status
  if ((conv as any).is_blocked_by_p1 || (conv as any).is_blocked_by_p2) {
    throw new Error('Cannot send messages in this conversation. A participant has blocked the other.')
  }

  // Sanitize content
  let cleanContent = stripHtml(content).trim()
  if (cleanContent.length > 1000) {
    cleanContent = cleanContent.substring(0, 1000)
  }

  if (cleanContent.length === 0) {
    throw new Error('Message cannot be empty')
  }

  // Insert message
  const { error: msgError } = await (supabase
    .from('messages') as any)
    .insert({
      conversation_id: conversationId,
      sender_id: currentUserId,
      message_type: 'text',
      content: cleanContent,
    })

  if (msgError) {
    throw new Error(`Failed to send message: ${msgError.message}`)
  }

  // Update conversation
  const preview = cleanContent.substring(0, 200)
  await (supabase
    .from('conversations') as any)
    .update({
      last_message_at: new Date().toISOString(),
      last_message_preview: preview,
    })
    .eq('id', conversationId)

  // Insert notification for recipient
  const recipientId = (conv as any).participant_1_id === currentUserId ? (conv as any).participant_2_id : (conv as any).participant_1_id
  
  // Get current user's alias or display name
  const { data: senderAlias } = await (supabase
    .from('users') as any)
    .select('anonymous_alias')
    .eq('id', currentUserId)
    .single()

  await (supabase
    .from('notifications') as any)
    .insert({
      user_id: recipientId,
      type: 'new_message',
      title: `New message from ${(senderAlias as any)?.anonymous_alias || 'Unknown'}`,
      body: preview,
      action_url: `/messages/${conversationId}`,
      channel: 'in_app',
      related_id: conversationId,
      related_type: 'message'
    })

  revalidatePath(`/messages/${conversationId}`)
  return { success: true }
}

export async function markConversationReadAction(conversationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await (supabase
    .from('messages') as any)
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq('conversation_id', conversationId)
    .neq('sender_id', user.id)
    .eq('is_read', false)

  if (error) {
    console.error('Failed to mark read:', error)
  }

  return { success: true }
}

export async function blockUserAction(blockedUserId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const currentUserId = user.id

  // Insert into user_blocks
  const { error: blockError } = await (supabase
    .from('user_blocks') as any)
    .insert({
      blocker_id: currentUserId,
      blocked_id: blockedUserId,
    })

  // Ignore 23505 (unique violation) if already blocked
  if (blockError && blockError.code !== '23505') {
    throw new Error(`Failed to block user: ${blockError.message}`)
  }

  // Update affected conversations
  const p1 = currentUserId < blockedUserId ? currentUserId : blockedUserId
  const p2 = currentUserId < blockedUserId ? blockedUserId : currentUserId

  const isBlockerP1 = currentUserId === p1

  const updatePayload = isBlockerP1
    ? { is_blocked_by_p1: true }
    : { is_blocked_by_p2: true }

  await (supabase
    .from('conversations') as any)
    .update(updatePayload)
    .eq('participant_1_id', p1)
    .eq('participant_2_id', p2)

  revalidatePath('/messages')
  return { success: true }
}
