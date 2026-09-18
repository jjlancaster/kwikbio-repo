import { prisma } from '@/lib/prisma'
import { getCachedSecret } from '@/lib/secrets'

/**
 * SECURITY: step-up verification MUST be bound to the authenticated user.
 *
 * Confirms that `telegramId` is the Telegram account linked to THIS specific
 * user, and that the user is an ADMIN. This is the only safe check for deploy
 * step-up.
 *
 * The previous helper (`verifyTelegramAdmin`) took only a telegramId and
 * returned true if it matched *any* ADMIN. Because the id arrived in the
 * request body, one Admin could clear step-up using another Admin's Telegram
 * id — defeating the second factor. It has been removed; do not reintroduce a
 * check that is not bound to a userId.
 *
 * @param userId     - Authenticated session user id (never from the client)
 * @param telegramId - Telegram id being presented as the second factor
 * @returns true only if telegramId is this user's linked id and they are ADMIN
 */
export async function verifyTelegramForUser(
  userId: string,
  telegramId: string
): Promise<boolean> {
  if (!userId || !telegramId || telegramId.trim() === '') {
    return false
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, telegramId: true },
  })

  if (!user || user.role !== 'ADMIN' || !user.telegramId) {
    return false
  }

  // Bind: the presented id must be the id linked to this same account.
  return user.telegramId.trim() === telegramId.trim()
}

/**
 * Sends a notification message via the Telegram Bot API.
 * Useful for deploy confirmations and audit trail messages.
 *
 * @param chatId   - Telegram chat ID to send the message to
 * @param message  - Plain-text or Markdown message body
 */
export async function sendTelegramMessage(chatId: string, message: string): Promise<boolean> {
  try {
    const botToken = await getCachedSecret('TELEGRAM_BOT_TOKEN')
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    })

    if (!response.ok) {
      const body = await response.text()
      console.error(`[telegram] sendMessage failed: ${response.status} — ${body}`)
      return false
    }

    return true
  } catch (error) {
    console.error('[telegram] sendMessage error:', error)
    return false
  }
}

/**
 * Formats a deploy audit message for Telegram notifications.
 */
export function formatDeployAuditMessage(params: {
  adminEmail: string
  action: string
  target: string
  timestamp: Date
}): string {
  const ts = params.timestamp.toISOString()
  return (
    `*[HYDROJOULE DEPLOY AUDIT]*\n` +
    `Admin: \`${params.adminEmail}\`\n` +
    `Action: \`${params.action}\`\n` +
    `Target: \`${params.target}\`\n` +
    `Time: \`${ts}\``
  )
}
