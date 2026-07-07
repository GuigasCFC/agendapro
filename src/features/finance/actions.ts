"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getActiveMembership } from "@/lib/auth/dal"
import { createTransactionSchema, updateTransactionSchema } from "./schemas"
import * as financeService from "./services"

export type TransactionFormState =
  | {
      errors?: Record<string, string[] | undefined>
      message?: string
    }
  | undefined

function emptyIfNone(value: FormDataEntryValue | null) {
  return value === "none" ? "" : value
}

export async function createTransaction(
  _state: TransactionFormState,
  formData: FormData
): Promise<TransactionFormState> {
  const membership = await getActiveMembership()
  if (!membership) redirect("/login")

  const validated = createTransactionSchema.safeParse({
    type: formData.get("type"),
    amount: formData.get("amount"),
    category: formData.get("category"),
    description: formData.get("description"),
    occurredAt: formData.get("occurredAt"),
    customerId: emptyIfNone(formData.get("customerId")),
    appointmentId: emptyIfNone(formData.get("appointmentId")),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  try {
    await financeService.createTransaction(
      validated.data,
      membership.organizationId
    )
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "Não foi possível criar a transação.",
    }
  }

  revalidatePath("/finance")
  redirect("/finance")
}

export async function updateTransaction(
  _state: TransactionFormState,
  formData: FormData
): Promise<TransactionFormState> {
  const membership = await getActiveMembership()
  if (!membership) redirect("/login")

  const validated = updateTransactionSchema.safeParse({
    id: formData.get("id"),
    type: formData.get("type"),
    amount: formData.get("amount"),
    category: formData.get("category"),
    description: formData.get("description"),
    occurredAt: formData.get("occurredAt"),
    customerId: emptyIfNone(formData.get("customerId")),
    appointmentId: emptyIfNone(formData.get("appointmentId")),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  try {
    await financeService.updateTransaction(
      validated.data.id,
      validated.data,
      membership.organizationId
    )
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a transação.",
    }
  }

  revalidatePath("/finance")
  redirect("/finance")
}

export async function deleteTransaction(id: string) {
  const membership = await getActiveMembership()
  if (!membership) redirect("/login")

  await financeService.deleteTransaction(id, membership.organizationId)

  revalidatePath("/finance")
}
