'use server'

import { createClient } from '../lib/supabase/server'

export async function reportContentAction(
  reportedType: string,
  reportedId: string,
  reason: string,
  details?: string
) {
  const supabase = await createClient()

  // Verify user authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Validate reportedType
  const allowedTypes = ['event', 'user', 'review', 'discussion', 'message']
  if (!allowedTypes.includes(reportedType)) {
    throw new Error(`Invalid reported_type. Must be one of: ${allowedTypes.join(', ')}`)
  }

  // Insert into reports table
  const { error } = await (supabase
    .from('reports') as any)
    .insert({
      reporter_id: user.id,
      reported_type: reportedType as 'event' | 'user' | 'review' | 'discussion' | 'message',
      reported_id: reportedId,
      reason,
      details: details || null,
      status: 'pending',
    })

  if (error) {
    throw new Error(`Failed to report content: ${error.message}`)
  }

  return { success: true }
}
