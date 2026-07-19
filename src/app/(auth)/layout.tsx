import type { ReactNode } from "react"

import { Card, CardContent } from "@/components/ui/card"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Agenda<span className="text-primary">Pro</span>
          </h1>
        </div>

        <Card>
          <CardContent>{children}</CardContent>
        </Card>
      </div>
    </div>
  )
}
