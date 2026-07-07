"use client"

import { useActionState } from "react"
import { createCustomer, updateCustomer } from "@/features/customers/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface CustomerFormProps {
  customer?: {
    id: string
    name: string
    email: string | null
    phone: string | null
    notes: string | null
  }
}

export function CustomerForm({ customer }: CustomerFormProps) {
  const isEditing = Boolean(customer)
  const [state, action, pending] = useActionState(
    isEditing ? updateCustomer : createCustomer,
    undefined
  )

  return (
    <form action={action} className="space-y-4">
      {isEditing && <input type="hidden" name="id" value={customer!.id} />}

      <div className="space-y-1">
        <label htmlFor="name" className="text-sm font-medium">
          Nome
        </label>
        <Input id="name" name="name" defaultValue={customer?.name} required />
        {state?.errors?.name && (
          <p className="text-sm text-destructive">{state.errors.name[0]}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={customer?.email ?? ""}
        />
        {state?.errors?.email && (
          <p className="text-sm text-destructive">{state.errors.email[0]}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="phone" className="text-sm font-medium">
          Telefone
        </label>
        <Input id="phone" name="phone" defaultValue={customer?.phone ?? ""} />
        {state?.errors?.phone && (
          <p className="text-sm text-destructive">{state.errors.phone[0]}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="notes" className="text-sm font-medium">
          Observações
        </label>
        <Textarea id="notes" name="notes" defaultValue={customer?.notes ?? ""} />
        {state?.errors?.notes && (
          <p className="text-sm text-destructive">{state.errors.notes[0]}</p>
        )}
      </div>

      {state?.message && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Salvando..." : isEditing ? "Salvar alterações" : "Criar cliente"}
      </Button>
    </form>
  )
}
