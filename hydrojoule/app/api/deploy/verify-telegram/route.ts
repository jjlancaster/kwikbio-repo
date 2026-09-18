import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { isAdmin } from '@/lib/rbac'
import { verifyTelegramForUser } from '@/lib/telegram'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  // 1. Verify the session is an ADMIN
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
  }
  if (!isAdmin(session)) {
    return NextResponse.json({ error: 'Insufficient privileges' }, { status: 403 })
  }

  // 2. Parse the request body
  let telegramId: string
  try {
    const body = await req.json() as { telegramId?: string }
    telegramId = body.telegramId?.trim() ?? ''
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!telegramId) {
    return NextResponse.json({ error: 'telegramId is required' }, { status: 400 })
  }

  // 3. SECURITY: the presented Telegram id must be the one linked to THIS
  //    authenticated admin. Previously this accepted any ADMIN's Telegram id,
  //    so one admin could clear step-up with another admin's id.
  const isVerified = await verifyTelegramForUser(session.user.id, telegramId)

  if (!isVerified) {
    // Deliberately non-specific: do not reveal whether the id exists or
    // belongs to a different account.
    return NextResponse.json(
      { error: 'Telegram verification failed for this account.' },
      { status: 403 }
    )
  }

  return NextResponse.json({ verified: true })
}
