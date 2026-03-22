import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logoutAction } from '@/actions/auth.actions'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Best effort grab of role/avatar if logged in
  let dbUser = null
  let hasActiveSubscription = false
  let activePageId = null

  if (user) {
    const { data } = await (supabase.from('users') as any).select('username, avatar_url, role').eq('id', user.id).single()
    dbUser = data

    // Check for any active host page with subscription
    const { data: hostPage } = await supabase
      .from('host_profiles')
      .select('id, subscriptions!inner(status, ends_at)')
      .eq('user_id', user.id)
      .eq('subscriptions.status', 'active')
      .gt('subscriptions.ends_at', new Date().toISOString())
      .limit(1)
      .maybeSingle()

    if (hostPage) {
      hasActiveSubscription = true
      activePageId = hostPage.id
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar 
        user={user} 
        dbUser={dbUser} 
        activePageId={activePageId ?? undefined} 
      />
      <main className="flex-1 mt-16 sm:mt-20">
        {children}
      </main>
      <Footer />
    </div>
  )
}


