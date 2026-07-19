import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function EditServiceLoading() {
  return (
    <div className="max-w-lg space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-4 w-56" />
      </div>

      <Card>
        <CardContent className="space-y-4">
          <Skeleton className="h-9 w-full" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-9 w-32" />
        </CardContent>
      </Card>
    </div>
  )
}
