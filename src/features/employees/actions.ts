"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getActiveMembership } from "@/lib/auth/dal"
import { requireRole } from "@/lib/auth/authorize"
import { Prisma } from "@/lib/generated/prisma/client"
import { createEmployeeSchema, updateEmployeeSchema } from "./schemas"
import * as employeesService from "./services"

export type EmployeeFormState =
  | {
      errors?: Record<string, string[] | undefined>
      message?: string
    }
  | undefined

export async function createEmployee(
  _state: EmployeeFormState,
  formData: FormData
): Promise<EmployeeFormState> {
  const membership = await getActiveMembership()
  if (!membership) redirect("/login")

  const validated = createEmployeeSchema.safeParse({
    name: formData.get("name"),
    role: formData.get("role"),
    active: formData.get("active"),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  try {
    await employeesService.createEmployee(validated.data, membership.organizationId)
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "Não foi possível criar o funcionário.",
    }
  }

  revalidatePath("/employees")
  redirect("/employees")
}

export async function updateEmployee(
  _state: EmployeeFormState,
  formData: FormData
): Promise<EmployeeFormState> {
  const membership = await getActiveMembership()
  if (!membership) redirect("/login")

  const validated = updateEmployeeSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    role: formData.get("role"),
    active: formData.get("active"),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  try {
    await employeesService.updateEmployee(
      validated.data.id,
      validated.data,
      membership.organizationId
    )
  } catch {
    return { message: "Não foi possível atualizar o funcionário." }
  }

  revalidatePath("/employees")
  redirect("/employees")
}

export async function deleteEmployee(id: string) {
  const membership = await requireRole("ADMIN")

  try {
    await employeesService.deleteEmployee(id, membership.organizationId)
  } catch (error) {
    // Funcionário com agendamentos vinculados: a FK impede o delete. Evita
    // quebrar a tela com um erro de banco não tratado.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      revalidatePath("/employees")
      return
    }
    throw error
  }

  revalidatePath("/employees")
}
