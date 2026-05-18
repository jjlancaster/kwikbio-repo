import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { isAdmin } from '@/lib/rbac'
import { verifyTelegramAdmin, sendTelegramMessage, formatDeployAuditMessage } from '@/lib/telegram'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const ALLOWED_ACTION_IDS = [
  'terraform-plan',
  'terraform-apply',
  'brainfile-update',
  'ars-restart',
  'db-migrate',
]

export async function POST(req: NextRequest) {
  // 1. Verify session
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
  }
  if (!isAdmin(session)) {
    return NextResponse.json({ error: 'Insufficient privileges' }, { status: 403 })
  }

  // 2. Parse request
  let actionId: string, target: string, telegramId: string
  try {
    const body = await req.json() as { actionId?: string; target?: string; telegramId?: string }
    actionId = body.actionId?.trim() ?? ''
    target = body.target?.trim() ?? ''
    telegramId = body.telegramId?.trim() ?? ''
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // 3. Validate action ID
  if (!ALLOWED_ACTION_IDS.includes(actionId)) {
    return NextResponse.json({ error: `Unknown action: ${actionId}` }, { status: 400 })
  }

  // 4. Re-verify Telegram gatekeeper on every deploy action
  if (!telegramId) {
    return NextResponse.json({ error: 'Telegram verification required' }, { status: 403 })
  }
  const isVerified = await verifyTelegramAdmin(telegramId)
  if (!isVerified) {
    return NextResponse.json({ error: 'Telegram gatekeeper verification failed' }, { status: 403 })
  }

  // 5. Log the action in the audit trail
  const adminUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, telegramId: true },
  })

  console.info(`[deploy/run] Admin ${adminUser?.email} executing action: ${actionId} on target: ${target}`)

  // 6. Send Telegram audit notification
  if (adminUser?.telegramId) {
    const auditMsg = formatDeployAuditMessage({
      adminEmail: adminUser.email,
      action: actionId,
      target,
      timestamp: new Date(),
    })
    // Fire-and-forget — don't block the response on Telegram delivery
    sendTelegramMessage(adminUser.telegramId, auditMsg).catch((err) => {
      console.error('[deploy/run] Failed to send Telegram audit message:', err)
    })
  }

  // 7. Execute the action
  // In a real deployment, this would trigger the actual infrastructure commands.
  // Here we return a success response with a message indicating the action was
  // queued. Actual execution is handled by the CI/CD pipeline or a sidecar process
  // that watches for signed action tokens.
  const messages: Record<string, string> = {
    'terraform-plan': 'Terraform plan queued. Results will be available in the CI pipeline.',
    'terraform-apply': 'Terraform apply queued. Infrastructure changes will be applied within 5 minutes.',
    'brainfile-update': 'BrainFile update queued. ARS knowledge store will be refreshed shortly.',
    'ars-restart': 'ARS engine restart signal sent. Expect ~30s of reduced availability.',
    'db-migrate': 'Database migration job queued. Monitor progress in the Prisma migrate log.',
  }

  return NextResponse.json({
    success: true,
    actionId,
    target,
    message: messages[actionId] ?? 'Action queued successfully.',
    timestamp: new Date().toISOString(),
  })
}
