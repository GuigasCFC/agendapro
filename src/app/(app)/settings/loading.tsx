import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

function FieldSkeleton() {
  return (
    <div className="space-y-1.5">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-9 w-full" />
    </div>
  )
}

export default function SettingsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Empresa */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldSkeleton />
              <FieldSkeleton />
              <FieldSkeleton />
              <FieldSkeleton />
              <div className="sm:col-span-2">
                <FieldSkeleton />
              </div>
              <div className="sm:col-span-2">
                <FieldSkeleton />
              </div>
              <FieldSkeleton />
              <FieldSkeleton />
              <FieldSkeleton />
            </div>
            <Skeleton className="h-9 w-44" />
          </CardContent>
        </Card>

        {/* Horário de funcionamento */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 7 }).map((_, index) => (
              <Skeleton key={index} className="h-14 w-full rounded-xl" />
            ))}
            <Skeleton className="h-9 w-36" />
          </CardContent>
        </Card>

        {/* Agenda */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent className="space-y-4">
            <FieldSkeleton />
            <Skeleton className="h-9 w-24" />
          </CardContent>
        </Card>

        {/* Aparência */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
            </div>
          </CardContent>
        </Card>

        {/* Preferências */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldSkeleton />
              <FieldSkeleton />
              <FieldSkeleton />
              <FieldSkeleton />
              <FieldSkeleton />
            </div>
            <Skeleton className="h-9 w-36" />
          </CardContent>
        </Card>

        {/* Equipe */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </CardContent>
        </Card>

        {/* Segurança */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <FieldSkeleton />
            <FieldSkeleton />
            <Skeleton className="h-9 w-32" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
