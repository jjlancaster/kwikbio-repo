import { prisma } from '@/lib/prisma'
import { getCachedSecret } from '@/lib/secrets'

/**
 * Verifies that a given Telegram user ID belongs to an active ADMIN in the
 * hydrojoule system. Used as the gatekeeper before any deploy action.
 *
 * @param telegramId - The numeric Telegram user ID as a string
 * @returns true if the telegramId maps to a verified ADMIN user
 */
export async function verifyTelegramAdmin(telegramId: string): Promise<boolean> {
  if (!telegramId || telegramId.trim() === '') {
    return false
  }

  const user = await prisma.user.findFirst({
    where: {
      telegramId: telegramId.trim(),
      role: 'ADMIN',
    },
    select: {
      id: true,
      role: true,
      telegramId: true,
    },
  })

  return user !== null && user.role === 'ADMIN'
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
