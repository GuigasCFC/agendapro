import { db } from "@/lib/db"
import type { Subscription } from "@/lib/generated/prisma/client"
import { getEffectiveStatus, isBlockingStatus } from "./status"
import { LIMIT_RESOURCE_LABELS, PLAN_LIMITS, type LimitResource } from "./limits"

export const TRIAL_DAYS = 7

export function addDays(date: Date, days: number) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export async function getOrCreateSubscription(
  organizationId: string
): Promise<Subscription> {
  const existing = await db.subscription.findUnique({ where: { organizationId } })
  if (existing) return existing

  const trialEndsAt = addDays(new Date(), TRIAL_DAYS)

  return db.subscription.create({
    data: {
      organizationId,
      plan: "PRO",
      status: "TRIAL",
      trialEndsAt,
      currentPeriodEnd: trialEndsAt,
    },
  })
}

export interface UsageCounts {
  customers: number
  employees: number
  services: number
  appointmentsPerMonth: number
}

function startOfCurrentMonth() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

export async function getUsage(organizationId: string): Promise<UsageCounts> {
  const [customers, employees, services, appointmentsPerMonth] = await Promise.all([
    db.customer.count({ where: { organizationId } }),
    db.employee.count({ where: { organizationId } }),
    db.service.count({ where: { organizationId } }),
    db.appointment.count({
      where: { organizationId, createdAt: { gte: startOfCurrentMonth() } },
    }),
  ])

  return { customers, employees, services, appointmentsPerMonth }
}

export async function getSubscriptionSummary(organizationId: string) {
  const subscription = await getOrCreateSubscription(organizationId)
  const status = getEffectiveStatus(subscription)
  const limits = PLAN_LIMITS[subscription.plan]
  const usage = await getUsage(organizationId)

  return { subscription, status, limits, usage }
}

async function countResource(organizationId: string, resource: LimitResource) {
  switch (resource) {
    case "customers":
      return db.customer.count({ where: { organizationId } })
    case "employees":
      return db.employee.count({ where: { organizationId } })
    case "services":
      return db.service.count({ where: { organizationId } })
    case "appointmentsPerMonth":
      return db.appointment.count({
        where: { organizationId, createdAt: { gte: startOfCurrentMonth() } },
      })
  }
}

/**
 * Deve ser chamado antes de criar cliente, funcionário, serviço ou
 * agendamento. Lança erro (mensagem amigável) quando a assinatura está
 * bloqueada ou o limite do plano foi atingido.
 */
export async function assertWithinLimit(
  organizationId: string,
  resource: LimitResource
) {
  const subscription = await getOrCreateSubscription(organizationId)
  const status = getEffectiveStatus(subscription)

  if (isBlockingStatus(status)) {
    throw new Error(
      "Sua assinatura expirou. Renove o plano para continuar usando o sistema."
    )
  }

  const limit = PLAN_LIMITS[subscription.plan][resource]
  if (limit === null) return

  const count = await countResource(organizationId, resource)
  if (count >= limit) {
    throw new Error(
      `Limite do plano ${subscription.plan} atingido: até ${limit} ${LIMIT_RESOURCE_LABELS[resource]}. Faça upgrade para continuar.`
    )
  }
}

export async function switchToFreePlan(organizationId: string) {
  await db.subscription.update({
    where: { organizationId },
    data: {
      plan: "FREE",
      status: "ACTIVE",
      trialEndsAt: null,
      currentPeriodEnd: null,
      canceledAt: null,
    },
  })
}
