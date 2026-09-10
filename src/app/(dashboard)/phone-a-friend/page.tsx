import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getUserWithHostProfile } from '@/lib/repositories/users.repository'
import { redirect } from 'next/navigation'
import HostCallingDashboard from '@/components/calls/HostCallingDashboard'

export const dynamic = 'force-dynamic'

export default async function HostPhoneAFriendPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const dbUser = await getUserWithHostProfile(user.id)
  if (!dbUser || !dbUser.host_profile) {
    redirect('/')
  }

  const hostProfile = dbUser.host_profile

  // 1. Fetch calling settings
  const { data: settings } = await (supabaseAdmin as any)
    .from('phone_a_friend_host_settings')
    .select('*')
    .eq('host_id', hostProfile.id)
    .maybeSingle()

  // 2. Fetch recent calls
  const { data: recentCalls } = await (supabaseAdmin as any)
    .from('phone_a_friend_calls')
    .select(`
      *,
      user:users!user_id(id, anonymous_alias, username)
    `)
    .eq('host_id', hostProfile.id)
    .order('created_at', { ascending: false })
    .limit(30)

  return (
    <HostCallingDashboard
      hostProfile={hostProfile}
      settings={settings}
      recentCalls={recentCalls || []}
    />
  )
}
