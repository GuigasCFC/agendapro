"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getActiveMembership } from "@/lib/auth/dal"
import { createCustomerSchema, updateCustomerSchema } from "./schemas"
import * as customersService from "./services"

export type CustomerFormState =
  | {
      errors?: Record<string, string[] | undefined>
      message?: string
    }
  | undefined

export async function createCustomer(
  _state: CustomerFormState,
  formData: FormData
): Promise<CustomerFormState> {
  const membership = await getActiveMembership()
  if (!membership) redirect("/login")

  const validated = createCustomerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    notes: formData.get("notes"),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  await customersService.createCustomer(membership.organizationId, validated.data)

  revalidatePath("/customers")
  redirect("/customers")
}

export async function updateCustomer(
  _state: CustomerFormState,
  formData: FormData
): Promise<CustomerFormState> {
  const membership = await getActiveMembership()
  if (!membership) redirect("/login")

  const validated = updateCustomerSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    notes: formData.get("notes"),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  try {
    await customersService.updateCustomer(membership.organizationId, validated.data)
  } catch {
    return { message: "Não foi possível atualizar o cliente." }
  }

  revalidatePath("/customers")
  redirect("/customers")
}

export async function deleteCustomer(id: string) {
  const membership = await getActiveMembership()
  if (!membership) redirect("/login")

  await customersService.deleteCustomer(membership.organizationId, id)

  revalidatePath("/customers")
}
