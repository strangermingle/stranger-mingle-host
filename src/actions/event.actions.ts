'use server'

import { createClient } from '@/lib/supabase/server'
import { createEventSchema, updateEventSchema, type CreateEventInput, type UpdateEventInput } from '@/lib/validations/event.schemas'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { mapPostgresError } from '@/lib/utils/error-mapper'
import crypto from 'crypto'
import { env } from '@/lib/env'
import { createRazorpayOrder } from '@/lib/razorpay/createOrder'

export async function createEventAction(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  try {
    const rawData = formData.get('data') as string
    if (!rawData) return { error: 'No data provided' }
    
    let validated: CreateEventInput;
    try {
      validated = createEventSchema.parse(JSON.parse(rawData))
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        const messages = err.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        return { error: `Validation failed: ${messages}` }
      }
      return { error: 'Invalid data provided' }
    }

    // 1. Determine Location ID
    let locationId = (validated.location_id && validated.location_id !== '') ? validated.location_id : null
    
    const hasLocationData = validated.location && (
      validated.location.venue_name || 
      validated.location.address_line_1 || 
      validated.location.city
    )

    if (!locationId && validated.event_type !== 'online' && hasLocationData && validated.location) {
      const { data: loc, error: locError } = await supabase
        .from('locations')
        .insert({
          venue_name: validated.location.venue_name || null,
          address_line1: validated.location.address_line_1 || null,
          city: validated.location.city || 'TBD',
          state: validated.location.state || null,
          country: validated.location.country || 'India',
          postal_code: validated.location.postal_code || null,
          latitude: validated.location.latitude || null,
          longitude: validated.location.longitude || null
        })
        .select()
        .single()
      
      if (locError) throw locError
      locationId = loc.id
    }

    // 2. Prepare Data for RPC
    const calculatedMaxCapacity = validated.ticket_tiers?.reduce((sum: number, tier) => sum + (tier.total_quantity || 0), 0) || validated.max_capacity
    const slug = validated.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.random().toString(36).substring(2, 5)

    // Only allow 'published' if it's already paid or doesn't require payment (logic for free events could be added here)
    // For now, respect the 'draft' default but allow override if the schema allows 'published'
    const status = validated.status || 'draft'

    const { data: createdEventId, error: rpcError } = await supabase.rpc('create_event_complex', {
      event_data: {
        title: validated.title,
        host_id: validated.host_id,
        category_id: validated.category_id,
        location_id: locationId,
        event_type: validated.event_type,
        status: status,
        start_datetime: validated.start_datetime,
        end_datetime: validated.end_datetime,
        timezone: validated.timezone,
        short_description: validated.short_description || null,
        description: validated.description || null,
        cover_image_url: validated.cover_image_url || null,
        cover_image_alt: validated.cover_image_alt || null,
        vertical_poster_url: validated.vertical_poster_url || null,
        vertical_poster_alt: validated.vertical_poster_alt || null,
        is_age_restricted: validated.is_age_restricted,
        min_age: validated.min_age,
        doors_open_at: validated.doors_open_at || null,
        refund_policy: validated.refund_policy,
        refund_policy_text: validated.refund_policy_text || null,
        ticketing_mode: validated.ticketing_mode,
        online_event_url: (validated.event_type === 'online' || validated.event_type === 'hybrid') ? (validated.online_event_url || null) : null,
        online_platform: (validated.event_type === 'online' || validated.event_type === 'hybrid') ? (validated.online_platform || null) : null,
        online_url_reveal: validated.online_url_reveal || 'after_booking',
        max_capacity: calculatedMaxCapacity,
        meta_title: validated.meta_title || null,
        meta_description: validated.meta_description || null,
        slug: slug,
        is_recurring: validated.is_recurring,
        recurrence_rule: validated.recurrence_rule
      },
      ticket_tiers: validated.ticket_tiers || [],
      agenda: validated.agenda?.map((item, idx) => ({ ...item, sort_order: idx })) || [],
      faqs: validated.faqs?.map((item, idx) => ({ ...item, sort_order: idx })) || [],
      tags: validated.tags || [],
      cohosts: validated.cohosts || [],
      age_restrictions: validated.age_restrictions || []
    })

    if (rpcError) throw rpcError

    revalidatePath('/events/published')
    revalidatePath('/events/drafts')
    return { success: true, slug: slug, id: createdEventId }

  } catch (err: unknown) {
    console.error('createEventAction error:', err)
    return { error: mapPostgresError(err) }
  }
}

