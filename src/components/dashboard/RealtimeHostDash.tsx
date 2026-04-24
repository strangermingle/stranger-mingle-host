'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Heart, Star, Calendar, Users, Eye, Loader2, CheckCircle, XCircle, AlertCircle, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

interface RealtimeHostDashProps {
  userId: string
  pageId: string
  initialEvents: any[]
  initialStats: {
    totalEarnings: number
    totalBookings: number
    totalEngagement: number
    reviewCount: number
    profileViews: number
    followers: number
  }
  initialAttendees: any[]
  initialPayouts: any[]
}

export function RealtimeHostDash({ 
  userId, 
  pageId, 
  initialEvents, 
  initialStats, 
  initialAttendees, 
  initialPayouts 
}: RealtimeHostDashProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [events, setEvents] = useState(initialEvents)
  const [stats, setStats] = useState(initialStats)
  const [attendees, setAttendees] = useState(initialAttendees)
  const [payouts, setPayouts] = useState(initialPayouts)
  const [activeTab, setActiveTab] = useState<'events' | 'attendees' | 'earnings'>('events')
  const supabase = createClient()

  const refreshData = useCallback(async () => {
    // 1. Fetch updated events
    const { data: updatedEvents } = await supabase
      .from('events')
      .select('id, title, slug, status, start_datetime, booking_count, views_count, likes_count, interests_count')
      .eq('host_id', pageId)
      .order('start_datetime', { ascending: false })

    if (updatedEvents) {
      setEvents(updatedEvents)
      
      // 2. Recalculate stats based on updated events
      const totalBookings = updatedEvents.reduce((acc, curr) => acc + (curr.booking_count || 0), 0)
      const totalLikes = updatedEvents.reduce((acc, curr) => acc + (curr.likes_count || 0), 0)
      const totalInterests = updatedEvents.reduce((acc, curr) => acc + (curr.interests_count || 0), 0)
      
      setStats(prev => ({
        ...prev,
        totalBookings,
        totalEngagement: totalLikes + totalInterests
      }))
    }

    // 3. Fetch attendees
    const { data: updatedAttendees } = await supabase
      .from('bookings')
      .select('id, attendee_name, attendee_email, attendee_phone, booking_ref, status, created_at, event_id, events!inner(title)')
      .eq('events.host_id', pageId)
      .order('created_at', { ascending: false })
    
    if (updatedAttendees) {
      setAttendees(updatedAttendees)
    }

    // 4. Fetch payouts
    const { data: updatedPayouts } = await supabase
      .from('payouts')
      .select('*')
      .eq('host_id', userId)
      .order('created_at', { ascending: false })
    
    if (updatedPayouts) {
      setPayouts(updatedPayouts)
      const totalEarnings = updatedPayouts.reduce((acc, curr) => acc + (parseFloat(curr.net_amount as unknown as string) || 0), 0)
      setStats(prev => ({ ...prev, totalEarnings }))
    }

    // 5. Fetch host profile for followers
    const { data: profile } = await supabase
      .from('host_profiles')
      .select('follower_count')
      .eq('user_id', userId)
      .single()
    
    if (profile) {
      setStats(prev => ({
        ...prev,
        followers: profile.follower_count || 0
      }))
    }
  }, [userId, pageId, supabase])

  useEffect(() => {
    setIsMounted(true)
    if (typeof window === 'undefined') return

    const eventsChannel = supabase
      .channel('host-events-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
          filter: `host_id=eq.${userId}`
        },
        () => refreshData()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'host_profiles',
          filter: `user_id=eq.${userId}`
        },
        () => refreshData()
      )
      .on(
        'postgres_changes',
        {
           event: '*',
           schema: 'public',
           table: 'payouts',
           filter: `host_id=eq.${userId}`
        },
        () => refreshData()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(eventsChannel)
    }
  }, [userId, supabase, refreshData])

  return (
    <div className="space-y-12">
      {/* Analytics Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
         <div className="group rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-sm transition-all hover:border-indigo-100 hover:shadow-2xl hover:-translate-y-1">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Net Revenue</h3>
            <p className="mt-4 text-4xl font-black text-zinc-900  tracking-tighter">₹{stats.totalEarnings.toLocaleString()}</p>
            <div className="mt-6 flex items-center justify-between">
               <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">Liquidated</span>
               <ArrowUpRight className="h-4 w-4 text-gray-200 group-hover:text-indigo-400 transition-colors" />
            </div>
         </div>
         <div className="group rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-sm transition-all hover:border-indigo-100 hover:shadow-2xl hover:-translate-y-1">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Total Bookings</h3>
            <p className="mt-4 text-4xl font-black text-zinc-900  tracking-tighter">{stats.totalBookings}</p>
            <div className="mt-6 flex items-center justify-between">
               <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest">{events.length} Catalogues</span>
               <Users className="h-4 w-4 text-gray-200 group-hover:text-indigo-400 transition-colors" />
            </div>
         </div>
         <div className="group rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-sm transition-all hover:border-indigo-100 hover:shadow-2xl hover:-translate-y-1">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Social Pulse</h3>
            <p className="mt-4 text-4xl font-black text-zinc-900  tracking-tighter">{stats.totalEngagement}</p>
            <div className="mt-6 flex items-center justify-between">
               <span className="text-[9px] font-black text-rose-600 bg-rose-50 px-3 py-1 rounded-full uppercase tracking-widest">{stats.reviewCount || 0} Critical Reviews</span>
               <Heart className="h-4 w-4 text-gray-200 group-hover:text-rose-400 transition-colors" />
            </div>
         </div>
         <div className="group rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-sm transition-all hover:border-indigo-100 hover:shadow-2xl hover:-translate-y-1">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Network Reach</h3>
            <p className="mt-4 text-4xl font-black text-zinc-900  tracking-tighter">{stats.profileViews}</p>
            <div className="mt-6 flex items-center justify-between">
               <span className="text-[9px] font-black text-zinc-600 bg-zinc-50 px-3 py-1 rounded-full uppercase tracking-widest">{stats.followers} Followers</span>
               <Eye className="h-4 w-4 text-gray-200 group-hover:text-indigo-400 transition-colors" />
            </div>
         </div>
      </div>

      {/* Tabbed Content Section */}
      <div className="rounded-[3rem] border border-gray-100 bg-white shadow-sm overflow-hidden min-h-[500px]">
        {/* Tab Headers */}
        <div className="flex border-b border-gray-50 overflow-x-auto scrollbar-hide bg-zinc-50/50">
          {[
            { id: 'events', label: 'Catalogue', count: events.length },
            { id: 'attendees', label: 'Attendees', count: attendees.length },
            { id: 'earnings', label: 'Ledger', count: payouts.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[180px] px-8 py-8 text-[11px] font-black uppercase tracking-[0.25em] transition-all relative group
                ${activeTab === tab.id ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}
            >
              <div className="flex items-center justify-center gap-3">
                 {tab.label}
                 <span className={`text-[9px] px-2 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {tab.count}
                 </span>
              </div>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 animate-in slide-in-from-bottom-1" />
              )}
            </button>
          ))}
        </div>

        <div className="animate-in fade-in duration-500">
          {activeTab === 'events' && (
            events.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-500">
                  <thead className="bg-zinc-50/50 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    <tr>
                      <th scope="col" className="px-8 py-4">Event Details</th>
                      <th scope="col" className="px-6 py-4">Engagement</th>
                      <th scope="col" className="px-6 py-4">Status</th>
                      <th scope="col" className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {events.map((evt: any) => (
                      <tr key={evt.id} className="bg-white hover:bg-zinc-50/50 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="font-black text-zinc-900 text-lg leading-tight">{evt.title}</span>
                            <span className="text-xs font-bold text-zinc-400 mt-1 uppercase tracking-tight">
                            {isMounted ? new Date(evt.start_datetime).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }) : ''}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex gap-4">
                              <div className="flex flex-col">
                                <span className="text-zinc-900 font-black">{evt.booking_count || 0}</span>
                                <span className="text-[10px] uppercase font-bold text-zinc-400">Bookings</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-zinc-900 font-black">{evt.likes_count || 0}</span>
                                <span className="text-[10px] uppercase font-bold text-zinc-400">Likes</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-zinc-900 font-black">{evt.interests_count || 0}</span>
                                <span className="text-[10px] uppercase font-bold text-zinc-400">Interests</span>
                              </div>
                          </div>
                        </td>
                        <td className="px-6 py-6 font-medium">
                          <span className={`inline-flex items-center rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-wider
                            ${evt.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 
                              evt.status === 'draft' ? 'bg-zinc-100 text-zinc-500' : 
                              'bg-amber-50 text-amber-700'}
                          `}>
                            {evt.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/events/${evt.slug}`} className="rounded-xl border border-zinc-100 px-3 py-1.5 text-xs font-black text-zinc-600 transition hover:bg-zinc-50">
                              View
                            </Link>
                            <Link href={`/host-dashboard/${pageId}/events/${evt.id}/edit`} className="rounded-xl bg-zinc-900 px-3 py-1.5 text-xs font-black text-white transition hover:bg-zinc-800 shadow-sm">
                              Edit
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-8 py-20 text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-zinc-50 mb-4">
                    <span className="text-2xl">🎉</span>
                </div>
                <h3 className="text-xl font-black text-zinc-900">Your stage is waiting</h3>
                <p className="text-zinc-500 mt-2 max-w-xs mx-auto">Create your first event and start hosting on Stranger Mingle.</p>
                <div className="mt-8">
                  <Link
                    href={`/host-dashboard/${pageId}/create-event`}
                    className="inline-flex h-12 items-center justify-center rounded-2xl bg-indigo-600 px-8 py-2 text-sm font-black text-white transition-all hover:bg-indigo-700 shadow-md"
                  >
                    Create First Event
                  </Link>
                </div>
              </div>
            )
          )}

          {activeTab === 'attendees' && (
            attendees.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-500">
                  <thead className="bg-zinc-50/50 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    <tr>
                      <th scope="col" className="px-8 py-4">Attendee Details</th>
                      <th scope="col" className="px-6 py-4">Event</th>
                      <th scope="col" className="px-6 py-4">Status</th>
                      <th scope="col" className="px-8 py-4 text-right">Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {attendees.map((booking: any) => (
                      <tr key={booking.id} className="bg-white hover:bg-zinc-50/50 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="font-black text-zinc-900 text-lg leading-tight">{booking.attendee_name}</span>
                            <span className="text-xs font-bold text-indigo-600 mt-1 uppercase tracking-tight">Ref: {booking.booking_ref}</span>
                          </div>
                        </td>
                        <td className="px-6 py-6 font-bold text-zinc-700">
                          {booking.events?.title || 'Unknown Event'}
                        </td>
                        <td className="px-6 py-6">
                           <span className="inline-flex rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-700 uppercase">
                              {booking.status}
                           </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <div className="flex flex-col items-end gap-1">
                               <span className="text-xs font-black text-zinc-900">{booking.attendee_phone}</span>
                              <span className="text-[10px] font-bold text-zinc-400">{booking.attendee_email}</span>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-8 py-20 text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-zinc-50 mb-4">
                    <span className="text-2xl">🎟️</span>
                </div>
                <h3 className="text-xl font-black text-zinc-900">Waiting for tickets to sell</h3>
                <p className="text-zinc-500 mt-2 max-w-xs mx-auto">Once users start booking tickets for your events, their details will appear here.</p>
              </div>
            )
          )}

          {activeTab === 'earnings' && (
            payouts.length > 0 ? (
              <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm text-zinc-500">
                    <thead className="bg-zinc-50/50 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                       <tr>
                          <th scope="col" className="px-8 py-4">Payout Date</th>
                          <th scope="col" className="px-6 py-4">Gross Revenue</th>
                          <th scope="col" className="px-6 py-4">Platform Fee</th>
                          <th scope="col" className="px-6 py-4">Net Payout</th>
                          <th scope="col" className="px-8 py-4 text-right">Status</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                       {payouts.map((payout: any) => (
                          <tr key={payout.id} className="bg-white hover:bg-zinc-50/50 transition-colors">
                             <td className="px-8 py-6">
                                <div className="flex flex-col">
                                   <span className="font-black text-zinc-900">{new Date(payout.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                                   <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">ID: {payout.id.split('-')[0]}</span>
                                </div>
                             </td>
                             <td className="px-6 py-6">
                                <span className="font-bold text-zinc-700">₹{parseFloat(payout.gross_amount).toLocaleString()}</span>
                             </td>
                             <td className="px-6 py-6 text-zinc-400">
                                ₹{(parseFloat(payout.platform_fee) + parseFloat(payout.gst_on_fee || 0)).toLocaleString()}
                             </td>
                             <td className="px-6 py-6">
                                <span className="font-black text-emerald-600">₹{parseFloat(payout.net_amount).toLocaleString()}</span>
                             </td>
                             <td className="px-8 py-6 text-right">
                                <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wider ${
                                   payout.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                                }`}>
                                   {payout.status}
                                </span>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
            ) : (
               <div className="px-8 py-20 text-center">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-zinc-50 mb-4">
                      <span className="text-2xl">💰</span>
                  </div>
                  <h3 className="text-xl font-black text-zinc-900">No earnings yet</h3>
                  <p className="text-zinc-500 mt-2 max-w-xs mx-auto">Complete your first event to start earning on Stranger Mingle.</p>
               </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}
