'use server'

import { createClient } from '../lib/supabase/server'
import { supabaseAdmin } from '../lib/supabase/admin'
import { getUserWithHostProfile } from '../lib/repositories/users.repository'
import { revalidatePath } from 'next/cache'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

async function getAuthenticatedHost() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const dbUser = await getUserWithHostProfile(user.id)
  if (!dbUser || !dbUser.host_profile) {
    throw new Error('Host profile not found')
  }

  return { user, hostProfile: dbUser.host_profile }
}

export async function toggleHostOnlineAction(isOnline: boolean) {
  try {
    const { hostProfile } = await getAuthenticatedHost()

    const { error } = await (supabaseAdmin as any)
      .from('phone_a_friend_host_settings')
      .upsert({
        host_id: hostProfile.id,
        is_online: isOnline,
        last_seen_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'host_id' })

    if (error) return { success: false, error: error.message }

    revalidatePath('/phone-a-friend')
    return { success: true, isOnline }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function createHostSlotsAction(slots: Array<{
  slotDate: string
  startTime: string
  endTime: string
  price?: number
}>) {
  try {
    const { hostProfile } = await getAuthenticatedHost()

    const rows = slots.map(s => ({
      host_id: hostProfile.id,
      slot_date: s.slotDate,
      start_time: s.startTime,
      end_time: s.endTime,
      price: s.price ?? 99.0,
      status: 'available'
    }))

    const { error } = await (supabaseAdmin as any)
      .from('phone_a_friend_slots')
      .insert(rows)

    if (error) return { success: false, error: error.message }

    revalidatePath('/phone-a-friend')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function deleteHostSlotAction(slotId: string) {
  try {
    const { hostProfile } = await getAuthenticatedHost()

    const { error } = await (supabaseAdmin as any)
      .from('phone_a_friend_slots')
      .delete()
      .eq('id', slotId)
      .eq('host_id', hostProfile.id)
      .eq('status', 'available')

    if (error) return { success: false, error: error.message }

    revalidatePath('/phone-a-friend')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function updateHostCallingPricingAction(ratePerSession: number, sessionDurationMinutes: number = 15) {
  try {
    const { hostProfile } = await getAuthenticatedHost()

    const { error } = await (supabaseAdmin as any)
      .from('phone_a_friend_host_settings')
      .upsert({
        host_id: hostProfile.id,
        rate_per_session: Number(ratePerSession),
        session_duration_minutes: Number(sessionDurationMinutes),
        updated_at: new Date().toISOString()
      }, { onConflict: 'host_id' })

    if (error) return { success: false, error: error.message }

    revalidatePath('/phone-a-friend')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function respondToCallAction(callId: string, action: 'accept' | 'reject') {
  try {
    const { hostProfile } = await getAuthenticatedHost()

    const res = await fetch(`${BACKEND_URL}/api/calls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'respond',
        callId,
        hostId: hostProfile.id,
        actionType: action,
        responseAction: action,
      }),
      cache: 'no-store'
    })

    if (!res.ok) {
      const err = await res.json()
      return { success: false, error: err.error || 'Failed to respond to call' }
    }

    const data = await res.json()
    revalidatePath('/phone-a-friend')
    return data
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function getCallSessionTokenAction(callId: string) {
  try {
    const { hostProfile } = await getAuthenticatedHost()

    const res = await fetch(`${BACKEND_URL}/api/calls/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callId,
        requesterId: hostProfile.id,
      }),
      cache: 'no-store',
    })

    if (!res.ok) {
      const err = await res.json()
      return { success: false, error: err.error || 'Failed to retrieve call token' }
    }

    const data = await res.json()
    return { success: true, ...data }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function endCallAction(callId: string) {
  try {
    const { hostProfile } = await getAuthenticatedHost()

    const res = await fetch(`${BACKEND_URL}/api/calls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'end',
        callId,
        requesterId: hostProfile.id,
      }),
      cache: 'no-store',
    })

    if (!res.ok) {
      const err = await res.json()
      return { success: false, error: err.error || 'Failed to terminate call' }
    }

    const data = await res.json()
    revalidatePath('/phone-a-friend')
    return data
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function submitHostCallerReviewAction(params: {
  callId: string
  rating: number
  notes?: string
}) {
  try {
    const { hostProfile } = await getAuthenticatedHost()

    const res = await fetch(`${BACKEND_URL}/api/calls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'host-rate-caller',
        callId: params.callId,
        hostId: hostProfile.id,
        rating: params.rating,
        notes: params.notes,
      }),
      cache: 'no-store',
    })

    if (!res.ok) {
      const err = await res.json()
      return { success: false, error: err.error || 'Failed to submit review' }
    }

    const data = await res.json()
    revalidatePath('/phone-a-friend')
    return data
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function getCallerReputationAction(callerUserId: string) {
  try {
    const { hostProfile } = await getAuthenticatedHost()

    const res = await fetch(
      `${BACKEND_URL}/api/calls?callerUserId=${encodeURIComponent(callerUserId)}&forHost=true&hostId=${encodeURIComponent(hostProfile.id)}`,
      {
        method: 'GET',
        cache: 'no-store',
      }
    )

    if (!res.ok) {
      return {
        totalCalls: 0,
        averageRating: null,
        ratingCount: 0,
        recentNotes: [],
      }
    }

    return await res.json()
  } catch (err: any) {
    console.error('Failed to get caller reputation:', err)
    return {
      totalCalls: 0,
      averageRating: null,
      ratingCount: 0,
      recentNotes: [],
    }
  }
}

