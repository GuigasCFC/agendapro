"use client"

import Link from "next/link"
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
          Nome <span className="text-destructive" aria-hidden="true">*</span>
        </label>
        <Input
          id="name"
          name="name"
          defaultValue={customer?.name}
          required
          aria-invalid={Boolean(state?.errors?.name)}
          aria-describedby={state?.errors?.name ? "name-error" : undefined}
        />
        {state?.errors?.name && (
          <p id="name-error" className="text-sm text-destructive">
            {state.errors.name[0]}
          </p>
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
          aria-invalid={Boolean(state?.errors?.email)}
          aria-describedby={state?.errors?.email ? "email-error" : undefined}
        />
        {state?.errors?.email && (
          <p id="email-error" className="text-sm text-destructive">
            {state.errors.email[0]}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="phone" className="text-sm font-medium">
          Telefone
        </label>
        <Input
          id="phone"
          name="phone"
          defaultValue={customer?.phone ?? ""}
          aria-invalid={Boolean(state?.errors?.phone)}
          aria-describedby={state?.errors?.phone ? "phone-error" : undefined}
        />
        {state?.errors?.phone && (
          <p id="phone-error" className="text-sm text-destructive">
            {state.errors.phone[0]}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="notes" className="text-sm font-medium">
          Observações
        </label>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={customer?.notes ?? ""}
          aria-invalid={Boolean(state?.errors?.notes)}
          aria-describedby={state?.errors?.notes ? "notes-error" : undefined}
        />
        {state?.errors?.notes && (
          <p id="notes-error" className="text-sm text-destructive">
            {state.errors.notes[0]}
          </p>
        )}
      </div>

      {state?.message && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}

      <div className="flex items-center gap-2 pt-2">
        <Button type="submit" disabled={pending} className="flex-1">
          {pending ? "Salvando..." : isEditing ? "Salvar alterações" : "Criar cliente"}
        </Button>
        <Button type="button" variant="outline" render={<Link href="/customers" />}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