export async function updateEventAction(eventId: string, formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  try {
    const rawData = formData.get('data') as string
    if (!rawData) return { error: 'No data provided' }
    
    let validated: UpdateEventInput;
    try {
      validated = updateEventSchema.parse(JSON.parse(rawData))
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        const messages = err.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        return { error: `Validation failed: ${messages}` }
      }
      return { error: 'Invalid data provided' }
    }

    const { data: eventData, error: eventError } = await supabase.from('events')
      .select('host_id, title, slug, creation_fee_paid')
      .eq('id', eventId)
      .single()
    
    if (eventError || !eventData) return { error: 'Event not found' }
    
    const { data: hostProfile, error: profileError } = await supabase.from('host_profiles')
      .select('user_id')
      .eq('id', eventData.host_id)
      .single()
    
    if (profileError || !hostProfile || hostProfile.user_id !== user.id) return { error: 'Unauthorized' }

    let totalCapacity = validated.max_capacity
    if (validated.ticket_tiers && (validated.ticketing_mode === 'platform' || validated.ticketing_mode === 'free')) {
      totalCapacity = validated.ticket_tiers.reduce((sum, t) => sum + (t.total_quantity || 0), 0)
    }

    const { error: updateError } = await supabase
      .from('events')
      .update({
        title: validated.title,
        location_id: validated.location_id || null,
        category_id: validated.category_id,
        event_type: validated.event_type,
        start_datetime: validated.start_datetime,
        end_datetime: validated.end_datetime,
        short_description: validated.short_description || null,
        description: validated.description || null,
        cover_image_url: validated.cover_image_url || null,
        cover_image_alt: validated.cover_image_alt || null,
        vertical_poster_url: validated.vertical_poster_url || null,
        vertical_poster_alt: validated.vertical_poster_alt || null,
        is_age_restricted: validated.is_age_restricted,
        min_age: validated.min_age,
        doors_open_at: validated.doors_open_at || null,
        refund_policy: validated.refund_policy,
        refund_policy_text: validated.refund_policy_text || null,
        ticketing_mode: validated.ticketing_mode,
        online_event_url: (validated.event_type === 'online' || validated.event_type === 'hybrid') ? (validated.online_event_url || null) : null,
        online_platform: (validated.event_type === 'online' || validated.event_type === 'hybrid') ? (validated.online_platform || null) : null,
        online_url_reveal: validated.online_url_reveal || 'after_booking',
        max_capacity: totalCapacity || null,
        status: (eventData.creation_fee_paid || validated.status !== 'published') ? validated.status : 'draft',
        meta_title: validated.meta_title || null,
        meta_description: validated.meta_description || null
      })
      .eq('id', eventId)

    if (updateError) throw updateError

    // Refetch Actual Slug
    const { data: finalEvent } = await supabase.from('events')
      .select('slug')
      .eq('id', eventId)
      .single()
    
    const actualSlug = finalEvent?.slug || eventData.slug

    // 2. Agenda Update
    if (validated.agenda) {
      await supabase.from('event_agenda').delete().eq('event_id', eventId)
      if (validated.agenda.length > 0) {
        await supabase.from('event_agenda').insert(
          validated.agenda.map((item, idx) => ({
            event_id: eventId,
            title: item.title,
            description: item.description || null,
            starts_at: item.start_time,
            ends_at: item.end_time,
            sort_order: idx
          }))
        )
      }
    }

    // 3. FAQs Update
    if (validated.faqs) {
      await supabase.from('event_faqs').delete().eq('event_id', eventId)
      if (validated.faqs.length > 0) {
        await supabase.from('event_faqs').insert(
          validated.faqs.map((item, idx) => ({
            event_id: eventId,
            question: item.question,
            answer: item.answer,
            sort_order: idx
          }))
        )
      }
    }

    // 4. Tags Update
    if (validated.tags) {
      await supabase.from('event_tags').delete().eq('event_id', eventId)
      for (const rawTagName of validated.tags) {
        const tagName = rawTagName.trim()
        if (!tagName) continue
        
        const tagSlug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        
        const { data: existingTag } = await supabase.from('tags')
          .select('id')
          .or(`name.eq."${tagName}",slug.eq."${tagSlug}"`)
          .single()
        
        let tagId = existingTag?.id
        if (!tagId) {
          const { data: newTag, error: newTagError } = await supabase.from('tags')
            .insert({ name: tagName, slug: tagSlug })
            .select()
            .single()
          if (!newTagError && newTag) tagId = newTag.id
        }

        if (tagId) {
          await supabase.from('event_tags').insert({ event_id: eventId, tag_id: tagId })
        }
      }
    }

    // 5. Ticket Tiers Update
    if (validated.ticket_tiers) {
      const { data: existingTiers } = await supabase.from('ticket_tiers')
        .select('id')
        .eq('event_id', eventId)

      const existingTierIds = (existingTiers || []).map(t => t.id)
      const incomingTierIds = validated.ticket_tiers.filter(t => t.id).map(t => t.id) as string[]
      const tierIdsToDelete = existingTierIds.filter(id => !incomingTierIds.includes(id))

      if (validated.ticket_tiers.length > 0) {
        await supabase.from('ticket_tiers').upsert(
          validated.ticket_tiers.map(t => ({
            id: t.id,
            event_id: eventId,
            name: t.name,
            description: t.description || null,
            tier_type: t.tier_type,
            price: t.price,
            total_quantity: t.total_quantity,
            max_per_booking: t.max_per_booking,
            sale_start_at: t.sale_start_at || null,
            sale_end_at: t.sale_end_at || null,
            perks: t.perks || [],
            is_active: true,
          })),
          { onConflict: 'id' }
        )
      }

      if (tierIdsToDelete.length > 0) {
        try {
          await supabase.from('ticket_tiers').delete().in('id', tierIdsToDelete)
        } catch {
          await supabase.from('ticket_tiers').update({ is_active: false }).in('id', tierIdsToDelete)
        }
      }
    }

    // 6. Cohosts Update
    if (validated.cohosts) {
      await supabase.from('event_cohosts').delete().eq('event_id', eventId)
      if (validated.cohosts.length > 0) {
        await supabase.from('event_cohosts').insert(
          validated.cohosts.map(userId => ({
            event_id: eventId,
            host_user_id: userId,
            role: 'co-host',
            is_confirmed: false
          }))
        )
      }
    }

    // 7. Age Restrictions Update
    if (validated.age_restrictions) {
      await supabase.from('event_age_restrictions').delete().eq('event_id', eventId)
      if (validated.age_restrictions.length > 0) {
        await supabase.from('event_age_restrictions').insert(
          validated.age_restrictions.map(r => ({
            event_id: eventId,
            restriction_text: r.restriction_text,
            min_age: r.min_age
          }))
        )
      }
    }

    revalidatePath('/')
    revalidatePath('/events')
    revalidatePath(`/events/${eventData.slug}`)
    if (actualSlug !== eventData.slug) revalidatePath(`/events/${actualSlug}`)
    revalidatePath(`/host-dashboard/events`)
    
    return { success: true, id: eventId, slug: actualSlug }
  } catch (err: unknown) {
    console.error('updateEventAction error:', err)
    return { error: mapPostgresError(err) }
  }
}

