'use server'

import { createClient } from '../lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateHostPageAction(pageId: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // Ownership check
  const { data: existingPage } = await (supabase.from('host_profiles') as any).select('user_id').eq('id', pageId).single()
  if (!existingPage || (existingPage as any).user_id !== user.id) {
    return { error: 'Unauthorized' }
  }

  const updates = {
    host_type: formData.get('host_type') as string,
    organisation_name: formData.get('organisation_name') as string || null,
    display_name: formData.get('display_name') as string,
    tagline: formData.get('tagline') as string || null,
    description: formData.get('description') as string || null,
    profile_image: formData.get('profile_image') as string || null,
    logo_url: formData.get('logo_url') as string || null,
    banner_url: formData.get('banner_url') as string || null,
    instagram_handle: formData.get('instagram_handle') as string || null,
    facebook_url: formData.get('facebook_url') as string || null,
    twitter_handle: formData.get('twitter_handle') as string || null,
    youtube_url: formData.get('youtube_url') as string || null,
    city: formData.get('city') as string || null,
    state: formData.get('state') as string || null,
    country: formData.get('country') as string || null,
    bank_account_name: formData.get('bank_account_name') as string || null,
    bank_account_number: formData.get('bank_account_number') as string || null,
    bank_ifsc_code: formData.get('bank_ifsc_code') as string || null,
    upi_id: formData.get('upi_id') as string || null,
  }

  const { error: updateError } = await (supabase
    .from('host_profiles') as any)
    .update(updates)
    .eq('id', pageId)

  if (updateError) {
    return { error: updateError.message }
  }

  revalidatePath(`/host-dashboard/${pageId}`)
  return { success: true }
}
