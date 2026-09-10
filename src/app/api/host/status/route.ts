import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getUserWithHostProfile } from '@/lib/repositories/users.repository'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const hostId = searchParams.get('hostId')

    if (!hostId) {
      return NextResponse.json({ error: 'hostId is required' }, { status: 400 })
    }

    const { data, error } = await (supabaseAdmin as any)
      .from('phone_a_friend_host_settings')
      .select('is_online, is_enabled, last_seen_at')
      .eq('host_id', hostId)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      isOnline: Boolean(data?.is_online),
      isEnabled: Boolean(data?.is_enabled),
      lastSeenAt: data?.last_seen_at || null,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { hostId, isOnline } = body

    let targetHostId = hostId

    // Try to verify via Supabase session if hostId is omitted or for security
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const dbUser = await getUserWithHostProfile(user.id)
        if (dbUser?.host_profile?.id) {
          targetHostId = dbUser.host_profile.id
        }
      }
    } catch {
      // Fallback to provided hostId if session cookie is restricted in incognito
    }

    if (!targetHostId) {
      return NextResponse.json({ error: 'Unauthorized or missing hostId' }, { status: 400 })
    }

    const nextOnline = Boolean(isOnline)

    const { data, error } = await (supabaseAdmin as any)
      .from('phone_a_friend_host_settings')
      .upsert({
        host_id: targetHostId,
        is_online: nextOnline,
        last_seen_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'host_id' })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      isOnline: nextOnline,
      settings: data
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