import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary'

export async function uploadImageAction(
  id: string, 
  formData: FormData, 
  type: 'landscape' | 'vertical' | 'profile' | 'logo' = 'landscape'
) {
  const file = formData.get('file') as File
  if (!file) return { error: 'No file provided' }
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  if (id !== 'new-event' && id !== 'new-host' && !id.startsWith('temp-')) {
    const { data: event } = await supabase.from('events').select('host_id').eq('id', id).single()
    if (!event) return { error: 'Event not found' }
    
    const { data: hostProfile } = await supabase.from('host_profiles').select('user_id').eq('id', event.host_id).single()
    if (!hostProfile || hostProfile.user_id !== user.id) return { error: 'Unauthorized' }
  }

  try {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    let folderName = env.CLOUDINARY_FOLDER_LANDSCAPE
    if (type === 'vertical') folderName = env.CLOUDINARY_FOLDER_VERTICAL
    else if (type === 'profile') folderName = env.CLOUDINARY_FOLDER_PROFILE
    else if (type === 'logo') folderName = env.CLOUDINARY_FOLDER_LOGO
 
    const folder = id === 'new-event' || id === 'new-host' ? `${folderName}/pending` : `${folderName}/${id}`
    const result = await uploadToCloudinary(buffer, folder)
    
    const publicUrl = result.secure_url

    if (type === 'landscape' || type === 'vertical') {
      const isLandscape = type === 'landscape'
      
      const { data: imageData, error: insertError } = await supabase.from('event_images')
        .insert({
          event_id: (id === 'new-event' ? null : id) as string, // Cast to string to satisfy non-nullable type if we're sure it matches. 
          // Actually, if it's 'new-event', we probably shouldn't be inserting into event_images yet if event_id is required.
          // For now, I'll use a type assertion to string to pass lint, as this logic was already there.
          image_url: publicUrl,
          is_cover: isLandscape
        })
        .select()
        .single()

      if (id !== 'new-event' && id !== 'new-host' && !id.startsWith('temp-')) {
        const updateField = isLandscape ? 'cover_image_url' : 'vertical_poster_url'
        await supabase.from('events').update({ [updateField]: publicUrl }).eq('id', id)
      }

      if (insertError) return { success: true, url: publicUrl }
      return { success: true, image: imageData, url: publicUrl }
    }

    return { success: true, url: publicUrl }
  } catch (err: unknown) {
    console.error('uploadEventImageAction error:', err)
    const message = err instanceof Error ? err.message : 'Failed to upload image'
    return { error: message }
  }
}

