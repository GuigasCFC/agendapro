import { db } from "@/lib/db"
import type { CreateServiceInput, UpdateServiceInput } from "./schemas"

export function listServices(organizationId: string) {
  return db.service.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
  })
}

export function getService(id: string, organizationId: string) {
  return db.service.findFirst({
    where: { id, organizationId },
  })
}

export function createService(organizationId: string, input: CreateServiceInput) {
  return db.service.create({
    data: {
      organizationId,
      name: input.name,
      durationMin: input.durationMin,
      price: input.price,
      active: input.active,
    },
  })
}

export async function updateService(
  id: string,
  organizationId: string,
  input: UpdateServiceInput
) {
  const { count } = await db.service.updateMany({
    where: { id, organizationId },
    data: {
      name: input.name,
      durationMin: input.durationMin,
      price: input.price,
      active: input.active,
    },
  })

  if (count === 0) {
    throw new Error("Serviço não encontrado.")
  }
}

export async function deleteService(id: string, organizationId: string) {
  const { count } = await db.service.deleteMany({
    where: { id, organizationId },
  })

  if (count === 0) {
    throw new Error("Serviço não encontrado.")
  }
}
