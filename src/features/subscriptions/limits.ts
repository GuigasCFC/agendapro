import type { SubscriptionPlan } from "@/lib/generated/prisma/client"

export interface PlanLimits {
  customers: number | null
  employees: number | null
  services: number | null
  appointmentsPerMonth: number | null
}

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  FREE: { customers: 20, employees: 1, services: 5, appointmentsPerMonth: 30 },
  PRO: { customers: 200, employees: 5, services: 30, appointmentsPerMonth: 300 },
  PREMIUM: {
    customers: null,
    employees: null,
    services: null,
    appointmentsPerMonth: null,
  },
}

export const PLAN_LABELS: Record<SubscriptionPlan, string> = {
  FREE: "Grátis",
  PRO: "Pro",
  PREMIUM: "Premium",
}

export const PLAN_PRICES: Record<SubscriptionPlan, string> = {
  FREE: "R$ 0/mês",
  PRO: "R$ 79/mês",
  PREMIUM: "R$ 199/mês",
}

export const PLAN_ORDER: SubscriptionPlan[] = ["FREE", "PRO", "PREMIUM"]

export type LimitResource = keyof PlanLimits

export const LIMIT_RESOURCE_LABELS: Record<LimitResource, string> = {
  customers: "clientes",
  employees: "funcionários",
  services: "serviços",
  appointmentsPerMonth: "agendamentos neste mês",
}
