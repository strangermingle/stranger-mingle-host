import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { HostSidebar } from '@/components/layout/HostSidebar'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { RealtimeProvider } from '@/components/providers/RealtimeProvider'
import { getUserWithHostProfile } from '@/lib/repositories/users.repository'
import { supabaseAdmin } from '@/lib/supabase/admin'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  let dbUser = await getUserWithHostProfile(user.id)

  if (!dbUser) {
    // Check if the user exists in public.users by email (indicating ID mismatch)
    if (user.email) {
      const { data: emailUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', user.email)
        .maybeSingle()

      if (emailUser && emailUser.id !== user.id) {
        // Trigger self-healing RPC to align auth.users.id with public.users.id
        await supabaseAdmin.rpc('sync_host_auth_id', {
          target_email: user.email,
          target_id: emailUser.id,
        })
        
        // Log out the current session since the user ID changed
        await supabase.auth.signOut()
        
        // Redirect to login page asking them to sign in again to obtain a fresh token with correct ID.
        redirect('/login?message=Authentication synchronized. Please log in again.')
      }
    }

    // Auto-create user row if missing (e.g. from OAuth or failed signup hook)
    const { error: insertError } = await supabaseAdmin.from('users').insert({
      id: user.id,
      email: user.email || '',
      username: user.email?.split('@')[0] || `user_${Math.floor(Math.random() * 10000)}`,
      anonymous_alias: `NewUser${Math.floor(Math.random() * 10000)}`,
    })

    if (!insertError) {
      dbUser = await getUserWithHostProfile(user.id)
    }

    if (!dbUser) {
      redirect('/login')
    }
  }

  return (
    <RealtimeProvider userId={dbUser.id}>
      <div className="flex flex-col min-h-screen">
        {/* Dashboard Header (host-only: logo + notifications + sign out) */}
        <DashboardHeader user={user} dbUser={dbUser} />

        <div className="flex flex-1 pt-[73px] bg-white text-black">
          {/* Sidebar Navigation */}
          <HostSidebar user={user} dbUser={dbUser} />

          {/* Main Content */}
          <main className="flex-1 w-full min-w-0 md:pl-20 pb-20 md:pb-0 flex flex-col min-h-[calc(100vh-73px)]">
            <div className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 md:px-8 overflow-x-hidden">
              {children}
            </div>
          </main>
        </div>
      </div>
    </RealtimeProvider>
  )
}
