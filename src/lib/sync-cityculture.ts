import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

const SYNC_URL = process.env.CITYCULTURE_SYNC_URL || 'https://api.cityculture.in/api/integrations/channel/sync'
const SYNC_SECRET = process.env.CITYCULTURE_SYNC_SECRET || 'sm_cc_sync_sec_8a39f1c7d2e45b6890f1'

export async function syncEventToCityCulture(
  eventId: string,
  action: 'publish' | 'update' | 'cancel' = 'publish'
) {
  try {
    if (action === 'cancel') {
      const rawBody = JSON.stringify({
        action: 'cancel',
        external_id: eventId,
      })
      const timestamp = Date.now().toString()
      const signature = crypto.createHmac('sha256', SYNC_SECRET).update(`${timestamp}.${rawBody}`).digest('hex')

      const res = await fetch(SYNC_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-partner-id': 'strangermingle',
          'x-timestamp': timestamp,
          'x-signature': signature,
          'Authorization': `Bearer ${SYNC_SECRET}`,
        },
        body: rawBody,
      })
      const data = await res.json()
      console.log('[CityCulture Sync] Event cancelled:', data)
      return { success: res.ok, data }
    }

    // Fetch full event details from Stranger Mingle
    const supabase = await createClient()
    const { data: event, error } = await (supabase
      .from('events') as any)
      .select('*, locations(*), ticket_tiers(*), categories(*)')
      .eq('id', eventId)
      .single()

    if (error || !event) {
      console.error('[CityCulture Sync] Error fetching event:', error)
      return { success: false, error: error?.message || 'Event not found' }
    }

    const payload = {
      action,
      event: {
        id: event.id,
        title: event.title,
        slug: event.slug,
        short_description: event.short_description,
        description: event.description,
        status: event.status,
        event_type: event.event_type,
        start_datetime: event.start_datetime,
        end_datetime: event.end_datetime,
        timezone: event.timezone,
        doors_open_at: event.doors_open_at,
        cover_image_url: event.cover_image_url,
        vertical_poster_url: event.vertical_poster_url,
        max_capacity: event.max_capacity,
        is_age_restricted: event.is_age_restricted,
        min_age: event.min_age,
        refund_policy: event.refund_policy,
        refund_policy_text: event.refund_policy_text,
        is_featured: event.is_featured,
        is_sponsored: event.is_sponsored,
        category: event.categories?.slug || 'meetups',
        location: event.locations,
        ticket_tiers: event.ticket_tiers,
      },
    }

    const rawBody = JSON.stringify(payload)
    const timestamp = Date.now().toString()
    const signature = crypto.createHmac('sha256', SYNC_SECRET).update(`${timestamp}.${rawBody}`).digest('hex')

    const res = await fetch(SYNC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-partner-id': 'strangermingle',
        'x-timestamp': timestamp,
        'x-signature': signature,
        'Authorization': `Bearer ${SYNC_SECRET}`,
      },
      body: rawBody,
    })

    const result = await res.json()
    if (!res.ok) {
      console.error('[CityCulture Sync] Sync endpoint returned error:', result)
    } else {
      console.log('[CityCulture Sync] Event synced successfully to City Culture:', result)
    }

    return { success: res.ok, result }
  } catch (err: any) {
    console.error('[CityCulture Sync] Failed to dispatch sync:', err)
    return { success: false, error: err.message }
  }
}
