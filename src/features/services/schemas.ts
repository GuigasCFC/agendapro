import { z } from "zod"

export const createServiceSchema = z.object({
  name: z.string().min(2, "Informe o nome do serviço"),
  durationMin: z.coerce
    .number()
    .int("A duração deve ser um número inteiro")
    .positive("A duração deve ser maior que zero"),
  price: z.coerce.number().positive("O preço deve ser maior que zero"),
  active: z.coerce.boolean(),
})

export const updateServiceSchema = createServiceSchema.extend({
  id: z.string().min(1),
})

export type CreateServiceInput = z.infer<typeof createServiceSchema>
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>
