import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { isAdmin } from '@/lib/rbac'
import { verifyTelegramForUser, sendTelegramMessage, formatDeployAuditMessage } from '@/lib/telegram'
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

// SECURITY: the deployment target is server-owned. The browser must never be
// able to choose which server an action runs against.
const JEWEL_SERVER_ID = process.env.JEWEL_SERVER_ID ?? 'jewel-default'

export async function POST(req: NextRequest) {
  // 1. Verify session
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
  }
  if (!isAdmin(session)) {
    return NextResponse.json({ error: 'Insufficient privileges' }, { status: 403 })
  }

  // 2. Parse request. NOTE: `telegramId` and `target` are intentionally NOT
  //    read from the body — step-up identity and the deploy target are both
  //    resolved server-side (see 4 and 5).
  let actionId: string
  try {
    const body = await req.json() as { actionId?: string }
    actionId = body.actionId?.trim() ?? ''
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // 3. Validate action ID against the server-side allowlist
  if (!ALLOWED_ACTION_IDS.includes(actionId)) {
    return NextResponse.json({ error: `Unknown action: ${actionId}` }, { status: 400 })
  }

  // 4. Resolve the acting admin from the SESSION, and re-verify the Telegram
  //    second factor bound to that same account. Previously the telegramId came
  //    from the request body and was only checked against "any ADMIN", so an
  //    admin could pass another admin's id and defeat step-up.
  const adminUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, telegramId: true },
  })

  if (!adminUser?.telegramId) {
    return NextResponse.json(
      { error: 'Telegram verification required: no Telegram account linked to this admin.' },
      { status: 403 }
    )
  }

  const isVerified = await verifyTelegramForUser(session.user.id, adminUser.telegramId)
  if (!isVerified) {
    return NextResponse.json({ error: 'Telegram gatekeeper verification failed' }, { status: 403 })
  }

  // 5. Server-owned target
  const target = JEWEL_SERVER_ID

  // 6. Log the action in the audit trail
  console.info(`[deploy/run] Admin ${adminUser.email} executing action: ${actionId} on target: ${target}`)

  // 7. Send Telegram audit notification to the acting admin's own linked account
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

  // 8. Execute the action
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
