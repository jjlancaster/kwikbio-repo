import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { isAdmin } from '@/lib/rbac'
import { verifyTelegramAdmin } from '@/lib/telegram'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  // 1. Verify the session is an ADMIN
  const session = await auth()
  if (!session?.user) {
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

  // 3. Verify Telegram ID belongs to an ADMIN
  const isVerified = await verifyTelegramAdmin(telegramId)

  if (!isVerified) {
    return NextResponse.json(
      { error: 'Telegram ID is not linked to an ADMIN account.' },
      { status: 403 }
    )
  }

  return NextResponse.json({ verified: true })
}
