import { createClient } from '@/lib/supabase/server'
import { getEventDetailsAction } from '@/actions/event.actions'
import EventCreateForm from '@/components/events/EventCreateForm'
import { redirect, notFound } from 'next/navigation'

export default async function EditEventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch Event Details
  const res = await getEventDetailsAction(slug)
  if (res.error || !res.event) return notFound()

  const event = res.event

  // Ownership check
  const { data: hostProfile } = await supabase
    .from('host_profiles')
    .select('id, user_id')
    .eq('id', event.host_id)
    .single()

  if (!hostProfile || hostProfile.user_id !== user.id) {
    return redirect('/events/drafts')
  }

  // Fetch Categories
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  // Fetch Host Profiles
  const { data: hostProfiles } = await supabase
    .from('host_profiles')
    .select('id, display_name')
    .eq('user_id', user.id)

  return (
    <div className="py-8 md:py-12">
      <div className="max-w-2xl mx-auto mb-10 text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-black text-zinc-950 uppercase tracking-tighter leading-none">
          Refine your <span className="text-indigo-600">Event</span>
        </h1>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
          Make it perfect before you go live.
        </p>
      </div>
      
      <EventCreateForm 
        categories={categories || []} 
        hostProfiles={hostProfiles || []} 
        initialData={event}
        eventId={slug}
      />
    </div>
  )
}
