'use server'

import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import Razorpay from 'razorpay'
import { env } from '@/lib/env'

export async function requestRefundAction(bookingRef: string, reason: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    // Fetch booking
    const { data: booking, error: bookingError } = await (supabase
      .from('bookings') as any)
      .select('*, events(start_datetime, refund_policy, refund_cutoff_hours)')
      .eq('booking_ref', bookingRef)
      .single()

    if (bookingError || !booking) {
      return { error: 'Booking not found' }
    }

    if (booking.user_id !== user.id) {
       return { error: 'Unauthorized' }
    }

    if (booking.status !== 'confirmed') {
      return { error: 'Only confirmed bookings can be refunded' }
    }

    if (booking.payment_status !== 'paid') {
      return { error: 'Booking is not paid' }
    }

    const event = booking.events as any

    if (event.refund_policy === 'no_refund') {
      return { error: 'This booking is non-refundable' }
    }

    const eventStart = new Date(event.start_datetime).getTime()
    const cutoffTime = eventStart - (event.refund_cutoff_hours || 0) * 60 * 60 * 1000

    if (Date.now() > cutoffTime) {
      return { error: 'Refund window closed' }
    }

    if (!booking.razorpay_payment_id) {
      return { error: 'No associated payment found' }
    }
    
    let razorpayRefundId = null

    try {
      const rzp = new Razorpay({
        key_id: env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        key_secret: env.RAZORPAY_KEY_SECRET
      })

      const refund = await rzp.payments.refund(booking.razorpay_payment_id, {
        amount: Math.round(Number(booking.total_amount) * 100),
        notes: {
          reason,
          booking_ref: bookingRef
        }
      })
      razorpayRefundId = refund.id
    } catch (rzpError: any) {
      console.error('Razorpay refund failed', rzpError)
      return { error: 'Payment gateway rejected the refund. Please contact support.' }
    }

    // Update bookings
    const { error: updateError } = await (supabaseAdmin
      .from('bookings') as any)
      .update({
        status: 'refunded',
        payment_status: 'refunded',
        refund_amount: booking.total_amount,
        refunded_at: new Date().toISOString(),
        cancellation_reason: reason
      })
      .eq('id', booking.id)

    if (updateError) {
      console.error('Failed to update booking status', updateError)
    }

    // Void tickets
    await (supabaseAdmin
      .from('tickets') as any)
      .update({ is_void: true, voided_reason: 'Refund requested: ' + reason })
      .eq('booking_id', booking.id)

    // Re-release inventory
    const { data: items } = await (supabaseAdmin
      .from('booking_items') as any)
      .select('ticket_tier_id, quantity')
      .eq('booking_id', booking.id)

    if (items) {
      for (const item of items) {
        const { data: tier } = await (supabaseAdmin
          .from('ticket_tiers') as any)
          .select('sold_count')
          .eq('id', item.ticket_tier_id)
          .single()
          
        if (tier) {
          await (supabaseAdmin
            .from('ticket_tiers') as any)
            .update({ sold_count: Math.max(0, (tier as any).sold_count - item.quantity) })
            .eq('id', item.ticket_tier_id)
        }
      }
    }

    // Audit log
    await (supabaseAdmin.from('audit_logs') as any).insert({
      actor_id: user.id,
      action: 'booking.refunded',
      entity_type: 'booking',
      entity_id: booking.id,
      metadata: { reason, refundId: razorpayRefundId }
    })

    return { success: true }

  } catch (error: any) {
    console.error('Refund Error', error)
    return { error: error.message || 'Unexpected error' }
  }
}
