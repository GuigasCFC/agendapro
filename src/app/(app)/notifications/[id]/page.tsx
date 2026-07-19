import Link from "next/link"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { ArrowLeft, Mail, MessageCircle, RotateCcw } from "lucide-react"

import { getActiveMembership } from "@/lib/auth/dal"
import { getNotification } from "@/features/notifications/services"
import { resendNotification } from "@/features/notifications/actions"
import { NOTIFICATION_TYPE_LABELS } from "@/features/notifications/schemas"
import { NotificationStatusBadge } from "@/features/notifications/components/notification-status-badge"
import { NotificationTimeline } from "@/features/notifications/components/notification-timeline"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface NotificationDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function NotificationDetailPage({
  params,
}: NotificationDetailPageProps) {
  const { id } = await params
  const membership = await getActiveMembership()
  const notification = membership
    ? await getNotification(id, membership.organizationId)
    : null

  if (!notification) {
    notFound()
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <Button
            variant="ghost"
            size="sm"
            render={<Link href="/notifications" />}
            className="mb-2 -ml-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {NOTIFICATION_TYPE_LABELS[notification.type] ?? notification.type}
          </h1>
          <p className="text-sm text-muted-foreground break-words">
            Detalhes da notificação enviada para {notification.recipient}.
          </p>
        </div>

        {notification.status !== "SENT" && (
          <form
            action={resendNotification.bind(null, notification.id)}
            className="shrink-0"
          >
            <Button type="submit" variant="outline">
              <RotateCcw className="h-4 w-4" />
              Reenviar
            </Button>
          </form>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Mensagem</CardTitle>
            <CardDescription>
              {notification.subject || "Sem assunto"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="max-h-48 overflow-y-auto rounded-xl border border-border bg-muted/30 p-3 text-sm text-foreground break-words whitespace-pre-wrap">
              {notification.message}
            </p>

            <dl className="grid grid-cols-2 gap-4 text-sm break-words">
              <div>
                <dt className="text-muted-foreground">Destinatário</dt>
                <dd className="font-medium text-foreground">
                  {notification.recipient}
                </dd>
              </div>

              <div>
                <dt className="text-muted-foreground">Cliente</dt>
                <dd className="font-medium text-foreground">
                  {notification.customer?.name ?? "—"}
                </dd>
              </div>

              <div>
                <dt className="text-muted-foreground">Canal</dt>
                <dd>
                  <Badge variant="outline" className="gap-1">
                    {notification.channel === "EMAIL" ? (
                      <Mail className="h-3 w-3" />
                    ) : (
                      <MessageCircle className="h-3 w-3" />
                    )}
                    {notification.channel === "EMAIL" ? "E-mail" : "WhatsApp"}
                  </Badge>
                </dd>
              </div>

              <div>
                <dt className="text-muted-foreground">Status</dt>
                <dd>
                  <NotificationStatusBadge status={notification.status} />
                </dd>
              </div>

              {notification.appointment && (
                <div className="col-span-2">
                  <dt className="text-muted-foreground">Agendamento</dt>
                  <dd className="font-medium text-foreground">
                    {notification.appointment.service.name} —{" "}
                    {format(
                      notification.appointment.startsAt,
                      "dd/MM/yyyy HH:mm"
                    )}
                  </dd>
                </div>
              )}

              {notification.error && (
                <div className="col-span-2">
                  <dt className="text-muted-foreground">Erro</dt>
                  <dd className="font-medium text-destructive">
                    {notification.error}
                  </dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Linha do tempo</CardTitle>
            <CardDescription>Ciclo de vida desta notificação.</CardDescription>
          </CardHeader>

          <CardContent>
            <NotificationTimeline
              createdAt={notification.createdAt}
              status={notification.status}
              sentAt={notification.sentAt}
              error={notification.error}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
