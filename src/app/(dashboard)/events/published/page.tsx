import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MonitorPlay, Sparkles, Calendar, Users, Ticket, CheckCircle2 } from 'lucide-react'
import { PublishedEventsList } from '@/components/dashboard/events/PublishedEventsList'

export default async function PublishedEventsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch Host Profiles
  const { data: hostProfiles } = await supabase
    .from('host_profiles')
    .select('id')
    .eq('user_id', user.id)

  const hostProfileIds = hostProfiles?.map(hp => hp.id) || []

  // Fetch Published Events
  const { data: published } = await supabase
    .from('events')
    .select(`
      id,
      title,
      slug,
      status,
      start_datetime,
      created_at,
      cover_image_url,
      vertical_poster_url,
      event_type,
      booking_count,
      max_capacity,
      locations (
        venue_name,
        city
      )
    `)
    .eq('status', 'published')
    .in('host_id', hostProfileIds)
    .order('created_at', { ascending: false })

  const mappedEvents = published?.map((p: any) => ({
    ...p,
    venue_name: p.locations?.venue_name,
    city: p.locations?.city
  })) || []

  // Stats for the summary cards
  const totalBookings = mappedEvents.reduce((acc, curr) => acc + (curr.booking_count || 0), 0)
  const upcomingEvents = mappedEvents.filter(e => new Date(e.start_datetime) > new Date()).length
  const totalCapacity = mappedEvents.reduce((acc, curr) => acc + (curr.max_capacity || 0), 0)
  const avgOccupancy = totalCapacity > 0 ? (totalBookings / totalCapacity) * 100 : 0

  return (
    <div className="max-w-7xl mx-auto space-y-10 py-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-100">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-zinc-400 font-bold text-[10px] uppercase tracking-[0.3em]">
            <MonitorPlay className="w-3 h-3 text-emerald-500" />
            <span>Operational Excellence</span>
          </div>
          <h1 className="text-4xl font-black text-zinc-950 uppercase tracking-tighter leading-none">
            Published <span className="text-emerald-500">Portfolio</span>
          </h1>
          <p className="max-w-md text-zinc-500 font-bold uppercase tracking-widest text-[11px] leading-relaxed">
            Real-time management of your live experiences. Track bookings and optimize performance.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <a href="/events/create" className="h-12 px-8 rounded-2xl bg-zinc-950 text-white font-black uppercase tracking-widest text-[10px] flex items-center shadow-xl shadow-zinc-950/10 transition-all hover:bg-emerald-600 hover:-translate-y-1 active:scale-95">
             Create New Event
          </a>
        </div>
      </div>

      {/* Summary Stats — Matching Earnings Page Style */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50/50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          <div className="relative flex items-center justify-between mb-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Live Events</p>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-zinc-950 tracking-tighter">{mappedEvents.length}</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          <div className="relative flex items-center justify-between mb-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total Bookings</p>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-3xl font-black text-zinc-950 tracking-tighter">{totalBookings}</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50/50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          <div className="relative flex items-center justify-between mb-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Upcoming</p>
            <Calendar className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-zinc-950 tracking-tighter">{upcomingEvents}</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50/50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          <div className="relative flex items-center justify-between mb-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Avg Occupancy</p>
            <Ticket className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-3xl font-black text-zinc-950 tracking-tighter">{avgOccupancy.toFixed(1)}%</p>
        </div>
      </div>

      {/* Events List Container */}
      <div className="bg-zinc-50/30 rounded-[3rem] p-4 -m-4">
        {mappedEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-8 bg-white rounded-[2.5rem] border border-zinc-100 border-dashed shadow-inner">
            <div className="w-24 h-24 bg-zinc-50 rounded-[2.5rem] flex items-center justify-center text-zinc-200">
              <Sparkles className="w-10 h-10" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-zinc-950 uppercase tracking-tight leading-none">Your portfolio is empty</h2>
              <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Publish your drafted masterpieces to see them go live here.</p>
            </div>
            <a href="/events/drafts" className="text-zinc-950 font-black uppercase tracking-widest text-[10px] h-11 px-8 rounded-xl border-2 border-zinc-100 hover:bg-zinc-50 transition-all flex items-center gap-2">
              Go to Drafts Hub
            </a>
          </div>
        ) : (
          <div className="pb-20">
            <PublishedEventsList initialEvents={mappedEvents} />
          </div>
        )}
      </div>
    </div>
  )
}
