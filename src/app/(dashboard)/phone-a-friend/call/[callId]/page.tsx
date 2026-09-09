import { createClient } from '@/lib/supabase/server'
import { getUserWithHostProfile } from '@/lib/repositories/users.repository'
import { getCallSessionTokenAction } from '@/actions/call.actions'
import { redirect } from 'next/navigation'
import HostCallRoom from '@/components/calls/HostCallRoom'

export const dynamic = 'force-dynamic'

export default async function HostCallPage({
  params,
}: {
  params: Promise<{ callId: string }>
}) {
  const { callId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const dbUser = await getUserWithHostProfile(user.id)
  if (!dbUser || !dbUser.host_profile) {
    redirect('/phone-a-friend')
  }

  const result = await getCallSessionTokenAction(callId)

  if (!result || !result.success || !result.agora) {
    redirect('/phone-a-friend?error=call_unavailable')
  }

  return (
    <HostCallRoom
      call={result.call}
      agoraParams={{
        appId: result.agora.appId,
        channelName: result.agora.channelName,
        token: result.agora.token,
        account: result.agora.account,
      }}
    />
  )
}
