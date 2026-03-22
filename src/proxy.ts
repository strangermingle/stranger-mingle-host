import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from './lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)

  const { pathname } = request.nextUrl

  // Public routes that don't need auth
  const publicRoutes = ['/login', '/register', '/events', '/hosts', '/forgot-password', '/reset-password', '/api/']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route)) || pathname === '/favicon.ico' || pathname.includes('.')

  // Protect all non-public routes
  if (!isPublicRoute) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Protect /admin/* routes
  if (pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Additional admin role check should be done on the layout or page level
    // since we can't easily fetch user roles in edge middleware without an extra DB call,
    // though if it's attached to user_metadata you could check `user.user_metadata.role` here.
    // For now, redirecting to login if not authenticated is required.
  }

  // --- Proxy Logic from old proxy.ts ---
  const hostname = request.headers.get('host') || '';
  const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1') || hostname.includes('0.0.0.0');

  if (!isLocalhost) {
    const host = hostname.split(':')[0];
    const ALLOWED_DOMAINS = [
      'host.strangermingle.com',
      'strangermingle.com',
      'host.strangermingle.com',
      'admin.strangermingle.com'
    ];

    // Redirect non-www to www ONLY for the main domain if that's still desired
    // However, if we are on a subdomain, we should stay there.
    if (host === 'strangermingle.com') {
      const urlWithWww = request.nextUrl.clone();
      urlWithWww.host = 'host.strangermingle.com';
      return NextResponse.redirect(urlWithWww);
    }

    // Allow the specified subdomains
    if (!ALLOWED_DOMAINS.includes(host)) {
      return new NextResponse(`Access Denied: This website is not accessible from ${host}`, {
        status: 403,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    // Force HTTPS in production
    if (request.nextUrl.protocol !== 'https:' && process.env.NODE_ENV === 'production') {
      const httpsUrl = request.nextUrl.clone();
      httpsUrl.protocol = 'https:';
      return NextResponse.redirect(httpsUrl);
    }
  }
  // -------------------------------------

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
