import { supabaseAdmin } from '@/lib/supabase/admin'
import crypto from 'crypto'
import { env } from '@/lib/env'

export async function handlePaymentCaptured(payload: any) {
  const { payment, order } = payload.payment.entity
  const razorpay_order_id = payload.order.entity.id
  const razorpay_payment_id = payload.payment.entity.id
  const razorpay_signature = 'webhook_captured' // Webhooks don't provide the same signature as client-side, we use a placeholder or verify via webhook secret
  
  // 1. Fetch booking
  const { data: booking, error: fetchError } = await (supabaseAdmin
    .from('bookings') as any)
    .select('id, status, booking_ref, user_id')
    .eq('razorpay_order_id', razorpay_order_id)
    .single()

  if (fetchError || !booking) {
    throw new Error(`Booking for order ${razorpay_order_id} not found`)
  }

  // 2. If already confirmed, nothing to do
  if (booking.status === 'confirmed') {
    return { success: true, message: 'Already confirmed' }
  }

  // 3. Atomically confirm via RPC v2
  const { data: tickets, error: rpcError } = await supabaseAdmin.rpc('confirm_booking_payment_v2', {
    p_booking_id: booking.id,
    p_razorpay_payment_id: razorpay_payment_id,
    p_razorpay_signature: razorpay_signature,
    p_razorpay_method: payload.payment.entity.method || 'online'
  } as any)

  if (rpcError || !tickets) {
    console.error('Webhook RPC Error:', rpcError)
    throw new Error('Failed to confirm booking via webhook')
  }

  // 4. Sign tickets with HMAC (reusing logic from server action)
  const secret = env.RAZORPAY_KEY_SECRET
  for (const ticket of (tickets as any[])) {
    const payloadData = {
      ticketId: ticket.r_ticket_id,
      eventId: ticket.r_event_id,
      bookingRef: booking.booking_ref
    }
    
    const qrContent = JSON.stringify(payloadData)
    const signedQr = crypto
      .createHmac('sha256', secret)
      .update(qrContent)
      .digest('hex')
    
    const finalQrData = `${qrContent}|${signedQr}`

    await (supabaseAdmin
      .from('tickets') as any)
      .update({ qr_code_data: finalQrData })
      .eq('id', ticket.r_ticket_id)
  }

  return { success: true, bookingId: booking.id }
}

export async function handlePaymentFailed(payload: any) {
  const razorpay_order_id = payload.order.entity.id
  
  const { error } = await (supabaseAdmin
    .from('bookings') as any)
    .update({ 
      status: 'cancelled', // Or a dedicated 'failed' status if added to schema
      payment_status: 'failed',
      updated_at: new Date().toISOString()
    })
    .eq('razorpay_order_id', razorpay_order_id)
    .eq('status', 'pending')

  if (error) throw error
  return { success: true }
}

export async function handleRefundCreated(payload: any) {
  const { payment_id, amount, status } = payload.refund.entity
  
  const { error } = await (supabaseAdmin
    .from('bookings') as any)
    .update({ 
      status: 'refunded',
      payment_status: 'refunded',
      updated_at: new Date().toISOString()
      // Note: we could add refund_amount column here if it exists in schema
    })
    .eq('razorpay_payment_id', payment_id)

  if (error) throw error
  return { success: true }
}

export async function handleRefundProcessed(payload: any) {
  const { payment_id } = payload.refund.entity
  
  const { error } = await (supabaseAdmin
    .from('bookings') as any)
    .update({ 
      status: 'refunded',
      payment_status: 'refunded',
      updated_at: new Date().toISOString()
    })
    .eq('razorpay_payment_id', payment_id)

  if (error) throw error
  return { success: true }
}

export async function handleSubscriptionCharged(payload: any) {
  const { subscription, payment } = payload
  const razorpay_subscription_id = subscription.entity.id
  const razorpay_payment_id = payment.entity.id
  const amount = payment.entity.amount / 100 // Convert from paise
  
  // Calculate new ends_at based on Razorpay's current_end
  // Razorpay provides 'current_end' timestamp in the subscription entity (seconds)
  const currentEnd = subscription.entity.current_end 
  const endsAt = new Date(currentEnd * 1000).toISOString()
  const startsAt = new Date(subscription.entity.current_start * 1000).toISOString()

  // 1. Fetch existing subscription to verify host_id and user_id
  const { data: existingSub, error: fetchError } = await (supabaseAdmin
    .from('subscriptions') as any)
    .select('user_id, host_id, plan_type')
    .eq('razorpay_subscription_id', razorpay_subscription_id)
    .maybeSingle()

  if (fetchError) throw fetchError

  if (!existingSub) {
    // This might be the first charge where the webhook arrives before client-side redirection
    if (subscription.entity.notes?.host_id && subscription.entity.notes?.user_id) {
       console.log(`Creating missing subscription record from webhook notes for ${razorpay_subscription_id}`)
       
       const { error: insertError } = await (supabaseAdmin
         .from('subscriptions') as any)
         .insert({
           user_id: subscription.entity.notes.user_id,
           host_id: subscription.entity.notes.host_id,
           plan_type: subscription.entity.notes.plan_type || 'monthly',
           amount: amount,
           currency: 'INR',
           status: 'active',
           starts_at: startsAt,
           ends_at: endsAt,
           razorpay_subscription_id: razorpay_subscription_id,
           razorpay_payment_id: razorpay_payment_id,
           updated_at: new Date().toISOString()
         })
       
       if (insertError) throw insertError
       return { success: true, message: 'Subscription created from notes' }
    }

    console.warn(`No existing subscription found for ${razorpay_subscription_id} and no notes available.`)
    return { success: false, message: 'Subscription not found in DB' }
  }

  // 2. Update the existing subscription record
  const { error: updateError } = await (supabaseAdmin
    .from('subscriptions') as any)
    .update({
      status: 'active',
      ends_at: endsAt,
      starts_at: startsAt,
      razorpay_payment_id: razorpay_payment_id,
      updated_at: new Date().toISOString()
    })
    .eq('razorpay_subscription_id', razorpay_subscription_id)

  if (updateError) throw updateError

  return { success: true }
}

export async function handleSubscriptionCancelled(payload: any) {
  const { subscription } = payload
  const razorpay_subscription_id = subscription.entity.id

  const { error } = await (supabaseAdmin
    .from('subscriptions') as any)
    .update({ 
      status: 'cancelled',
      updated_at: new Date().toISOString()
    })
    .eq('razorpay_subscription_id', razorpay_subscription_id)

  if (error) throw error
  return { success: true }
}

export async function handleSubscriptionHalted(payload: any) {
  const { subscription } = payload
  const razorpay_subscription_id = subscription.entity.id

  const { error } = await (supabaseAdmin
    .from('subscriptions') as any)
    .update({ 
      status: 'halted',
      updated_at: new Date().toISOString()
    })
    .eq('razorpay_subscription_id', razorpay_subscription_id)

  if (error) throw error
  return { success: true }
}
