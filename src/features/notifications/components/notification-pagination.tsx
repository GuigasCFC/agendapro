import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"

interface NotificationPaginationProps {
  page: number
  totalPages: number
  total: number
  pageSize: number
  buildHref: (page: number) => string
}

export function NotificationPagination({
  page,
  totalPages,
  total,
  pageSize,
  buildHref,
}: NotificationPaginationProps) {
  if (total === 0) return null

  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)

  return (
    <div className="flex items-center justify-between border-t border-border pt-4 text-sm text-muted-foreground">
      <p>
        Mostrando <span className="font-medium text-foreground">{start}</span>
        {"–"}
        <span className="font-medium text-foreground">{end}</span> de{" "}
        <span className="font-medium text-foreground">{total}</span>
      </p>

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled={page <= 1}
          render={page > 1 ? <Link href={buildHref(page - 1)} /> : undefined}
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <span className="px-2 text-sm">
          {page} / {totalPages}
        </span>

        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled={page >= totalPages}
          render={
            page < totalPages ? <Link href={buildHref(page + 1)} /> : undefined
          }
          aria-label="Próxima página"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
