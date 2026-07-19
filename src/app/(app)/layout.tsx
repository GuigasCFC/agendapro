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
    <div className="flex h-screen overflow-hidden bg-muted/30">
      <a
        href="#main-content"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-4 focus-visible:left-4 focus-visible:z-50 focus-visible:rounded-md focus-visible:bg-primary focus-visible:px-4 focus-visible:py-2 focus-visible:text-sm focus-visible:font-medium focus-visible:text-primary-foreground"
      >
        Pular para o conteúdo
      </a>

      <Sidebar organizationName={membership.organization.name} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          organizationName={membership.organization.name}
          userName={user.name}
          userEmail={user.email}
          role={membership.role}
        />

        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-y-auto p-4 outline-none md:p-6"
        >
          {children}
        </main>
      </div>
    </div>
  )
}
