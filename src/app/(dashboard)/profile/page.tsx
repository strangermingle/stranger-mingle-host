import { createClient } from '@/lib/supabase/server'
import { getUserWithHostProfile } from '@/lib/repositories/users.repository'
import HostProfileForm from '@/components/dashboard/profile/HostProfileForm'
import { redirect } from 'next/navigation'

export default async function HostProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const dbUser = await getUserWithHostProfile(user.id)
  if (!dbUser || !dbUser.host_profile) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
        <h1 className="text-2xl font-black text-gray-900 mb-4 uppercase ">Host Profile Missing</h1>
        <p className="text-gray-500 uppercase font-bold tracking-widest text-xs">Please contact support if you are a host but see this message.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 uppercase  tracking-tight">Host Profile</h1>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Manage your brand and financial settings</p>
      </div>

      <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-sm">
        <HostProfileForm initialData={dbUser.host_profile} />
      </div>
    </div>
  )
}