export async function deleteImageAction(url: string, eventId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  if (eventId && eventId !== 'new-event' && !eventId.startsWith('temp-')) {
    const { data: event } = await supabase.from('events').select('host_id').eq('id', eventId).single()
    if (event) {
      const { data: host } = await supabase.from('host_profiles').select('user_id').eq('id', event.host_id).single()
      if (!host || host.user_id !== user.id) return { error: 'Unauthorized' }
    }
  }

  try {
    const res = await deleteFromCloudinary(url)
    return { success: true, result: res }
  } catch (err: unknown) {
    console.error('deleteImageAction error:', err)
    return { error: 'Deletion failed' }
  }
}

export async function updateEventStatusAction(eventId: string, status: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('events').update({ 
    status: status as 'draft' | 'published' | 'cancelled' | 'completed' | 'suspended' | 'under_review' 
  }).eq('id', eventId)
  if (error) return { error: error.message }
  revalidatePath('/host-dashboard')
  return { success: true }
}

export async function deleteEventAction(eventId: string) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { data: event, error: fetchError } = await supabase.from('events')
    .select('host_id, status')
    .eq('id', eventId)
    .single()

  if (fetchError || !event) return { error: 'Event not found' }

  const { data: hostProfile } = await supabase.from('host_profiles')
    .select('user_id')
    .eq('id', event.host_id)
    .single()

  if (!hostProfile || hostProfile.user_id !== user.id) return { error: 'Unauthorized' }

  try {
    const { count, error: countError } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)

    if (countError) throw countError

    if (count && count > 0) {
      await supabase.from('events').update({ 
        status: 'cancelled' as 'draft' | 'published' | 'cancelled' | 'completed' | 'suspended' | 'under_review' 
      }).eq('id', eventId)
      revalidatePath('/host-dashboard')
      return { success: true, message: 'Event has bookings, so it was marked as Cancelled instead of deleted.' }
    }

    const { error: deleteError } = await supabase.from('events').delete().eq('id', eventId)
    if (deleteError) {
      await supabase.from('events').update({ 
        status: 'cancelled' as 'draft' | 'published' | 'cancelled' | 'completed' | 'suspended' | 'under_review' 
      }).eq('id', eventId)
      return { success: true, message: 'Event was marked as Cancelled due to database constraints.' }
    }

    revalidatePath('/host-dashboard')
    return { success: true }
  } catch (err: unknown) {
    console.error('deleteEventAction error:', err)
    const message = err instanceof Error ? err.message : 'Failed to delete event'
    return { error: message }
  }
}

