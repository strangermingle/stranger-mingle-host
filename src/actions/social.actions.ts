'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleHostFollow(hostId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'You must be logged in to follow a host' }

  // Check if already following
  const { data: existingFollow } = await (supabase
    .from('host_follows') as any)
    .select('id')
    .eq('follower_id', user.id)
    .eq('host_id', hostId)
    .maybeSingle()

  if (existingFollow) {
    const { error } = await (supabase
      .from('host_follows') as any)
      .delete()
      .eq('id', existingFollow.id)

    if (error) return { error: error.message }
    revalidatePath(`/events`) // Revalidate paths where this might matter
    revalidatePath('/host-dashboard')
    return { success: true, action: 'unfollowed' }
  } else {
    const { error } = await (supabase
      .from('host_follows') as any)
      .insert({
        follower_id: user.id,
        host_id: hostId
      })

    if (error) return { error: error.message }
    revalidatePath(`/events`)
    revalidatePath('/host-dashboard')
    return { success: true, action: 'followed' }
  }
}

export async function toggleEventLike(eventId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'You must be logged in to like an event' }

  // Check if already liked
  const { data: existingLike } = await (supabase
    .from('event_likes') as any)
    .select('id')
    .eq('user_id', user.id)
    .eq('event_id', eventId)
    .maybeSingle()

  if (existingLike) {
    const { error } = await (supabase
      .from('event_likes') as any)
      .delete()
      .eq('id', existingLike.id)

    if (error) return { error: error.message }
    revalidatePath(`/events/${eventId}`)
    revalidatePath('/host-dashboard')
    return { success: true, action: 'unliked' }
  } else {
    const { error } = await (supabase
      .from('event_likes') as any)
      .insert({
        user_id: user.id,
        event_id: eventId
      })

    if (error) return { error: error.message }
    revalidatePath(`/events/${eventId}`)
    revalidatePath('/host-dashboard')
    return { success: true, action: 'liked' }
  }
}

export async function toggleEventSave(eventId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'You must be logged in to save an event' }

  const { data: existingSave } = await (supabase
    .from('event_saves') as any)
    .select('id')
    .eq('user_id', user.id)
    .eq('event_id', eventId)
    .maybeSingle()

  if (existingSave) {
    const { error } = await (supabase
      .from('event_saves') as any)
      .delete()
      .eq('id', existingSave.id)

    if (error) return { error: error.message }
    revalidatePath(`/events/${eventId}`)
    revalidatePath('/host-dashboard')
    return { success: true, action: 'unsaved' }
  } else {
    const { error } = await (supabase
      .from('event_saves') as any)
      .insert({
        user_id: user.id,
        event_id: eventId
      })

    if (error) return { error: error.message }
    revalidatePath(`/events/${eventId}`)
    revalidatePath('/host-dashboard')
    return { success: true, action: 'saved' }
  }
}

export async function toggleEventInterest(eventId: string, type: 'interested' | 'going' | 'not_going' = 'interested') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'You must be logged in to show interest' }

  const { data: existingInterest } = await (supabase
    .from('event_interests') as any)
    .select('id, interest_type')
    .eq('user_id', user.id)
    .eq('event_id', eventId)
    .maybeSingle()

  if (existingInterest) {
    if (existingInterest.interest_type === type) {
      // Toggle off if same type
      const { error } = await (supabase
        .from('event_interests') as any)
        .delete()
        .eq('id', existingInterest.id)

      if (error) return { error: error.message }
      revalidatePath(`/events/${eventId}`)
      revalidatePath('/host-dashboard')
      return { success: true, action: 'removed' }
    } else {
      // Update type
      const { error } = await (supabase
        .from('event_interests') as any)
        .update({ interest_type: type })
        .eq('id', existingInterest.id)

      if (error) return { error: error.message }
      revalidatePath(`/events/${eventId}`)
      revalidatePath('/host-dashboard')
      return { success: true, action: 'updated' }
    }
  } else {
    const { error } = await (supabase
      .from('event_interests') as any)
      .insert({
        user_id: user.id,
        event_id: eventId,
        interest_type: type
      })

    if (error) return { error: error.message }
    revalidatePath(`/events/${eventId}`)
    revalidatePath('/host-dashboard')
    return { success: true, action: 'added' }
  }
}

