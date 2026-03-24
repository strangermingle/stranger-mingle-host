'use client'

import { useState, useEffect } from 'react'
import { Search, User, Phone, CheckCircle2, Loader2, XCircle, Calendar } from 'lucide-react'
import { getEventTicketsAction, getAllHostTicketsAction, processAttendanceAction } from '@/actions/attendance.actions'
import { TicketDetailView } from '@/components/members/attendance/TicketDetailView'
import { toast } from 'sonner'

interface ManualTicketListProps {
  eventId?: string | null
}

export function ManualTicketList({ eventId }: ManualTicketListProps) {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [processing, setProcessing] = useState<{ id: string; action: 'allowed' | 'denied' } | null>(null)
  const [denyingId, setDenyingId] = useState<string | null>(null)
  const [denialReason, setDenialReason] = useState('')

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const result = eventId 
        ? await getEventTicketsAction(eventId)
        : await getAllHostTicketsAction()
        
      if (result.status === 'success') {
        setTickets(result.tickets || [])
      } else {
        toast.error((result as any).message)
      }
    } catch (err) {
      toast.error('Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }

  const handleEntry = async (ticketId: string, status: 'allowed' | 'denied', eventId: string, reason?: string) => {
    try {
      setProcessing({ id: ticketId, action: status })
      const res = await processAttendanceAction({
        ticketId,
        eventId,
        status,
        denialReason: reason
      })
      if (res.status === 'success') {
        toast.success(res.message)
        setDenyingId(null)
        setDenialReason('')
        fetchTickets() // Refresh list
      } else {
        toast.error(res.message)
      }
    } catch (err) {
      toast.error('Failed to process entry')
    } finally {
      setProcessing(null)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [eventId])

  const filteredTickets = tickets.filter(t => {
    const searchLower = search.toLowerCase()
    return (
      t.ticket_number.toLowerCase().includes(searchLower) ||
      t.holder_name?.toLowerCase().includes(searchLower) ||
      t.bookings?.attendee_name?.toLowerCase().includes(searchLower) ||
      t.bookings?.attendee_email?.toLowerCase().includes(searchLower) ||
      t.bookings?.attendee_phone?.includes(search) ||
      t.events?.title?.toLowerCase().includes(searchLower)
    )
  })

  if (selectedTicket) {
    return (
      <TicketDetailView 
        ticket={selectedTicket} 
        onComplete={() => {
          setSelectedTicket(null)
          fetchTickets() // Refresh list
        }}
        onCancel={() => setSelectedTicket(null)}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by Name, Phone, or Ticket #..."
          className="w-full p-4 pl-12 rounded-2xl bg-gray-50 border border-gray-100 text-xs font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {filteredTickets.length > 0 ? (
            filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="w-full flex flex-col md:flex-row md:items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl hover:border-indigo-200 hover:shadow-md transition-all group text-left gap-4"
              >
                {/* Main Content: Info */}
                <div className="flex items-start w-full">
                  <div className="min-w-0 flex-1">
                    {/* Name */}
                    <p className="text-xs font-black text-gray-900 uppercase truncate">
                      {ticket.holder_name || ticket.bookings?.attendee_name || 'Anonymous'}
                    </p>
                    
                    {/* Vertical Info Stack for Mobile, Row for Tablet+ */}
                    <div className="flex flex-col gap-1 mt-1">
                      {/* Email */}
                      {ticket.bookings?.attendee_email && (
                        <div className="text-[10px] font-medium text-gray-900 flex items-center gap-1.5 lowercase">
                          <span className="h-1 w-1 bg-gray-300 rounded-full md:hidden" />
                          {ticket.bookings.attendee_email}
                        </div>
                      )}
                      
                      {/* Phone */}
                      {ticket.bookings?.attendee_phone && (
                        <div className="text-[10px] font-bold text-gray-900 flex items-center gap-1.5">
                          <Phone className="h-2.5 w-2.5 text-gray-300" />
                          {ticket.bookings.attendee_phone}
                        </div>
                      )}

                      {/* Ticket Number */}
                      <div className="text-[10px] font-black text-amber-600 flex items-center gap-1.5 uppercase tracking-wider">
                        <span className="text-gray-300 font-bold">#</span>
                        {ticket.ticket_number}
                      </div>

                      {/* Event Title (if global view) */}
                      {!eventId && ticket.events?.title && (
                        <span className="text-[8px] font-black text-indigo-400 flex items-center gap-1 uppercase tracking-tighter mt-1">
                          <Calendar className="h-2 w-2" /> {ticket.events.title}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions: Right on Desktop, Bottom on Mobile */}
                <div className="flex flex-col gap-2 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-gray-50">
                  {ticket.is_checked_in ? (
                    <div className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest w-full md:w-auto">
                       <CheckCircle2 className="h-3.5 w-3.5" />
                       Checked In
                    </div>
                  ) : ticket.is_void ? (
                    <div className="flex flex-col items-center justify-center gap-1 px-4 py-2 bg-rose-50 text-rose-700 rounded-xl w-full md:w-auto">
                       <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest">
                        <XCircle className="h-3.5 w-3.5" />
                        Denied
                       </div>
                       {ticket.voided_reason && (
                         <span className="text-[8px] font-bold opacity-60 lowercase italic truncate max-w-[120px]">{ticket.voided_reason}</span>
                       )}
                    </div>
                  ) : denyingId === ticket.id ? (
                    <div className="flex flex-col gap-2 w-full">
                      <input
                        type="text"
                        value={denialReason}
                        onChange={(e) => setDenialReason(e.target.value)}
                        placeholder="Reason for denial..."
                        className="w-full p-2 text-[10px] bg-gray-50 border border-rose-200 rounded-lg outline-none focus:ring-2 focus:ring-rose-500/20"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          disabled={!!processing}
                          onClick={() => handleEntry(ticket.id, 'denied', ticket.event_id, denialReason)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 disabled:opacity-50"
                        >
                          {processing?.id === ticket.id && processing?.action === 'denied' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                          Confirm Deny
                        </button>
                        <button
                          disabled={!!processing}
                          onClick={() => {
                            setDenyingId(null)
                            setDenialReason('')
                          }}
                          className="px-4 py-2 bg-gray-100 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2 w-full md:w-auto">
                      <button
                        disabled={!!processing}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEntry(ticket.id, 'allowed', ticket.event_id)
                        }}
                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors disabled:opacity-50"
                      >
                        {processing?.id === ticket.id && processing?.action === 'allowed' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                        Allow
                      </button>
                      <button
                        disabled={!!processing}
                        onClick={(e) => {
                          e.stopPropagation()
                          setDenyingId(ticket.id)
                        }}
                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Deny
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100">
              No matching tickets found
            </div>
          )}
        </div>
      )}
    </div>
  )
}
