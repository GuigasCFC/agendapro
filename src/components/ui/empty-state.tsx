import type { LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
}

export function EmptyState({ icon: Icon, title }: EmptyStateProps) {
  return (
    <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border text-muted-foreground">
      <Icon className="h-8 w-8 opacity-50" />
      <p className="text-sm">{title}</p>
    </div>
  )
}
