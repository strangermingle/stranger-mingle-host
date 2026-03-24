import { createClient } from '@/lib/supabase/server'
import { AttendanceTab } from '@/components/members/AttendanceTab'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ticket Scanner — Stranger Mingle',
  description: 'Scan event tickets and manage check-ins',
}

export default async function ScannerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  return (
    <div className="space-y-6">
      <AttendanceTab userId={user.id} defaultMode="auto" />
    </div>
  )
}
