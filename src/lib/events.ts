import { createServerClient } from './supabaseClient';

export interface Event {
    id: string;
    host_id: string;
    category_id: string;
    location_id: string | null;
    title: string;
    slug: string | null;
    description: string | null;
    short_description: string | null;
    cover_image_url: string | null;
    vertical_poster_url: string | null;
    event_type: 'in_person' | 'online' | 'hybrid';
    status: 'draft' | 'published' | 'cancelled' | 'completed' | 'suspended' | 'under_review';
    start_datetime: string;
    end_datetime: string;
    timezone: string;
    max_capacity: number | null;
    booking_count: number;
    // Joined location fields
    city?: string;
    venue_name?: string;
    full_address?: string;
    min_price?: number;
    max_price?: number;
    category_name?: string;
    category_color?: string;
    // Legacy fields used by PaymentModal & EventDetailsPage
    event_name?: string;
    discounted_price?: number;
    regular_price?: number;
    discount_rate?: number;
    image_url?: string;
    short_address?: string;
    start_date?: string;
    end_date?: string;
    start_time?: string;
    end_time?: string;
    available_seats?: number;
    booked_spots?: number;
    about?: string;
    google_map_link?: string;
    organizer_name?: string;
    organizer_email?: string;
    organizer_phone?: string;
    whatsapp_link?: string;
    country?: string;
    host_display_name?: string;
    host_logo?: string;
    host_username?: string;
    host_profile_id?: string;
    category_slug?: string;
    likes_count?: number;
    interests_count?: number;
    views_count?: number;
    is_featured?: boolean | null;
    is_sponsored?: boolean | null;
}

// PaymentDetail interface (renamed from Booking)
export interface PaymentDetail {
    id: string;
    event_id: string;
    user_id: string | null;
    guest_email: string | null;
    guest_phone: string | null;
    spots_booked: number;
    amount_paid: number;
    payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
    created_at: string;
    updated_at: string;
}

// Keep Booking as alias for backward compatibility
export type Booking = PaymentDetail;

// Event status suggestion based on dates and capacity
export function calculateEventStatus(event: Event): string {
    if (event.status === 'cancelled') {
        return 'cancelled';
    }

    const now = new Date();
    const endDate = new Date(event.end_datetime);

    if (endDate < now) {
        return 'completed';
    }

    if (event.max_capacity && event.booking_count >= event.max_capacity) {
        return 'completed'; // or 'sold_out' if we had that status
    }

    return event.status;
}

export function formatEventPrice(minPrice?: number): string {
    if (!minPrice || minPrice === 0) {
        return 'Free';
    }
    return `₹${minPrice.toFixed(0)}`;
}

export function formatEventDate(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
    };

    if (startDate === endDate) {
        return start.toLocaleDateString('en-IN', options);
    }

    return `${start.toLocaleDateString('en-IN', options)} - ${end.toLocaleDateString('en-IN', options)}`;
}

export function formatEventTime(startTime: string, endTime: string): string {
    const formatTime = (timeStr: string): string => {
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
}

export function getSpotsLabel(event: Event): string {
    if (!event.max_capacity) return 'Open';
    
    const remaining = event.max_capacity - event.booking_count;

    if (remaining <= 0) {
        return 'Sold Out';
    }

    if (remaining <= 3) {
        return 'Few Left';
    }

    if (remaining <= event.max_capacity * 0.2) {
        return 'Filling Fast';
    }

    if (remaining <= event.max_capacity * 0.5) {
        return 'Limited Spots';
    }

    return 'Open';
}

// Database query functions
export async function getEventsByCity(city: string): Promise<Event[]> {
    const supabase = createServerClient();

    const { data, error } = await supabase
        .from('events')
        .select(`
            *,
            vertical_poster_url,
            location:locations (*)
        `)
        .ilike('location.city', `%${city}%`)
        .eq('status', 'published')
        .gte('start_datetime', new Date().toISOString())
        .order('start_datetime', { ascending: true });

    if (error) {
        console.error('Error fetching events by city:', error);
        return [];
    }

    // Flatten location fields for easier usage in legacy components
    return (data || []).map(event => ({
        ...event,
        city: (event.location as any)?.city,
        venue_name: (event.location as any)?.venue_name,
        full_address: `${(event.location as any)?.address_line1 || ''} ${(event.location as any)?.address_line2 || ''}`.trim()
    })) as unknown as Event[];
}

export async function getAllLiveEvents(): Promise<Event[]> {
    const supabase = createServerClient();

    const { data, error } = await supabase
        .from('events')
        .select(`
            *,
            vertical_poster_url,
            location:locations (*)
        `)
        .eq('status', 'published')
        .gte('end_datetime', new Date().toISOString())
        .order('start_datetime', { ascending: true });

    if (error) {
        console.error('Error fetching all live events:', error);
        return [];
    }

    // Flatten location fields
    return (data || []).map(event => ({
        ...event,
        city: (event.location as any)?.city,
        venue_name: (event.location as any)?.venue_name,
        full_address: `${(event.location as any)?.address_line1 || ''} ${(event.location as any)?.address_line2 || ''}`.trim()
    })) as unknown as Event[];
}

export async function getEventById(id: string): Promise<Event | null> {
    const supabase = createServerClient();

    const { data, error } = await supabase
        .from('events')
        .select(`
            *,
            location:locations (
                city,
                venue_name,
                address_line1,
                address_line2,
                vertical_poster_url
            )
        `)
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching event by id:', error);
        return null;
    }

    if (!data) return null;

    return {
        ...data,
        city: (data.location as any)?.city,
        venue_name: (data.location as any)?.venue_name,
        full_address: `${(data.location as any)?.address_line1 || ''} ${(data.location as any)?.address_line2 || ''}`.trim()
    } as unknown as Event;
}

