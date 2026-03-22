import { createServerClient } from './supabaseClient';
import { getEventById } from './events';

export type PaymentProcessingResult = {
    success: boolean;
    error?: string;
    isAlreadyProcessed?: boolean;
    bookingId?: string;
};

export async function processPaymentSuccess({
    paymentRequestId,
    paymentId,
    amount,
    userId,
}: {
    paymentRequestId: string;
    paymentId: string;
    amount: number;
    userId?: string | null;
}): Promise<PaymentProcessingResult> {
    const supabase = createServerClient();

    try {
        // Find the booking record by razorpay_order_id
        const { data: booking, error: fetchError } = await supabase
            .from('bookings')
            .select('*')
            .eq('razorpay_order_id', paymentRequestId)
            .single();

        if (fetchError || !booking) {
            console.error('Booking not found for order:', paymentRequestId);
            return {
                success: false,
                error: 'Booking not found'
            };
        }

        // Check if already processed
        if (booking.payment_status === 'paid' || booking.status === 'confirmed') {
            return {
                success: true,
                isAlreadyProcessed: true,
                bookingId: booking.id
            };
        }

        // Verify amount matches
        if (!Number.isNaN(amount) && Math.abs(booking.total_amount - amount) > 0.01) {
            console.error('Amount mismatch:', booking.total_amount, amount);
            return {
                success: false,
                error: 'Amount mismatch'
            };
        }

        // Get event to check availability
        const event = await getEventById(booking.event_id);
        if (!event) {
            console.error('Event not found for payment:', booking.event_id);
            return {
                success: false,
                error: 'Event not found'
            };
        }

        // Check availability
        if ((event.available_seats || 0) <= (event.booked_spots || 0)) {
            console.error('Event sold out, cannot complete payment:', booking.event_id);
            // Update status to failed
            await supabase
                .from('bookings')
                .update({
                    status: 'cancelled',
                    payment_status: 'failed',
                    razorpay_payment_id: paymentId || null,
                })
                .eq('id', booking.id)
                .eq('status', 'pending');

            return {
                success: false,
                error: 'Event sold out'
            };
        }

        // OPTIMISTIC LOCKING: Try to set status to confirmed
        const { data: updatedBooking, error: claimError } = await supabase
            .from('bookings')
            .update({
                status: 'confirmed',
                payment_status: 'paid',
                razorpay_payment_id: paymentId || null,
                user_id: userId || booking.user_id,
                updated_at: new Date().toISOString(),
                paid_at: new Date().toISOString(),
            })
            .eq('id', booking.id)
            .eq('status', 'pending')
            .select()
            .single();

        if (claimError) {
            if (claimError.code === 'PGRST116' || !updatedBooking) {
                const { data: confirmData } = await supabase
                    .from('bookings')
                    .select('status')
                    .eq('id', booking.id)
                    .single();

                if (confirmData?.status === 'confirmed') {
                    return {
                        success: true,
                        isAlreadyProcessed: true,
                        bookingId: booking.id
                    };
                }

                return {
                    success: false,
                    error: 'Booking processing race condition failed'
                };
            }

            console.error('Error updating booking:', claimError);
            return {
                success: false,
                error: 'Failed to update booking record'
            };
        }

        // Update spots
        const { error: rpcError } = await supabase.rpc(
            'increment_booked_spots_safe',
            {
                p_event_id: booking.event_id,
                p_spots: booking.spots_booked || 1, // Fallback to 1 if not specified
            }
        );

        if (rpcError) {
            console.error('CRITICAL: Payment completed but failed to increment spots:', rpcError);
            return {
                success: true,
                bookingId: booking.id,
                error: 'Payment successful but spot increment warning'
            };
        }

        return {
            success: true,
            bookingId: booking.id
        };

    } catch (error: any) {
        console.error('Error processing payment success:', error);
        return {
            success: false,
            error: error?.message || 'Internal processing error'
        };
    }
}
