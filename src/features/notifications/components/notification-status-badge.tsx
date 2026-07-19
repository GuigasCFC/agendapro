import { CheckCircle2, CircleDashed, XCircle, type LucideIcon } from "lucide-react"

import { Badge, type badgeVariants } from "@/components/ui/badge"
import { NOTIFICATION_STATUS_LABELS } from "@/features/notifications/schemas"
import type { VariantProps } from "class-variance-authority"

const STATUS_VARIANTS: Record<
  string,
  NonNullable<VariantProps<typeof badgeVariants>["variant"]>
> = {
  PENDING: "warning",
  SENT: "success",
  FAILED: "destructive",
}

const STATUS_ICONS: Record<string, LucideIcon> = {
  PENDING: CircleDashed,
  SENT: CheckCircle2,
  FAILED: XCircle,
}

interface NotificationStatusBadgeProps {
  status: string
}

export function NotificationStatusBadge({
  status,
}: NotificationStatusBadgeProps) {
  const Icon = STATUS_ICONS[status]

  return (
    <Badge variant={STATUS_VARIANTS[status] ?? "secondary"} className="gap-1">
      {Icon && <Icon className="h-3 w-3" />}
      {NOTIFICATION_STATUS_LABELS[status] ?? status}
    </Badge>
  )
}
