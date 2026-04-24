import { createClient } from '@/lib/supabase/server'
import { Metadata } from 'next'
import { DashboardOverview } from '@/components/dashboard/DashboardOverview'

export const metadata: Metadata = {
  title: 'Dashboard — Stranger Mingle',
  description: 'Your personal dashboard',
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch host pages managed by user
  const { data: hostPages } = await supabase
    .from('host_profiles')
    .select('*, subscriptions(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const hostPageIds = hostPages?.map((p: any) => p.id) || []
  let events: any[] = []
  if (hostPageIds.length > 0) {
    const { data: eventsData } = await supabase
      .from('events')
      .select('*')
      .in('host_id', hostPageIds)
      .order('start_datetime', { ascending: false })
    events = eventsData || []
  }

  const initialData = {
    hostPages: (hostPages as any) || [],
    events: events
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 uppercase tracking-widest  border-l-4 border-zinc-900 pl-4">
          Overview
        </h1>
      </div>

      <DashboardOverview userId={user.id} data={initialData} />
    </div>
  )
}
