-- Migration: Razorpay Booking & Payment RPCs
-- This migration adds the missing atomic functions for the booking system.

BEGIN;

-- 1. Function to increment reserved count safely
CREATE OR REPLACE FUNCTION increment_reserved_count(tier_id UUID, increment_by INT)
RETURNS void AS $$
BEGIN
  UPDATE ticket_tiers
  SET 
    reserved_count = COALESCE(reserved_count, 0) + increment_by,
    updated_at = NOW()
  WHERE id = tier_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Function to confirm booking payment atomically (V2)
-- This function confirms the booking, updates payment status, and generates tickets.
CREATE OR REPLACE FUNCTION confirm_booking_payment_v2(
  p_booking_id UUID,
  p_razorpay_payment_id TEXT,
  p_razorpay_signature TEXT,
  p_razorpay_method TEXT DEFAULT 'online'
)
RETURNS TABLE (r_ticket_id UUID, r_event_id UUID) AS $$
DECLARE
  v_event_id UUID;
  v_user_id UUID;
  v_booking_status TEXT;
  v_ticket_tier_record RECORD;
BEGIN
  -- 1. Initial checks & locking
  SELECT event_id, user_id, status 
  INTO v_event_id, v_user_id, v_booking_status
  FROM bookings 
  WHERE id = p_booking_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;

  IF v_booking_status = 'confirmed' THEN
    -- Idempotent: return existing tickets
    RETURN QUERY SELECT id as r_ticket_id, event_id as r_event_id FROM tickets WHERE booking_id = p_booking_id;
    RETURN;
  END IF;

  -- 2. Update booking status
  UPDATE bookings
  SET 
    status = 'confirmed',
    payment_status = 'paid',
    razorpay_payment_id = p_razorpay_payment_id,
    razorpay_signature = p_razorpay_signature,
    payment_method = p_razorpay_method,
    confirmed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_booking_id;

  -- 3. Move items from reserved -> sold & Generate tickets
  FOR v_ticket_tier_record IN 
    SELECT bi.ticket_tier_id, bi.quantity, tt.event_id 
    FROM booking_items bi
    JOIN ticket_tiers tt ON tt.id = bi.ticket_tier_id
    WHERE bi.booking_id = p_booking_id
  LOOP
    -- Update tier counts
    UPDATE ticket_tiers
    SET 
      sold_count = COALESCE(sold_count, 0) + v_ticket_tier_record.quantity,
      reserved_count = GREATEST(0, COALESCE(reserved_count, 0) - v_ticket_tier_record.quantity),
      updated_at = NOW()
    WHERE id = v_ticket_tier_record.ticket_tier_id;

    -- Create individual tickets
    FOR i IN 1..v_ticket_tier_record.quantity LOOP
      INSERT INTO tickets (
        booking_id,
        event_id,
        user_id,
        ticket_tier_id,
        ticket_number,
        status
      ) VALUES (
        p_booking_id,
        v_event_id,
        v_user_id,
        v_ticket_tier_record.ticket_tier_id,
        'TKT-' || UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 8)),
        'valid'
      ) RETURNING id INTO r_ticket_id;
      
      r_event_id := v_event_id;
      RETURN NEXT;
    END LOOP;
  END LOOP;

  -- Final audit (optional, done in code too)
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Atomic booking cancellation
CREATE OR REPLACE FUNCTION cancel_booking_atomic(
  p_booking_id UUID,
  p_user_id UUID
)
RETURNS void AS $$
DECLARE
  v_ticket_tier_record RECORD;
BEGIN
  -- Update booking status
  UPDATE bookings
  SET 
    status = 'cancelled',
    updated_at = NOW()
  WHERE id = p_booking_id AND user_id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found or unauthorized';
  END IF;

  -- Restore ticket counts
  FOR v_ticket_tier_record IN SELECT ticket_tier_id, quantity FROM booking_items WHERE booking_id = p_booking_id LOOP
    UPDATE ticket_tiers
    SET 
      sold_count = GREATEST(0, COALESCE(sold_count, 0) - v_ticket_tier_record.quantity),
      updated_at = NOW()
    WHERE id = v_ticket_tier_record.ticket_tier_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Atomic Waitlist Join
CREATE OR REPLACE FUNCTION join_waitlist_atomic(
  p_event_id UUID,
  p_tier_id UUID,
  p_user_id UUID
)
RETURNS TABLE (r_position INT, r_status TEXT, r_was_already_on_list BOOLEAN) AS $$
DECLARE
  v_existing_position INT;
BEGIN
  -- Check if already on waitlist
  SELECT w_position 
  INTO v_existing_position
  FROM event_waitlist 
  WHERE event_id = p_event_id AND ticket_tier_id = p_tier_id AND user_id = p_user_id;

  IF FOUND THEN
    RETURN QUERY SELECT v_existing_position, 'waiting'::TEXT, TRUE;
    RETURN;
  END IF;

  -- Get next position
  SELECT COALESCE(MAX(w_position), 0) + 1 
  INTO r_position
  FROM event_waitlist
  WHERE event_id = p_event_id AND ticket_tier_id = p_tier_id;

  INSERT INTO event_waitlist (
    event_id,
    ticket_tier_id,
    user_id,
    w_position,
    status
  ) VALUES (
    p_event_id,
    p_tier_id,
    p_user_id,
    r_position,
    'waiting'
  );

  RETURN QUERY SELECT r_position, 'waiting'::TEXT, FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
