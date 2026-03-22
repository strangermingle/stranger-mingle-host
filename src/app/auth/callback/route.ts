import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import crypto from 'crypto'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // Also handle next param for custom redirections
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && session?.user) {
      const u = session.user
      const headerList = await headers()
      const userAgent = headerList.get('user-agent') || 'unknown'
      const ipAddress = headerList.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1'
      
      // 1. Check if user exists in our users table
      const { data: dbUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('id', u.id)
        .single()
        
      // 2. If new user, insert them 
      if (!dbUser && u.email) {
        // Derive username from email local part + random 4 digits
        const localPart = u.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '')
        const rnd = Math.floor(1000 + Math.random() * 9000)
        let username = `${localPart}${rnd}`.substring(0, 50)
        
        // Generate anonymous alias: adjective + animal + 4 digits
        const adjectives = ['Happy', 'Brave', 'Quiet', 'Swift', 'Red', 'Blue', 'Neon', 'Cool']
        const animals = ['Fox', 'Bear', 'Wolf', 'Owl', 'Panda', 'Tiger', 'Lion']
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
        const animal = animals[Math.floor(Math.random() * animals.length)]
        const alias = `${adj}${animal}${rnd}`
        
        const { error: insertError } = await supabaseAdmin.from('users').insert({
          id: u.id,
          email: u.email,
          username,
          anonymous_alias: alias,
          avatar_url: u.user_metadata?.avatar_url || u.user_metadata?.picture || null,
          is_verified: true, // Google auth users are verified
          email_verified_at: new Date().toISOString()
        })
        
        if (insertError) {
          console.error('OAuth user creation failed', insertError)
        }
      } else if (dbUser && u.user_metadata) {
        // Update existing user with latest info from Google if missing
        await supabaseAdmin.from('users').update({
          avatar_url: u.user_metadata?.avatar_url || u.user_metadata?.picture || null,
          is_verified: true,
          updated_at: new Date().toISOString()
        }).eq('id', u.id)
      }

      // 3. Populate user_oauth_accounts
      if (session.provider_token || session.provider_refresh_token) {
        const expiresAt = session.expires_at 
          ? new Date(session.expires_at * 1000).toISOString() 
          : null

        await supabaseAdmin.from('user_oauth_accounts').upsert({
          user_id: u.id,
          provider: u.app_metadata.provider || 'google',
          provider_uid: u.id, // Supabase user ID is consistent for the provider
          access_token: session.provider_token,
          refresh_token: session.provider_refresh_token,
          token_expires_at: expiresAt
        }, { onConflict: 'provider, provider_uid' })
      }

      // 4. Create session record in user_sessions
      const tokenHash = crypto.createHash('sha256').update(session.access_token).digest('hex')
      const expiresAt = session.expires_at 
        ? new Date(session.expires_at * 1000).toISOString()
        : new Date(Date.now() + 3600 * 1000).toISOString() // Fallback to 1 hour if missing

      await supabaseAdmin.from('user_sessions').insert({
        user_id: u.id,
        token_hash: tokenHash,
        device_info: {
          userAgent,
          platform: headerList.get('sec-ch-ua-platform') || 'unknown'
        },
        ip_address: ipAddress,
        expires_at: expiresAt,
        is_active: true
      })
      
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Invalid login parameters or session`)
}
