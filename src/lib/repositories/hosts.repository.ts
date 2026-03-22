import { createClient } from '../supabase/server'
import { HostWithDetails, EventWithDetails } from '@/types/api.types'

export async function getHostProfileByUsername(username: string): Promise<HostWithDetails | null> {
  const supabase = await createClient()

  // First get the user by username (case-insensitive)
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id, username, avatar_url, bio')
    .ilike('username', username)
    .single()

  if (userError || !userData) {
    console.error(`User not found for username "${username}":`, userError)
    return null
  }

  // Then get host profile
  const { data: hostData, error: hostError } = await supabase
    .from('host_profiles')
    .select('*')
    .eq('user_id', userData.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (hostError || !hostData) {
    console.error(`Host profile not found for user_id "${userData.id}" (${username}):`, hostError)
    return null
  }

  // Get follower count
  const { count: followerCount } = await supabase
    .from('host_follows')
    .select('*', { count: 'exact', head: true })
    .eq('host_id', hostData.id)

  // Get event count
  const { count: eventCount } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('host_id', userData.id)
    .eq('status', 'published')

  // Check if current user follows
  const { data: sessionData } = await supabase.auth.getSession()
  let isFollowing = false
  if (sessionData?.session?.user) {
    const { data: followData } = await supabase
      .from('host_follows')
      .select('id')
      .eq('follower_id', sessionData.session.user.id)
      .eq('host_id', hostData.id)
      .maybeSingle()
    
    isFollowing = !!followData
  }

  return {
    ...hostData,
    user: userData as any,
    follower_count: followerCount || 0,
    event_count: eventCount || 0,
    is_following: isFollowing
  } as HostWithDetails
}

export async function getHostEvents(hostId: string): Promise<EventWithDetails[]> {
  const supabase = await createClient()

  const { data: userData } = await supabase.from('users').select('username').eq('id', hostId).single()
  const username = userData?.username

  if (!username) return []

  const { data, error } = await supabase
    .from('v_events_public')
    .select('*')
    .eq('host_username', username)
    .eq('status', 'published')
    .order('start_datetime', { ascending: true })

  if (error) return []
  return data as unknown as EventWithDetails[]
}

export async function getAllHosts(): Promise<HostWithDetails[]> {
  const supabase = await createClient()

  const { data, error } = await (supabase
    .from('host_profiles') as any)
    .select(`
      *,
        avatar_url
    `)
    .eq('is_approved', true)
    .order('follower_count', { ascending: false })

  if (error) return []
  
  return data as unknown as HostWithDetails[]
}
