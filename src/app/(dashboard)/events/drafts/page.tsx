import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Rocket, Coffee, Grid, LayoutList } from 'lucide-react'
import { DraftEventCard } from '@/components/events/DraftEventCard'
import { DraftsList } from '@/components/events/DraftsList'

export default async function DraftedEventsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch Host Profiles
  const { data: hostProfiles } = await supabase
    .from('host_profiles')
    .select('id')
    .eq('user_id', user.id)

  const hostProfileIds = hostProfiles?.map(hp => hp.id) || []

  // Fetch Drafted Events including basic location info
  const { data: drafts } = await supabase
    .from('events')
    .select(`
      id,
      title,
      slug,
      status,
      start_datetime,
      cover_image_url,
      vertical_poster_url,
      event_type,
      locations (
        venue_name,
        city
      )
    `)
    .eq('status', 'draft')
    .in('host_id', hostProfileIds)
    .order('created_at', { ascending: false })

  // Map data to simpler format for prop passing
  const mappedDrafts = drafts?.map((d: any) => ({
    ...d,
    venue_name: d.locations?.venue_name,
    city: d.locations?.city
  })) || []

  return (
    <div className="space-y-12 py-8">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-zinc-100">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-zinc-400 font-bold text-[10px] uppercase tracking-[0.3em]">
            <Rocket className="w-3 h-3 text-zinc-950" />
            <span>Studio Workflows</span>
          </div>
          <h1 className="text-5xl font-black text-zinc-950 uppercase tracking-tighter leading-none">
            Saved <span className="text-zinc-400">Drafts</span>
          </h1>
          <p className="max-w-md text-zinc-500 font-bold uppercase tracking-widest text-[11px] leading-relaxed">
            Your upcoming masterpieces in progress. Polish them to perfection before the world sees.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <a href="/events/create" className="h-14 px-8 rounded-2xl bg-zinc-950 text-white font-black uppercase tracking-widest text-xs flex items-center shadow-2xl shadow-indigo-100 transition-all hover:bg-indigo-600 hover:-translate-y-1 active:scale-95">
            + Create New Event
          </a>
        </div>
      </div>

      {mappedDrafts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-8 bg-zinc-50/50 rounded-[3rem] border border-zinc-100 border-dashed">
          <div className="w-24 h-24 bg-white shadow-xl rounded-[2.5rem] flex items-center justify-center text-zinc-200">
            <Coffee className="w-10 h-10" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-zinc-950 uppercase tracking-tight">Quiet on the set...</h2>
            <p className="text-zinc-400 font-bold uppercase tracking-widest text-[11px]">No drafts found yet. Start your next event creation flow.</p>
          </div>
          <a href="/events/create" className="text-indigo-600 font-black uppercase tracking-widest text-xs h-10 px-6 rounded-xl border-2 border-indigo-600/10 hover:bg-indigo-50 transition-colors flex items-center">
            New Event Wizard
          </a>
        </div>
      ) : (
        <DraftsList initialDrafts={mappedDrafts} />
      )}
    </div>
  )
}
