import { createClient } from '@/lib/supabase/server'
import CreateEventForm from '@/components/dashboard/events/CreateEventForm'
import { redirect } from 'next/navigation'

export default async function CreateEventPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

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

  if (!hostProfiles || hostProfiles.length === 0) {
    return (
      <div className="max-w-xl mx-auto mt-20 p-12 bg-white rounded-[3rem] border border-gray-100 shadow-xl text-center space-y-6">
        <div className="w-20 h-20 bg-orange-50 text-orange-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
           <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
           </svg>
        </div>
        <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Host Profile Required</h1>
        <p className="text-gray-500 font-bold leading-relaxed">
          You need to create a host profile before you can start creating events. 
          Head over to your profile settings to get started.
        </p>
        <div className="pt-4">
          <a href="/profile" className="inline-flex h-12 px-10 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest text-xs items-center shadow-lg shadow-indigo-100 hover:scale-105 transition-transform">
            Go to Profile
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12 md:py-20 relative overflow-hidden">
      {/* Background Flourish */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-indigo-50/50 to-transparent -z-10" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-100/20 rounded-full blur-3xl -z-10" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl -z-10" />

      <div className="max-w-4xl mx-auto mb-16 text-center space-y-6 relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">New Experience</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black text-zinc-950 uppercase tracking-tighter leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          Create <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">Legendary</span><br />
          <span className="text-zinc-400">Memories</span>
        </h1>
        
        <p className="max-w-md mx-auto text-sm font-bold text-gray-400 uppercase tracking-widest leading-relaxed opacity-60 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200">
          The finest events in the city start right here. Fill in the details to launch your next experience.
        </p>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
        <CreateEventForm 
          categories={categories || []} 
          hostProfiles={hostProfiles || []} 
        />
      </div>
    </div>
  )
}
