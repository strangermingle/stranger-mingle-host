'use server'

import { createClient } from '@/lib/supabase/server'
import { createEventSchema, updateEventSchema, type CreateEventInput } from '@/lib/validations/event.schemas'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
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
    let validated;
    try {
      validated = createEventSchema.parse(JSON.parse(rawData))
    } catch (zodError: any) {
      if (zodError.errors) {
        const messages = zodError.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ')
        return { error: `Validation failed: ${messages}` }
      }
      return { error: 'Invalid data provided' }
    }

    // 1. Create Location if provided and not empty
    let locationId = null
    const hasLocationData = validated.location && (
      validated.location.venue_name || 
      validated.location.address_line_1 || 
      validated.location.city
    )

    if (validated.event_type !== 'online' && hasLocationData && validated.location) {
      const { data: loc, error: locError } = await (supabase
        .from('locations') as any)
        .insert({
          venue_name: validated.location.venue_name || null,
          address_line1: validated.location.address_line_1 || null,
          city: validated.location.city || 'TBD', // Fallback for NOT NULL city if still empty
          state: validated.location.state || null,
          country: validated.location.country || 'India',
          postal_code: validated.location.postal_code || null
        } as any)
        .select()
        .single()
      
      if (locError) {
        console.error('Location insertion error:', locError)
        throw locError
      }
      locationId = (loc as any).id
    }

    // 2. Insert Event
    const { data: createdEvent, error: eventError } = await supabase
      .from('events')
      .insert({
        title: validated.title,
        host_id: validated.host_id, // New field required in schema
        category_id: validated.category_id,
        location_id: locationId,
        event_type: validated.event_type,
        status: 'draft', // Force draft initially until payment is made
        start_datetime: validated.start_datetime,
        end_datetime: validated.end_datetime,
        timezone: validated.timezone,
        short_description: validated.short_description,
        description: validated.description,
        cover_image_url: validated.cover_image_url || null,
        vertical_poster_url: validated.vertical_poster_url || null,
        is_age_restricted: validated.is_age_restricted,
        min_age: validated.min_age,
        doors_open_at: validated.doors_open_at || null,
        refund_policy: validated.refund_policy as any,
        refund_policy_text: validated.refund_policy_text,
        ticketing_mode: validated.ticketing_mode as any,
        slug: validated.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.random().toString(36).substring(2, 7)
      } as any)
      .select()
      .single()

    if (eventError) throw eventError

    // 3. Insert Ticket Tiers
    if (validated.ticket_tiers && validated.ticket_tiers.length > 0) {
      const { error: tierError } = await supabase
        .from('ticket_tiers')
        .insert(
          validated.ticket_tiers.map(t => ({
            event_id: createdEvent.id,
            name: t.name,
            tier_type: t.tier_type as any,
            tier_category: t.tier_category,
            price: t.price,
            total_quantity: t.total_quantity,
            max_per_booking: t.max_per_booking
          }))
        )
      
      if (tierError) throw tierError
    }

    // 4. Insert Agenda
    if (validated.agenda && validated.agenda.length > 0) {
      const { error: agendaError } = await supabase
        .from('event_agenda')
        .insert(
          validated.agenda.map((item, idx) => ({
            event_id: createdEvent.id,
            title: item.title,
            description: item.description,
            starts_at: item.start_time,
            ends_at: item.end_time,
            sort_order: idx
          })) as any // Casting because of schema mismatch in validation vs DB
        )
      if (agendaError) throw agendaError
    }

    // 5. Insert FAQs
    if (validated.faqs && validated.faqs.length > 0) {
      const { error: faqError } = await (supabase
        .from('event_faqs') as any)
        .insert(
          validated.faqs.map((item, idx) => ({
            event_id: createdEvent.id,
            question: item.question,
            answer: item.answer,
            sort_order: idx
          })) as any
        )
      if (faqError) throw faqError
    }

    // 6. Insert Tags
    if (validated.tags && validated.tags.length > 0) {
      for (const tagName of validated.tags) {
        const slug = tagName.toLowerCase().replace(/ /g, '-')
        const { data: tag } = await supabase
          .from('tags')
          .select('id')
          .eq('name', tagName)
          .maybeSingle()
        
        let tagId = tag?.id
        
        if (!tagId) {
          const { data: newTag, error: createError } = await supabase
            .from('tags')
            .insert({ name: tagName, slug })
            .select('id')
            .single()
          
          if (createError) throw createError
          tagId = newTag.id
        }

        const { error: linkError } = await supabase
          .from('event_tags')
          .insert({
            event_id: createdEvent.id,
            tag_id: tagId
          })
        if (linkError) throw linkError
      }
    }

    revalidatePath('/host-dashboard')
    return { success: true, slug: createdEvent.slug, id: createdEvent.id }

  } catch (err: any) {
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
    
    const validated = updateEventSchema.parse(JSON.parse(rawData))

    // Ownership check via host_profiles
    const { data: eventData } = await (supabase.from('events') as any)
      .select('host_id, title, slug, creation_fee_paid')
      .eq('id', eventId)
      .single()
    
    if (!eventData) return { error: 'Event not found' }
    
    const { data: pageData } = await (supabase.from('host_profiles') as any)
      .select('user_id')
      .eq('id', (eventData as any).host_id)
      .single()
    
    if (!pageData || (pageData as any).user_id !== user.id) return { error: 'Unauthorized' }

    // Generate new slug if title changed - REMOVED to prevent 404s
    let newSlug = (eventData as any).slug
    /* 
    if (validated.title && validated.title !== (eventData as any).title) {
      newSlug = validated.title.toLowerCase().replace(/ /g, '-') + '-' + Math.random().toString(36).substring(2, 7)
    }
    */

    // 1. Update Core Event
    const { error: updateError } = await supabase
      .from('events')
      .update({
        title: validated.title,
        // Don't update slug here yet, we'll refetch it after update to see if DB changed it
        category_id: validated.category_id,
        event_type: validated.event_type,
        start_datetime: validated.start_datetime,
        end_datetime: validated.end_datetime,
        short_description: validated.short_description,
        description: validated.description,
        cover_image_url: validated.cover_image_url || null,
        vertical_poster_url: validated.vertical_poster_url || null,
        is_age_restricted: validated.is_age_restricted,
        min_age: validated.min_age,
        doors_open_at: validated.doors_open_at || null,
        refund_policy: validated.refund_policy as any,
        refund_policy_text: validated.refund_policy_text || null,
        status: (eventData.creation_fee_paid || validated.status !== 'published') ? validated.status : 'draft'
      })
      .eq('id', eventId)

    if (updateError) throw updateError

    // Refetch to see the ACTUAL slug (handles DB triggers if any)
    const { data: finalEvent } = await (supabase.from('events') as any)
      .select('slug')
      .eq('id', eventId)
      .single()
    
    const actualSlug = (finalEvent as any)?.slug || newSlug
    console.log('UpdateEventAction: OldSlug=', (eventData as any).slug, 'ActualSlug=', actualSlug)

    // 2. Update Agenda (Delete and Re-insert for simplicity)
    if (validated.agenda) {
      await supabase.from('event_agenda').delete().eq('event_id', eventId)
      if (validated.agenda.length > 0) {
        const { error: agendaError } = await supabase
          .from('event_agenda')
          .insert(
            validated.agenda.map((item, idx) => ({
              event_id: eventId,
              title: item.title,
              description: item.description,
              starts_at: item.start_time,
              ends_at: item.end_time,
              sort_order: idx
            })) as any
          )
        if (agendaError) throw agendaError
      }
    }

    // 3. Update FAQs
    if (validated.faqs) {
      await supabase.from('event_faqs').delete().eq('event_id', eventId)
      if (validated.faqs.length > 0) {
        const { error: faqError } = await supabase
          .from('event_faqs')
          .insert(
            validated.faqs.map((item, idx) => ({
              event_id: eventId,
              question: item.question,
              answer: item.answer,
              sort_order: idx
            }))
          )
        if (faqError) throw faqError
      }
    }

    // 4. Update Tags
    if (validated.tags) {
      await supabase.from('event_tags').delete().eq('event_id', eventId)
      for (const tagName of validated.tags) {
        const slug = tagName.toLowerCase().replace(/ /g, '-')
        const { data: tag } = await supabase
          .from('tags')
          .select('id')
          .eq('name', tagName)
          .maybeSingle()
        
        let tagId = tag?.id
        
        if (!tagId) {
          const { data: newTag, error: createError } = await supabase
            .from('tags')
            .insert({ name: tagName, slug })
            .select('id')
            .single()
          
          if (createError) throw createError
          tagId = newTag.id
        }

        await supabase.from('event_tags').insert({ event_id: eventId, tag_id: tagId })
      }
    }

    // 5. Update Ticket Tiers
    if (validated.ticket_tiers) {
      // For a fresh start, we sync by deleting and re-inserting. 
      await supabase.from('ticket_tiers').delete().eq('event_id', eventId)
      if (validated.ticket_tiers.length > 0) {
        const { error: tierError } = await supabase
          .from('ticket_tiers')
          .insert(
            validated.ticket_tiers.map(t => ({
              event_id: eventId,
              name: t.name,
              tier_type: t.tier_type as any,
              tier_category: t.tier_category,
              price: t.price,
              total_quantity: t.total_quantity,
              max_per_booking: t.max_per_booking
            }))
          )
        if (tierError) throw tierError
      }
    }

    revalidatePath('/')
    revalidatePath('/events')
    revalidatePath(`/events/${(eventData as any).slug}`)
    if (actualSlug !== (eventData as any).slug) {
      revalidatePath(`/events/${actualSlug}`)
    }
    revalidatePath(`/host-dashboard/${(eventData as any).host_id}/events`)
    
    return { success: true, id: eventId, slug: actualSlug }
  } catch (err: any) {
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

  // Ownership check
  if (id !== 'new-event' && id !== 'new-host' && !id.startsWith('temp-')) {
    if (type === 'landscape' || type === 'vertical') {
      const { data: event } = await (supabase.from('events') as any).select('host_id').eq('id', id).single()
      if (!event) return { error: 'Event not found' }
      
      const { data: pageData } = await (supabase.from('host_profiles') as any)
        .select('user_id')
        .eq('id', (event as any).host_id)
        .single()
        
      if (!pageData || (pageData as any).user_id !== user.id) return { error: 'Unauthorized' }
    } else {
      const { data: pageData } = await (supabase.from('host_profiles') as any)
        .select('user_id')
        .eq('id', id)
        .single()
        
      if (!pageData || (pageData as any).user_id !== user.id) return { error: 'Unauthorized' }
    }
  }

  try {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Upload to Cloudinary
    let folderName = env.CLOUDINARY_FOLDER_LANDSCAPE
    if (type === 'vertical') folderName = env.CLOUDINARY_FOLDER_VERTICAL
    else if (type === 'profile') folderName = env.CLOUDINARY_FOLDER_PROFILE
    else if (type === 'logo') folderName = env.CLOUDINARY_FOLDER_LOGO
 
    const folder = id === 'new-event' || id === 'new-host' ? `${folderName}/pending` : `${folderName}/${id}`
    const result = await uploadToCloudinary(buffer, folder)
    
    const publicUrl = result.secure_url

    // Add to event_images table (only for events)
    if (type === 'landscape' || type === 'vertical') {
      const { data: imageData, error: insertError } = await (supabase
        .from('event_images') as any)
        .insert({
          event_id: id === 'new-event' ? null : id,
          image_url: publicUrl,
          is_cover: false
        } as any)
        .select()
        .single()

      if (insertError) {
        if (id !== 'new-event') {
          const { data: currentEvent } = await (supabase.from('events') as any).select('cover_image_url').eq('id', id).single()
          if (! (currentEvent as any).cover_image_url) {
            await (supabase.from('events') as any).update({ cover_image_url: publicUrl }).eq('id', id)
          }
        }
        return { success: true, url: publicUrl }
      }

      return { success: true, image: imageData, url: publicUrl }
    }

    return { success: true, url: publicUrl }
  } catch (err: any) {
    console.error('uploadEventImageAction error:', err)
    return { error: err.message || 'Failed to upload image' }
  }
}

