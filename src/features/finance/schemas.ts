import { z } from "zod"

export const transactionTypeEnum = z.enum(["INCOME", "EXPENSE"])

export const createTransactionSchema = z.object({
  type: transactionTypeEnum,
  amount: z.coerce.number().positive("O valor deve ser maior que zero"),
  category: z.string().min(2, "Informe a categoria"),
  description: z.string().optional().or(z.literal("")),
  occurredAt: z.string().min(1, "Informe a data"),
  customerId: z.string().optional().or(z.literal("")),
  appointmentId: z.string().optional().or(z.literal("")),
})

export const updateTransactionSchema = createTransactionSchema.extend({
  id: z.string().min(1),
})

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>
