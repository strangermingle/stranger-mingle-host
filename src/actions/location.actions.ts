'use server'

import { createClient } from '@/lib/supabase/server'

export async function getLocationsAction() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized', locations: [] }

  const { data, error } = await (supabase
    .from('locations') as any)
    .select('id, venue_name, address_line1, address_line2, city, state, country, postal_code, latitude, longitude, google_maps_url, place_id')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getLocationsAction error:', error)
    return { error: error.message, locations: [] }
  }

  return { success: true, locations: data || [] }
}

export async function createLocationAction(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const venue_name = formData.get('venue_name') as string | null
  const address_line1 = formData.get('address_line1') as string | null
  const city = formData.get('city') as string
  const state = formData.get('state') as string | null
  const country = (formData.get('country') as string | null) || 'India'
  const postal_code = formData.get('postal_code') as string | null
  const google_maps_url = formData.get('google_maps_url') as string | null
  const place_id = formData.get('place_id') as string | null
  const latitude = formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : null
  const longitude = formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : null

  if (!city) return { error: 'City is required' }

  const { data, error } = await (supabase
    .from('locations') as any)
    .insert({
      venue_name: venue_name || null,
      address_line1: address_line1 || null,
      city,
      state: state || null,
      country,
      postal_code: postal_code || null,
      google_maps_url: google_maps_url || null,
      place_id: place_id || null,
      latitude,
      longitude,
    })
    .select()
    .single()

  if (error) {
    console.error('createLocationAction error:', error)
    return { error: error.message }
  }

  return { success: true, location: data }
}