export async function deleteImageAction(url: string, eventId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Optional: check ownership if eventId is provided
  if (eventId && eventId !== 'new-event' && !eventId.startsWith('temp-')) {
    const { data: event } = await (supabase.from('events') as any).select('host_id').eq('id', eventId).single()
    if (event) {
      const { data: host } = await (supabase.from('host_profiles') as any).select('user_id').eq('id', event.host_id).single()
      if (!host || host.user_id !== user.id) return { error: 'Unauthorized' }
    }
  }

  try {
    const res = await deleteFromCloudinary(url)
    return { success: true, result: res }
  } catch (err: any) {
    console.error('deleteImageAction error:', err)
    return { error: 'Deletion failed' }
  }
}

export async function updateEventStatusAction(eventId: string, status: string) {
  const supabase = await createClient()
  const { error } = await (supabase.from('events') as any).update({ status: status as any } as any).eq('id', eventId)
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

  // Ownership check
  const { data: event, error: fetchError } = await (supabase.from('events') as any)
    .select('host_id, status')
    .eq('id', eventId)
    .single()

  if (fetchError || !event) {
    return { error: 'Event not found' }
  }

  const { data: pageData } = await (supabase.from('host_profiles') as any)
    .select('user_id')
    .eq('id', (event as any).host_id)
    .single()

  if (!pageData || (pageData as any).user_id !== user.id) {
    return { error: 'Unauthorized' }
  }

  try {
    // 1. Check for bookings
    const { count, error: countError } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)

    if (countError) throw countError

    if (count && count > 0) {
      // Soft delete: set status to 'cancelled' so bookings remains valid
      const { error: cancelError } = await supabase
        .from('events')
        .update({ status: 'cancelled' })
        .eq('id', eventId)
      
      if (cancelError) throw cancelError
      revalidatePath('/host-dashboard')
      return { success: true, message: 'Event has bookings, so it was marked as Cancelled instead of deleted.' }
    }

    // 2. Hard delete (safe because no bookings exist)
    const { error: deleteError } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)

    if (deleteError) {
      // If still fails due to unknown constraints, fallback to cancelled
      await supabase.from('events').update({ status: 'cancelled' }).eq('id', eventId)
      return { success: true, message: 'Event was marked as Cancelled due to database constraints.' }
    }

    revalidatePath('/host-dashboard')
    return { success: true }
    
  } catch (err: any) {
    console.error('deleteEventAction error:', err)
    return { error: err.message || 'Failed to delete event' }
  }
}

