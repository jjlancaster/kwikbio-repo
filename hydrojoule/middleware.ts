import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { Role } from '@/lib/rbac'

const ROLE_RANK: Record<string, number> = {
  SUBSCRIBER: 1,
  RESEARCHER: 2,
  ADMIN: 3,
}

function hasMinRole(userRole: string | undefined | null, required: Role): boolean {
  if (!userRole) return false
  return (ROLE_RANK[userRole] ?? 0) >= ROLE_RANK[required]
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Get the JWT token — next-auth reads NEXTAUTH_SECRET from environment or
  // the token is unsigned in development. In production, NEXTAUTH_SECRET must
  // be set (it's injected by the auth startup via getCachedSecret).
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const isAuthenticated = !!token
  const userRole = token?.role as string | undefined

  // Helper: redirect to signin, preserving the intended URL as callbackUrl
  const redirectToSignin = () => {
    const signinUrl = new URL('/signin', req.url)
    signinUrl.searchParams.set('callbackUrl', req.url)
    return NextResponse.redirect(signinUrl)
  }

  // Helper: redirect to unauthorized page
  const redirectToUnauthorized = () => {
    return NextResponse.redirect(new URL('/unauthorized', req.url))
  }

  // ── /deploy/** — ADMIN only ───────────────────────────────────────────────
  if (pathname.startsWith('/deploy')) {
    if (!isAuthenticated) return redirectToSignin()
    if (!hasMinRole(userRole, 'ADMIN')) return redirectToUnauthorized()
    return NextResponse.next()
  }

  // ── /licensees/** — ADMIN only ────────────────────────────────────────────
  if (pathname.startsWith('/licensees')) {
    if (!isAuthenticated) return redirectToSignin()
    if (!hasMinRole(userRole, 'ADMIN')) return redirectToUnauthorized()
    return NextResponse.next()
  }

  // ── /patents/** — RESEARCHER or ADMIN ────────────────────────────────────
  if (pathname.startsWith('/patents')) {
    if (!isAuthenticated) return redirectToSignin()
    if (!hasMinRole(userRole, 'RESEARCHER')) return redirectToUnauthorized()
    return NextResponse.next()
  }

  // ── /dashboard/** — any authenticated role ────────────────────────────────
  if (pathname.startsWith('/dashboard')) {
    if (!isAuthenticated) return redirectToSignin()
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/patents/:path*',
    '/licensees/:path*',
    '/deploy/:path*',
  ],
}
