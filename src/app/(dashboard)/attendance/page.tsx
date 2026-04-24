import { createClient } from '@/lib/supabase/server'
import { Metadata } from 'next'
import { AttendanceTab } from '@/components/dashboard/attendance/AttendanceTab'

export const metadata: Metadata = {
  title: 'Attendance — Stranger Mingle',
  description: 'Manage your attendee check-ins',
}

export default async function AttendancePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  return (
    <div className="space-y-6">
      <AttendanceTab userId={user.id} />
    </div>
  )
}
