import "server-only"

import { cache } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"

export const getSession = cache(async () => {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) return null
  return data.user
})

export const requireSession = cache(async () => {
  const user = await getSession()
  if (!user) redirect("/login")
  return user
})

export const getCurrentUser = cache(async () => {
  const authUser = await requireSession()
  return db.user.findUnique({
    where: { id: authUser.id },
    include: {
      memberships: {
        include: { organization: true },
        orderBy: { createdAt: "asc" },
      },
    },
  })
})

export const getActiveMembership = cache(async () => {
  const user = await getCurrentUser()
  return user?.memberships[0] ?? null
})
