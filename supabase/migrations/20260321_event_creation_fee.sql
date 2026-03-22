-- Migration to add event fee tracking to the events table

ALTER TABLE events
ADD COLUMN creation_fee_paid BOOLEAN DEFAULT false,
ADD COLUMN creation_fee_payment_id TEXT;
