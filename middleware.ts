import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const portalPublicRoutes = ['/portal/login', '/portal/accept-invite']

function isPortalPublicRoute(pathname: string) {
  return portalPublicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPortalRoute = pathname.startsWith('/portal')
  const isAdminRoute = pathname.startsWith('/admin')

  if (!isPortalRoute && !isAdminRoute) {
    return NextResponse.next()
  }

  if (isPortalRoute && isPortalPublicRoute(pathname)) {
    return NextResponse.next()
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  if (!token?.id) {
    const url = request.nextUrl.clone()
    url.pathname = '/portal/login'
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }

  if (isAdminRoute && token.role !== 'admin') {
    return NextResponse.redirect(new URL('/portal/dashboard', request.url))
  }

  if (isPortalRoute && token.role !== 'client' && token.role !== 'admin') {
    return NextResponse.redirect(new URL('/portal/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/portal/:path*', '/admin/:path*'],
}
