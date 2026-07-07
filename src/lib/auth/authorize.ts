import "server-only"

import { redirect } from "next/navigation"
import { MembershipRole } from "@/lib/generated/prisma/client"
import { getActiveMembership } from "./dal"

const ROLE_RANK: Record<MembershipRole, number> = {
  MEMBER: 1,
  ADMIN: 2,
  OWNER: 3,
}

export async function requireRole(minRole: MembershipRole) {
  const membership = await getActiveMembership()

  if (!membership || ROLE_RANK[membership.role] < ROLE_RANK[minRole]) {
    redirect("/dashboard")
  }

  return membership
}
