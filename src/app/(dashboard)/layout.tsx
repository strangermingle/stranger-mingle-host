import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { HostSidebar } from '@/components/layout/HostSidebar'
import { getUserById, getUserWithHostProfile } from '@/lib/repositories/users.repository'
import { RealtimeProvider } from '@/components/providers/RealtimeProvider'
import { supabaseAdmin } from '@/lib/supabase/admin'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default async function MembersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // Inside MembersLayout
  let dbUser = await getUserWithHostProfile(user.id)

  if (!dbUser) {
    // Auto-create user if missing (e.g. from OAuth or failed signup hook)
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
        {/* Site Header */}
        <div className="relative z-[10000]">
            <Navbar 
               user={user} 
               dbUser={dbUser} 
               activePageId={(dbUser as any).host_profile?.id}
            />
        </div>

        <div className="flex flex-1 pt-[73px] bg-white text-black">
          {/* Sidebar Nav */}
          <HostSidebar user={user} dbUser={dbUser} />
          
          {/* Main Content Area */}
          <main className="flex-1 md:pl-64 pl-16 flex flex-col min-h-[calc(100vh-73px)]">
            <div className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 md:px-8">
              {children}
            </div>
            
            {/* Dashboard Footer */}
            <Footer />
          </main>
        </div>
      </div>
    </RealtimeProvider>
  )
}

