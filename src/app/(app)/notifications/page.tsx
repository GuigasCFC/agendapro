import { getActiveMembership } from "@/lib/auth/dal"
import { listNotifications } from "@/features/notifications/services"
import { notificationFiltersSchema } from "@/features/notifications/schemas"
import { NotificationFilters } from "@/features/notifications/components/notification-filters"
import { NotificationTable } from "@/features/notifications/components/notification-table"
import { NotificationPagination } from "@/features/notifications/components/notification-pagination"
import { Card, CardContent } from "@/components/ui/card"

interface NotificationsPageProps {
  searchParams: Promise<{
    type?: string
    channel?: string
    status?: string
    from?: string
    to?: string
    q?: string
    page?: string
  }>
}

export default async function NotificationsPage({
  searchParams,
}: NotificationsPageProps) {
  const rawParams = await searchParams
  const filters = notificationFiltersSchema.parse(rawParams)

  const membership = await getActiveMembership()
  const organizationId = membership?.organizationId ?? ""

  const { items, total, page, pageSize, totalPages } = await listNotifications(
    organizationId,
    filters
  )

  function buildHref(nextPage: number) {
    const params = new URLSearchParams()
    if (filters.type) params.set("type", filters.type)
    if (filters.channel) params.set("channel", filters.channel)
    if (filters.status) params.set("status", filters.status)
    if (filters.from) params.set("from", filters.from)
    if (filters.to) params.set("to", filters.to)
    if (filters.q) params.set("q", filters.q)
    params.set("page", String(nextPage))
    return `/notifications?${params.toString()}`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Notificações
        </h1>
        <p className="text-sm text-muted-foreground">
          Histórico de notificações automáticas enviadas aos clientes.
        </p>
      </div>

      <NotificationFilters
        type={filters.type}
        channel={filters.channel}
        status={filters.status}
        from={filters.from}
        to={filters.to}
        q={filters.q}
      />

      <Card>
        <CardContent className="space-y-4">
          <NotificationTable notifications={items} />

          <NotificationPagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            buildHref={buildHref}
          />
        </CardContent>
      </Card>
    </div>
  )
}
