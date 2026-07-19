"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getActiveMembership } from "@/lib/auth/dal"
import { requireRole } from "@/lib/auth/authorize"
import { Prisma } from "@/lib/generated/prisma/client"
import { createServiceSchema, updateServiceSchema } from "./schemas"
import * as servicesService from "./services"

export type ServiceFormState =
  | {
      errors?: Record<string, string[] | undefined>
      message?: string
    }
  | undefined

export async function createService(
  _state: ServiceFormState,
  formData: FormData
): Promise<ServiceFormState> {
  const membership = await getActiveMembership()
  if (!membership) redirect("/login")

  const validated = createServiceSchema.safeParse({
    name: formData.get("name"),
    durationMin: formData.get("durationMin"),
    price: formData.get("price"),
    active: formData.get("active"),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  try {
    await servicesService.createService(membership.organizationId, validated.data)
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "Não foi possível criar o serviço.",
    }
  }

  revalidatePath("/services")
  redirect("/services")
}

export async function updateService(
  _state: ServiceFormState,
  formData: FormData
): Promise<ServiceFormState> {
  const membership = await getActiveMembership()
  if (!membership) redirect("/login")

  const validated = updateServiceSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    durationMin: formData.get("durationMin"),
    price: formData.get("price"),
    active: formData.get("active"),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  try {
    await servicesService.updateService(
      validated.data.id,
      membership.organizationId,
      validated.data
    )
  } catch {
    return { message: "Não foi possível atualizar o serviço." }
  }

  revalidatePath("/services")
  redirect("/services")
}

export async function deleteService(id: string) {
  const membership = await requireRole("ADMIN")

  try {
    await servicesService.deleteService(id, membership.organizationId)
  } catch (error) {
    // Serviço com agendamentos vinculados: a FK impede o delete. Evita
    // quebrar a tela com um erro de banco não tratado.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      revalidatePath("/services")
      return
    }
    throw error
  }

  revalidatePath("/services")
}
