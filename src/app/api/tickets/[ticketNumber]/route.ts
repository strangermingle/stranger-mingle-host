import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticketNumber: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { ticketNumber } = await params

    const { data: ticketResult, error } = await (supabase
      .from('tickets') as any)
      .select(`
        ticket_number,
        holder_name,
        is_checked_in,
        bookings!inner (
          user_id
        ),
        events (
          title,
          start_datetime
        )
      `)
      .eq('ticket_number', ticketNumber)
      .single()

    if (error || !ticketResult) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Verify ownership
    const ticket = ticketResult as unknown as {
      ticket_number: string
      holder_name: string | null
      is_checked_in: boolean
      bookings: { user_id: string }
      events: { title: string; start_datetime: string } | null
    }

    if (ticket.bookings?.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const result = {
      ticket_number: ticket.ticket_number,
      event_title: ticket.events?.title,
      start_datetime: ticket.events?.start_datetime,
      holder_name: ticket.holder_name,
      is_checked_in: ticket.is_checked_in
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
