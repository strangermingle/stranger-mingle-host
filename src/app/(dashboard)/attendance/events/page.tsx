import { createClient } from '@/lib/supabase/server'
import { AttendanceTab } from '@/components/members/AttendanceTab'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Guest List — Stranger Mingle',
  description: 'View and manage attendees for your events',
}

export default async function EventsAttendeesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  return (
    <div className="space-y-6">
      <AttendanceTab userId={user.id} defaultMode="manual" />
    </div>
  )
}
