import { db } from "@/lib/db"
import type { CreateEmployeeInput, UpdateEmployeeInput } from "./schemas"

export function listEmployees(organizationId: string) {
  return db.employee.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
  })
}

export function getEmployee(id: string, organizationId: string) {
  return db.employee.findFirst({
    where: { id, organizationId },
  })
}

export function createEmployee(data: CreateEmployeeInput, organizationId: string) {
  return db.employee.create({
    data: {
      organizationId,
      name: data.name,
      role: data.role || null,
      active: data.active,
    },
  })
}

export async function updateEmployee(
  id: string,
  data: UpdateEmployeeInput,
  organizationId: string
) {
  const { count } = await db.employee.updateMany({
    where: { id, organizationId },
    data: {
      name: data.name,
      role: data.role || null,
      active: data.active,
    },
  })

  if (count === 0) {
    throw new Error("Funcionário não encontrado.")
  }
}

export async function deleteEmployee(id: string, organizationId: string) {
  const { count } = await db.employee.deleteMany({
    where: { id, organizationId },
  })

  if (count === 0) {
    throw new Error("Funcionário não encontrado.")
  }
}
