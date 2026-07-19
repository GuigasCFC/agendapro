import type {
  NotificationChannel,
  NotificationType,
} from "@/lib/generated/prisma/enums"

/**
 * Architectural placeholder for real delivery. Nothing in this module
 * calls `dispatchNotification` yet — notifications are only ever created
 * with status PENDING (see services.ts). Wiring a real sender means:
 *
 *   1. Implement `NotificationSender` for the chosen provider (Resend for
 *      EMAIL, Twilio or Evolution API for WHATSAPP).
 *   2. Register it in `SENDERS` below.
 *   3. Add a worker (cron job, queue consumer, or webhook) that pulls
 *      PENDING rows and calls `dispatchNotification`, persisting the
 *      returned status/error/sentAt back onto the row.
 *
 * No cron, queue, or automatic sending is implemented in this stage —
 * intentionally, per scope.
 */

export interface NotificationPayload {
  channel: NotificationChannel
  type: NotificationType
  recipient: string
  subject: string | null
  message: string
}

export interface NotificationDispatchResult {
  status: "SENT" | "FAILED"
  error?: string
}

export interface NotificationSender {
  send(payload: NotificationPayload): Promise<NotificationDispatchResult>
}

class UnconfiguredSender implements NotificationSender {
  async send(payload: NotificationPayload): Promise<NotificationDispatchResult> {
    return {
      status: "FAILED",
      error: `Nenhum provedor configurado para o canal ${payload.channel}.`,
    }
  }
}

const SENDERS: Record<NotificationChannel, NotificationSender> = {
  EMAIL: new UnconfiguredSender(),
  WHATSAPP: new UnconfiguredSender(),
}

export async function dispatchNotification(
  payload: NotificationPayload
): Promise<NotificationDispatchResult> {
  return SENDERS[payload.channel].send(payload)
}
