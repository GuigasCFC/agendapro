import { z } from "zod"

export const createCustomerSchema = z.object({
  name: z.string().min(2, "Informe o nome do cliente"),
  email: z.email("Informe um e-mail válido").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
})

export const updateCustomerSchema = createCustomerSchema.extend({
  id: z.string().min(1),
})

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>
