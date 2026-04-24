import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Rocket, Coffee, Calendar, Edit3, Clock, Sparkles } from 'lucide-react'
import { DraftsList } from '@/components/dashboard/events/DraftsList'

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

  // Fetch Drafted Events
  const { data: drafts } = await supabase
    .from('events')
    .select(`
      id,
      title,
      slug,
      status,
      start_datetime,
      created_at,
      updated_at,
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
    .order('updated_at', { ascending: false })

  const mappedDrafts = drafts?.map((d: any) => ({
    ...d,
    venue_name: d.locations?.venue_name,
    city: d.locations?.city
  })) || []

  // Stats for the summary cards
  const totalDrafts = mappedDrafts.length
  const lastUpdated = mappedDrafts.length > 0 ? new Date(mappedDrafts[0].updated_at) : null
  const onlineDrafts = mappedDrafts.filter(d => d.event_type === 'online').length
  const offlineDrafts = totalDrafts - onlineDrafts

  return (
    <div className="max-w-7xl mx-auto space-y-10 py-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-100">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-zinc-400 font-bold text-[10px] uppercase tracking-[0.3em]">
            <Rocket className="w-3 h-3 text-indigo-600" />
            <span>Studio Workflow</span>
          </div>
          <h1 className="text-4xl font-black text-zinc-950 uppercase tracking-tighter leading-none">
            Saved <span className="text-indigo-600">Drafts</span>
          </h1>
          <p className="max-w-md text-zinc-500 font-bold uppercase tracking-widest text-[11px] leading-relaxed">
            Your creative incubator. Polish your drafts to perfection before unveiling them to the world.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <a href="/events/create" className="h-12 px-8 rounded-2xl bg-zinc-950 text-white font-black uppercase tracking-widest text-[10px] flex items-center shadow-xl shadow-zinc-950/10 transition-all hover:bg-indigo-600 hover:-translate-y-1 active:scale-95">
             Create New Event
          </a>
        </div>
      </div>

      {/* Summary Stats — Matching Earnings Page Style */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          <div className="relative flex items-center justify-between mb-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total Drafts</p>
            <Edit3 className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-3xl font-black text-zinc-950 tracking-tighter">{totalDrafts}</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50/50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          <div className="relative flex items-center justify-between mb-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Last Activity</p>
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl font-black text-zinc-950 uppercase tracking-tighter">
            {lastUpdated ? lastUpdated.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Never'}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50/50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          <div className="relative flex items-center justify-between mb-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Offline</p>
            <Calendar className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-zinc-950 tracking-tighter">{offlineDrafts}</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50/50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          <div className="relative flex items-center justify-between mb-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Online</p>
            <Sparkles className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-3xl font-black text-zinc-950 tracking-tighter">{onlineDrafts}</p>
        </div>
      </div>

      {/* Drafts List Container */}
      <div className="bg-zinc-50/30 rounded-[3rem] p-4 -m-4">
        {mappedDrafts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-8 bg-white rounded-[2.5rem] border border-zinc-100 border-dashed shadow-inner">
            <div className="w-24 h-24 bg-zinc-50 rounded-[2.5rem] flex items-center justify-center text-zinc-200">
              <Coffee className="w-10 h-10" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-zinc-950 uppercase tracking-tight leading-none">Draft box is clear</h2>
              <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">No masterpieces in progress. Time for a new creation?</p>
            </div>
            <a href="/events/create" className="text-indigo-600 font-black uppercase tracking-widest text-[10px] h-11 px-8 rounded-xl border-2 border-indigo-600/10 hover:bg-indigo-50 transition-all flex items-center gap-2">
              New Event Wizard
            </a>
          </div>
        ) : (
          <div className="pb-20">
            <DraftsList initialDrafts={mappedDrafts} />
          </div>
        )}
      </div>
    </div>
  )
}
