import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: Request) {
  const url = new URL(request.url)
  // Ensure we fall back securely if process env doesn't exist
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || url.origin

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
    },
  })

  // If Supabase OAuth returns a redirect URL, redirect to Google
  if (data.url) {
    return Response.redirect(data.url)
  }

  // Fallback if error occurs
  return Response.redirect(`${siteUrl}/login?error=${encodeURIComponent(error?.message || 'OAuth initialization failed')}`)
}