// Public event query - only returns 'live' or 'closed' events (not 'cancelled')
// This prevents unauthorized access to cancelled events via direct URL
export async function getPublicEventById(id: string): Promise<Event | null> {
    const supabase = createServerClient();

    const { data, error } = await supabase
        .from('events')
        .select(`
            *,
            vertical_poster_url,
            location:locations (*)
        `)
        .eq('id', id)
        .in('status', ['published', 'completed'])
        .single();

    if (error) {
        console.error('Error fetching public event by id:', error);
        return null;
    }

    if (!data) return null;

    return {
        ...data,
        city: (data.location as any)?.city,
        venue_name: (data.location as any)?.venue_name,
        full_address: `${(data.location as any)?.address_line1 || ''} ${(data.location as any)?.address_line2 || ''}`.trim()
    } as unknown as Event;
}

// Public event query by slug - only returns 'live' or 'closed' events (not 'cancelled')
// This is the preferred method for public URLs as slugs are SEO-friendly
// Also supports UUID fallback for backward compatibility (if slug not found and param looks like UUID, try querying by id)
export async function getPublicEventBySlug(slug: string): Promise<Event | null> {
    const supabase = createServerClient();

    if (!slug) {
        console.error('getPublicEventBySlug: slug is empty or undefined');
        return null;
    }

    const { data, error } = await supabase
        .from('events')
        .select(`
            *,
            vertical_poster_url,
            location:locations (*)
        `)
        .eq('slug', slug)
        .in('status', ['published', 'completed'])
        .single();

    if (error) {
        if (error.code !== 'PGRST116') {
            console.error('Error fetching public event by slug:', error);
        }
        return null;
    }

    if (!data) return null;

    return {
        ...data,
        city: (data.location as any)?.city,
        venue_name: (data.location as any)?.venue_name,
        full_address: `${(data.location as any)?.address_line1 || ''} ${(data.location as any)?.address_line2 || ''}`.trim()
    } as unknown as Event;
}

export async function createBooking(bookingData: {
    event_id: string;
    user_id?: string | null;
    guest_email?: string | null;
    guest_phone?: string | null;
    spots_booked: number;
    amount_paid: number;
    payment_status?: 'pending' | 'completed' | 'failed' | 'refunded';
}): Promise<PaymentDetail | null> {
    const supabase = createServerClient();

    const { data, error } = await supabase
        .from('payment_details')
        .insert({
            event_id: bookingData.event_id,
            user_id: bookingData.user_id || null,
            guest_email: bookingData.guest_email || null,
            guest_phone: bookingData.guest_phone || null,
            spots_booked: bookingData.spots_booked,
            amount_paid: bookingData.amount_paid,
            payment_status: bookingData.payment_status || 'pending',
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating payment detail:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        });
        return null;
    }

    // NOTE: Do NOT increment booked_spots here
    // Seats will be incremented only after successful payment verification via webhook
    // This prevents race conditions and ensures payment is confirmed before booking seats

    return data;
}
