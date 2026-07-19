import Link from "next/link"
import { format } from "date-fns"
import { Bell, Eye, Mail, MessageCircle, RotateCcw } from "lucide-react"

import { resendNotification } from "@/features/notifications/actions"
import { NOTIFICATION_TYPE_LABELS } from "@/features/notifications/schemas"
import { NotificationStatusBadge } from "@/features/notifications/components/notification-status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export interface NotificationRow {
  id: string
  type: string
  channel: string
  status: string
  recipient: string
  createdAt: Date
  customer: { id: string; name: string } | null
}

interface NotificationTableProps {
  notifications: NotificationRow[]
}

export function NotificationTable({ notifications }: NotificationTableProps) {
  if (notifications.length === 0) {
    return (
      <EmptyState
        icon={Bell}
        title="Nenhuma notificação encontrada para os filtros selecionados."
      />
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cliente</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Canal</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Data</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {notifications.map((notification) => (
          <TableRow key={notification.id}>
            <TableCell className="max-w-[200px] truncate font-medium">
              {notification.customer?.name ?? notification.recipient}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {NOTIFICATION_TYPE_LABELS[notification.type] ?? notification.type}
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="gap-1">
                {notification.channel === "EMAIL" ? (
                  <Mail className="h-3 w-3" />
                ) : (
                  <MessageCircle className="h-3 w-3" />
                )}
                {notification.channel === "EMAIL" ? "E-mail" : "WhatsApp"}
              </Badge>
            </TableCell>
            <TableCell>
              <NotificationStatusBadge status={notification.status} />
            </TableCell>
            <TableCell className="font-mono text-muted-foreground">
              {format(notification.createdAt, "dd/MM/yyyy HH:mm")}
            </TableCell>
            <TableCell className="flex justify-end gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                render={<Link href={`/notifications/${notification.id}`} />}
                aria-label="Visualizar"
                title="Visualizar"
              >
                <Eye className="h-4 w-4" />
              </Button>

              {notification.status !== "SENT" && (
                <form action={resendNotification.bind(null, notification.id)}>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    type="submit"
                    aria-label="Reenviar"
                    title="Reenviar"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </form>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
