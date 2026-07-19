"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getActiveMembership } from "@/lib/auth/dal"
import * as notificationsService from "./services"

export async function resendNotification(id: string) {
  const membership = await getActiveMembership()
  if (!membership) redirect("/login")

  await notificationsService.resendNotification(id, membership.organizationId)

  revalidatePath("/notifications")
  revalidatePath(`/notifications/${id}`)
}
