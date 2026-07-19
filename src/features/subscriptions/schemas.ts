import { z } from "zod"

export const paidPlanSchema = z.object({
  plan: z.enum(["PRO", "PREMIUM"]),
})

export type PaidPlanInput = z.infer<typeof paidPlanSchema>
