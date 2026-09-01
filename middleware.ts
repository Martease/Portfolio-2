import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/back-office')
  const isAdminApiRoute = pathname.startsWith('/api/back-office')

  if (!isAdminRoute && !isAdminApiRoute) {
    return NextResponse.next()
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  if (!token?.id) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }

  if (token.role !== 'admin') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Add security headers to response
  const response = NextResponse.next()
  
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
  
  // Strict-Transport-Security (only in production)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/back-office/:path*', '/api/back-office/:path*'],
}