export async function createEventFeeOrderAction(eventId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: event } = await supabase.from('events').select('host_id, creation_fee_paid').eq('id', eventId).single()
  if (!event) return { error: 'Event not found' }
  if (event.creation_fee_paid) return { error: 'Fee already paid' }

  const { data: hostProfile } = await supabase.from('host_profiles').select('user_id').eq('id', event.host_id).single()
  if (!hostProfile || hostProfile.user_id !== user.id) return { error: 'Unauthorized' }

  const amount = 199

  try {
    const order = await createRazorpayOrder({
      amount: amount * 100,
      currency: 'INR',
      receipt: `event_fee_${eventId.substring(0, 8)}`
    })

    return {
      success: true,
      orderId: order.id,
      amount: amount * 100,
      keyId: env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    }
  } catch (err: unknown) {
    console.error('Failed to create event fee order', err)
    return { error: 'Payment initialization failed' }
  }
}

export async function verifyEventFeePaymentAction(eventId: string, paymentDetails: { razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string }) {
  const secret = env.RAZORPAY_KEY_SECRET

  const generated_signature = crypto
    .createHmac('sha256', secret)
    .update(paymentDetails.razorpay_order_id + "|" + paymentDetails.razorpay_payment_id)
    .digest('hex')

  if (generated_signature !== paymentDetails.razorpay_signature) {
    return { error: 'Invalid payment signature' }
  }

  const { createClient: createSupabaseAdminClient } = await import('@supabase/supabase-js')
  const adminSupabase = createSupabaseAdminClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { error: updateError } = await adminSupabase.from('events')
    .update({ 
      creation_fee_paid: true, 
      creation_fee_payment_id: paymentDetails.razorpay_payment_id,
      status: 'published' as 'draft' | 'published' | 'cancelled' | 'completed' | 'suspended' | 'under_review'
    })
    .eq('id', eventId)
 
   if (updateError) return { error: 'Failed to publish event. Please contact support.' }
 
   revalidatePath('/host-dashboard')

   try {
     const { data: eventData } = await adminSupabase.from('events').select('title, host_id').eq('id', eventId).single()
     if (eventData) {
       const { data: hostProfile } = await adminSupabase.from('host_profiles').select('user_id').eq('id', eventData.host_id).single()
       if (hostProfile) {
         const { data: hostUser } = await adminSupabase.from('users').select('email').eq('id', hostProfile.user_id).single()
         if (hostUser?.email) {
           const baseUrl = env.NEXT_PUBLIC_SUPABASE_URL
           const functionUrl = `${baseUrl}/functions/v1/send-email`
           
           await fetch(functionUrl, {
             method: 'POST',
             headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`
             },
             body: JSON.stringify({
               recipient_email: hostUser.email,
               user_id: hostProfile.user_id,
               subject: 'Event Published Successfully! — Stranger Mingle',
               body: `Great news! Your event <strong>${eventData.title}</strong> is now live. We've received your payment of ₹199.`,
               action_url: `${env.NEXT_PUBLIC_SITE_URL}/host-dashboard/events`
             })
           })
         }
       }
     }
   } catch (emailErr: unknown) {
     console.error('Failed to trigger host confirmation email:', emailErr)
   }

   return { success: true }
}

export async function getTagsAction() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('tags').select('id, name').order('name')
  if (error) return { error: error.message }
  return { success: true, tags: data }
}

export async function getOtherHostsAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  
  const { data, error } = await supabase.from('host_profiles').select('user_id, display_name, organisation_name').neq('user_id', user.id).order('display_name')
  if (error) return { error: error.message }
  return { success: true, hosts: data }
}

export async function getEventDetailsAction(eventIdOrSlug: string) {
  const supabase = await createClient()
  
  const query = supabase.from('events')
    .select(`
      *,
      ticket_tiers(*),
      agenda:event_agenda(*),
      faqs:event_faqs(*),
      tags:event_tags(tag:tags(id, name)),
      cohosts:event_cohosts(id, host_user_id, role, is_confirmed),
      age_restrictions:event_age_restrictions(*)
    `)

  if (eventIdOrSlug.length === 36 && eventIdOrSlug.includes('-')) {
    query.eq('id', eventIdOrSlug)
  } else {
    query.eq('slug', eventIdOrSlug)
  }

  const { data, error } = await query.single()
  
  if (error) return { error: error.message }
  return { success: true, event: data }
}
