import type { LucideIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const TONE_STYLES = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  destructive: "bg-destructive/10 text-destructive",
  info: "bg-info/10 text-info",
} as const

interface StatsCardProps {
  title: string
  value: string
  icon: LucideIcon
  tone?: keyof typeof TONE_STYLES
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  tone = "primary",
}: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="min-w-0 truncate text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>

        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
            TONE_STYLES[tone]
          )}
        >
          <Icon className="h-[18px] w-[18px]" />
        </div>
      </CardHeader>

      <CardContent>
        <div
          className="truncate font-mono text-3xl font-semibold tracking-tight text-foreground"
          title={value}
        >
          {value}
        </div>
      </CardContent>
    </Card>
  )
}
