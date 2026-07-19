interface UsageMeterProps {
  label: string
  used: number
  limit: number | null
}

export function UsageMeter({ label, used, limit }: UsageMeterProps) {
  const percent = limit === null ? 0 : Math.min(100, Math.round((used / limit) * 100))
  const isNearLimit = limit !== null && used >= limit

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span
          className={
            isNearLimit ? "font-medium text-destructive" : "font-medium text-foreground"
          }
        >
          {used}
          {limit === null ? "" : ` / ${limit}`}
        </span>
      </div>

      {limit !== null && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={
              isNearLimit ? "h-full bg-destructive" : "h-full bg-primary"
            }
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
    </div>
  )
}
