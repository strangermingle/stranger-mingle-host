import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MonitorPlay, Sparkles, Plus } from 'lucide-react'
import { PublishedEventsList } from '@/components/events/PublishedEventsList'

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

  // Fetch Published Events with ordering descending (most recent first)
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
      locations (
        venue_name,
        city
      )
    `)
    .eq('status', 'published')
    .in('host_id', hostProfileIds)
    .order('created_at', { ascending: false })

  // Map data to simpler format
  const mappedEvents = published?.map((p: any) => ({
    ...p,
    venue_name: p.locations?.venue_name,
    city: p.locations?.city
  })) || []

  return (
    <div className="space-y-12 py-8">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-zinc-100">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-zinc-400 font-bold text-[10px] uppercase tracking-[0.3em]">
            <MonitorPlay className="w-3 h-3 text-emerald-500" />
            <span>LIVE OPERATIONAL HUB</span>
          </div>
          <h1 className="text-5xl font-black text-zinc-950 uppercase tracking-tighter leading-none">
            Live <span className="text-emerald-500">Events</span>
          </h1>
          <p className="max-w-md text-zinc-500 font-bold uppercase tracking-widest text-[11px] leading-relaxed">
            Your real-time portfolio on the global stage. Manage bookings, track growth, and optimize engagement.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <a href="/events/create" className="h-14 px-8 rounded-2xl bg-zinc-950 text-white font-black uppercase tracking-widest text-xs flex items-center shadow-2xl shadow-zinc-950/10 transition-all hover:bg-emerald-600 hover:-translate-y-1 active:scale-95">
            + GO LIVE
          </a>
        </div>
      </div>

      {mappedEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-8 bg-zinc-50/50 rounded-[3rem] border border-zinc-100 border-dashed">
          <div className="w-24 h-24 bg-white shadow-xl rounded-[2.5rem] flex items-center justify-center text-zinc-200">
            <Sparkles className="w-10 h-10" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-zinc-950 uppercase tracking-tight">Stage is set...</h2>
            <p className="text-zinc-400 font-bold uppercase tracking-widest text-[11px]">No live events found. Publish your first draft to see it here.</p>
          </div>
          <a href="/events/drafts" className="text-emerald-600 font-black uppercase tracking-widest text-xs h-10 px-6 rounded-xl border-2 border-emerald-600/10 hover:bg-emerald-50 transition-colors flex items-center">
            Go to Drafts
          </a>
        </div>
      ) : (
        <PublishedEventsList initialEvents={mappedEvents} />
      )}
    </div>
  )
}
