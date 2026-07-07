import { z } from "zod"

export const createEmployeeSchema = z.object({
  name: z.string().min(2, "Informe o nome do funcionário"),
  role: z.string().optional().or(z.literal("")),
  active: z.coerce.boolean(),
})

export const updateEmployeeSchema = createEmployeeSchema.extend({
  id: z.string().min(1),
})

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>
