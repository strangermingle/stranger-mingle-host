import { headers } from 'next/headers'
import { env } from './env'

const HOST_PRODUCTION_ORIGIN = 'https://host.strangermingle.com'

/**
 * Origin used in Supabase auth redirectTo (password reset, OAuth).
 * Uses the incoming request host so recovery links stay on host.strangermingle.com
 * even when NEXT_PUBLIC_SITE_URL is set to the main/www site.
 */
export async function getAuthCallbackOrigin(): Promise<string> {
  const headerList = await headers()
  const host =
    headerList.get('x-forwarded-host')?.split(',')[0]?.trim() ||
    headerList.get('host')?.split(',')[0]?.trim()

  if (host) {
    const isLocal = host.startsWith('localhost') || host.startsWith('127.0.0.1')
    const proto =
      headerList.get('x-forwarded-proto')?.split(',')[0]?.trim() ||
      (isLocal ? 'http' : 'https')
    return `${proto}://${host}`
  }

  const siteUrl = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  if (siteUrl.includes('host.strangermingle.com')) {
    return siteUrl
  }

  if (env.NEXT_PUBLIC_APP_ENV === 'production') {
    return HOST_PRODUCTION_ORIGIN
  }

  return siteUrl
}

export async function getPasswordResetRedirectTo(): Promise<string> {
  const origin = await getAuthCallbackOrigin()
  return `${origin}/auth/callback?next=/reset-password`
}
