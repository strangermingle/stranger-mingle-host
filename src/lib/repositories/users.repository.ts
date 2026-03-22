import { createClient } from '../supabase/server'
import { UserUpdate, User, HostProfile } from '@/types'

export async function getUserById(id: string): Promise<User | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .select(
      `
      id, username, anonymous_alias, email, phone, phone_verified,
      password_hash, avatar_url, bio, gender, date_of_birth, role,
      is_verified, is_active, is_suspended, suspension_reason,
      suspended_until, email_verified_at, last_login_at, login_count,
      preferred_language, preferred_currency, timezone,
      notification_prefs, privacy_settings, created_at, updated_at
    `
    )
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(error.message)
  }

  return data
}

export async function getUserWithHostProfile(
  id: string
): Promise<(User & { host_profile: HostProfile | null }) | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .select(
      `
      *,
      host_profiles!user_id (*)
    `
    )
    .eq('id', id)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data) return null

  // Supabase returns related table as an array if it's 1-to-many OR as a single object if defined as 1-to-1/inner joined
  const profileData = (data as any).host_profiles
  const profile = Array.isArray(profileData) 
    ? (profileData.length > 0 ? profileData[0] : null) 
    : (profileData || null)

  const { host_profiles, ...userData } = data as any

  return {
    ...userData,
    host_profile: profile,
  } as any
}

export async function updateUser(id: string, userData: UserUpdate): Promise<User> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .update(userData)
    .eq('id', id)
    .select(
      `
      id, username, anonymous_alias, email, phone, phone_verified,
      password_hash, avatar_url, bio, gender, date_of_birth, role,
      is_verified, is_active, is_suspended, suspension_reason,
      suspended_until, email_verified_at, last_login_at, login_count,
      preferred_language, preferred_currency, timezone,
      notification_prefs, privacy_settings, created_at, updated_at
    `
    )
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}