export async function createEventFeeOrderAction(eventId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: event } = await (supabase.from('events') as any).select('host_id, creation_fee_paid').eq('id', eventId).single()
  
  if (!event) return { error: 'Event not found' }
  if (event.creation_fee_paid) return { error: 'Fee already paid' }

  // Check ownership
  const { data: pageData } = await (supabase.from('host_profiles') as any).select('user_id').eq('id', event.host_id).single()
  if (!pageData || pageData.user_id !== user.id) return { error: 'Unauthorized' }

  const amount = 199 // Rs. 199

  try {
    const order = await createRazorpayOrder({
      amount: amount * 100, // paisa
      currency: 'INR',
      receipt: `event_fee_${eventId.substring(0, 8)}`
    })

    return {
      success: true,
      orderId: order.id,
      amount: amount * 100,
      keyId: env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    }
  } catch (err: any) {
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

  const supabase = await createClient()
  
  const { error: updateError } = await (supabase.from('events') as any)
    .update({ 
      creation_fee_paid: true, 
      creation_fee_payment_id: paymentDetails.razorpay_payment_id,
      status: 'published' 
    })
    .eq('id', eventId)

  if (updateError) {
    console.error('Failed to update event fee status', updateError)
    return { error: 'Failed to publish event. Please contact support.' }
  }

  revalidatePath('/host-dashboard')
  return { success: true }
}

export async function getEventDetailsAction(eventId: string) {
  const supabase = await createClient()
  
  const { data: event, error } = await supabase
    .from('events')
    .select(`
      *,
      category:categories(id, name),
      location:locations(*),
      ticket_tiers(*)
    `)
    .eq('id', eventId)
    .single()

  if (error) {
    console.error('getEventDetailsAction error:', error)
    return { error: 'Event not found' }
  }

  return { success: true, event }
}
