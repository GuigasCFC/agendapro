import { db } from "@/lib/db"
import type { CreateCustomerInput, UpdateCustomerInput } from "./schemas"

export function listCustomers(organizationId: string) {
  return db.customer.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
  })
}

export function getCustomer(organizationId: string, id: string) {
  return db.customer.findFirst({
    where: { id, organizationId },
  })
}

export function createCustomer(organizationId: string, input: CreateCustomerInput) {
  return db.customer.create({
    data: {
      organizationId,
      name: input.name,
      email: input.email || null,
      phone: input.phone || null,
      notes: input.notes || null,
    },
  })
}

export async function updateCustomer(
  organizationId: string,
  input: UpdateCustomerInput
) {
  const { count } = await db.customer.updateMany({
    where: { id: input.id, organizationId },
    data: {
      name: input.name,
      email: input.email || null,
      phone: input.phone || null,
      notes: input.notes || null,
    },
  })

  if (count === 0) {
    throw new Error("Cliente não encontrado.")
  }
}

export async function deleteCustomer(organizationId: string, id: string) {
  const { count } = await db.customer.deleteMany({
    where: { id, organizationId },
  })

  if (count === 0) {
    throw new Error("Cliente não encontrado.")
  }
}
