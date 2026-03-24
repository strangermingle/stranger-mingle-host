'use client'

import { useState, useEffect } from 'react'
import { QrCode, List, ChevronLeft, Search, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { CompactTicketScanner } from '@/components/members/attendance/CompactTicketScanner'
import { ManualTicketList } from '@/components/members/attendance/ManualTicketList'
import { toast } from 'sonner'

interface AttendanceTabProps {
  userId: string
  defaultMode?: 'auto' | 'manual' | null
  defaultEventId?: string | null
}

interface EventShort {
  id: string
  title: string
  start_datetime: string
}

export function AttendanceTab({ userId, defaultMode = null, defaultEventId = null }: AttendanceTabProps) {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(defaultEventId)
  const [events, setEvents] = useState<EventShort[]>([])
  const [mode, setMode] = useState<'auto' | 'manual' | null>(defaultMode)
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchHostEvents() {
      try {
        setLoading(true)
        // 1. Fetch host profile for the current user
        const { data: hostProfile, error: profileError } = await supabase
          .from('host_profiles')
          .select('id')
          .eq('user_id', userId)
          .single()

        if (profileError || !hostProfile) {
          console.error('No host profile found for user:', userId)
          setLoading(false)
          return
        }

        const hostProfileId = hostProfile.id

        // 2. Fetch upcoming published events where profile is host
        const now = new Date().toISOString()
        const { data: hostEvents, error: hostError } = await supabase
          .from('events')
          .select('id, title, start_datetime')
          .eq('host_id', hostProfileId)
          .eq('status', 'published')
          .gte('start_datetime', now)
          .order('start_datetime', { ascending: true })

        // 3. Fetch events where user is co-host (uses user_id)
        const { data: cohostEvents, error: cohostError } = await supabase
          .from('event_cohosts')
          .select('event_id, events(id, title, start_datetime)')
          .eq('host_user_id', userId)
          .eq('is_confirmed', true)

        if (hostError || cohostError) throw hostError || cohostError

        const allEvents = [
          ...(hostEvents || []),
          ...(cohostEvents?.map(ce => ce.events).filter(Boolean) as any[] || [])
        ]
        
        // De-duplicate
        const uniqueEvents = Array.from(new Map(allEvents.map(e => [e.id, e])).values())
        setEvents(uniqueEvents)
        
        if (uniqueEvents.length === 1) {
          setSelectedEventId(uniqueEvents[0].id)
        }
      } catch (err) {
        console.error('Error fetching events:', err)
        toast.error('Failed to load events')
      } finally {
        setLoading(false)
      }
    }

    fetchHostEvents()
  }, [userId, supabase])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-4 w-4 animate-spin text-gray-400 text-gray-500" />
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="py-12 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
        <p className="text-gray-500 font-regular uppercase tracking-widest text-sm">No Events Found to Manage</p>
      </div>
    )
  }

  if (mode === 'auto') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest  border-l-4 border-amber-500 pl-4">
            Attendance: QR Scanner
          </h2>
        </div>
        <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
           <CompactTicketScanner eventId={null} />
        </div>
      </div>
    )
  }

  // Manual Mode: Accordion List of Events
  if (mode === 'manual' || defaultMode === 'manual') {
    return (
      <div className="space-y-2">
        <h2 className="text-xl font-regular text-gray-900 uppercase tracking-widest  border-l-4 border-amber-500 pl-4">
          Guest List: Upcoming Events
        </h2>
        
        <div className="space-y-2">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-[1rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <button
                onClick={() => setExpandedEventId(expandedEventId === event.id ? null : event.id)}
                className="w-full flex items-center justify-between p-4 text-left group"
              >
                <div>
                  <h3 className="font-regular text-lg text-gray-900 group-hover:text-amber-600 transition-colors uppercase tracking-tight">{event.title}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-[10px] font-regular text-gray-700 uppercase tracking-widest">
                      {new Date(event.start_datetime).toLocaleDateString(undefined, { dateStyle: 'full' })}
                    </p>
                    <span className="h-1 w-1 bg-gray-200 rounded-full" />
                    <p className="text-[10px] font-regular text-gray-700 uppercase tracking-widest">
                       {new Date(event.start_datetime).toLocaleTimeString(undefined, { timeStyle: 'short' })}
                    </p>
                  </div>
                </div>
                <div className={`p-2 rounded-2xl transition-all ${expandedEventId === event.id ? 'bg-amber-100 text-amber-600 rotate-180' : 'bg-gray-50 text-gray-400'}`}>
                   <ChevronLeft className="h-3 w-3 rotate-270" />
                </div>
              </button>

              {expandedEventId === event.id && (
                <div className="p-2 pt-0 border-t border-gray-50 bg-gray-50/30">
                  <ManualTicketList eventId={event.id} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return null
}
