import type { LucideIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import type { RankingRow } from "@/features/reports/services"

interface RankingTableProps {
  title: string
  emptyIcon: LucideIcon
  emptyLabel: string
  countLabel: string
  rows: RankingRow[]
}

export function RankingTable({
  title,
  emptyIcon,
  emptyLabel,
  countLabel,
  rows,
}: RankingTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <CardContent>
        {rows.length === 0 ? (
          <EmptyState icon={emptyIcon} title={emptyLabel} />
        ) : (
          <div className="space-y-1">
            {rows.map((row, index) => (
              <div
                key={row.id}
                className="flex items-center gap-3 rounded-lg border border-transparent p-2.5 transition-colors hover:border-border hover:bg-muted/50"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {index + 1}
                </div>

                <p className="flex-1 truncate font-medium text-foreground">
                  {row.name}
                </p>

                <p className="shrink-0 whitespace-nowrap font-mono text-sm font-semibold text-foreground">
                  {row.count}{" "}
                  <span className="font-sans font-normal text-muted-foreground">
                    {countLabel}
                  </span>
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
