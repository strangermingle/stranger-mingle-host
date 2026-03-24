'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { mapPostgresError } from '@/lib/utils/error-mapper'

export async function getLocationsAction() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .order('venue_name', { ascending: true })

  if (error) {
    return { error: mapPostgresError(error) }
  }

  return { success: true, locations: data }
}

export async function createLocationAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  try {
    const rawData = formData.get('data') as string
    if (!rawData) return { error: 'No data provided' }
    const validated = JSON.parse(rawData)

    const { data: loc, error: locError } = await supabase
      .from('locations')
      .insert({
        venue_name: validated.venue_name || 'TBD',
        address_line1: validated.address_line1 || null,
        city: validated.city || 'TBD',
        state: validated.state || null,
        country: validated.country || 'India',
        postal_code: validated.postal_code || null,
        google_maps_url: validated.google_maps_url || null
      })
      .select()
      .single()

    if (locError) throw locError

    revalidatePath('/events/locations')
    return { success: true, location: loc }
  } catch (err: any) {
    console.error('createLocationAction error:', err)
    return { error: mapPostgresError(err) }
  }
}
