/**
 * NextAuth.js v5 catch-all route handler.
 *
 * Secrets are resolved from Google Secret Manager at runtime on first request.
 * This file must NOT import any module that runs code at import time that
 * requires secrets — all secret resolution is deferred to getAuthInstance().
 */

import { getAuthInstance } from '@/lib/auth'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

async function handler(req: NextRequest) {
  const instance = await getAuthInstance()
  const { GET, POST } = instance.handlers
  if (req.method === 'GET') return GET(req)
  if (req.method === 'POST') return POST(req)
  return new Response('Method Not Allowed', { status: 405 })
}

export { handler as GET, handler as POST }
