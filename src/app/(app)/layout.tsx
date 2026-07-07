import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { getCurrentUser, getActiveMembership } from "@/lib/auth/dal"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser()
  const membership = await getActiveMembership()

  if (!user || !membership) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar organizationName={membership.organization.name} />

      <div className="flex flex-1 flex-col">
        <Header
          userName={user.name}
          userEmail={user.email}
          role={membership.role}
        />

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
