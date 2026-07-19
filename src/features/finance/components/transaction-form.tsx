"use client"

import Link from "next/link"
import { useActionState } from "react"
import { format } from "date-fns"
import {
  createTransaction,
  updateTransaction,
} from "@/features/finance/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const TYPE_OPTIONS = [
  { value: "INCOME", label: "Receita" },
  { value: "EXPENSE", label: "Despesa" },
]

interface TransactionFormProps {
  transaction?: {
    id: string
    type: string
    amount: number | string
    category: string
    description: string | null
    occurredAt: Date
    customerId: string | null
    appointmentId: string | null
  }
  customers: { id: string; name: string }[]
  appointments: { id: string; label: string }[]
}

export function TransactionForm({
  transaction,
  customers,
  appointments,
}: TransactionFormProps) {
  const isEditing = Boolean(transaction)
  const [state, action, pending] = useActionState(
    isEditing ? updateTransaction : createTransaction,
    undefined
  )

  return (
    <form action={action} className="space-y-4">
      {isEditing && <input type="hidden" name="id" value={transaction!.id} />}

      <div className="space-y-1">
        <label htmlFor="type" className="text-sm font-medium">
          Tipo <span className="text-destructive" aria-hidden="true">*</span>
        </label>
        <Select
          name="type"
          defaultValue={transaction?.type ?? "INCOME"}
          items={TYPE_OPTIONS}
        >
          <SelectTrigger
            id="type"
            className="w-full"
            aria-invalid={Boolean(state?.errors?.type)}
            aria-describedby={state?.errors?.type ? "type-error" : undefined}
          >
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state?.errors?.type && (
          <p id="type-error" className="text-sm text-destructive">
            {state.errors.type[0]}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="amount" className="text-sm font-medium">
          Valor <span className="text-destructive" aria-hidden="true">*</span>
        </label>
        <Input
          id="amount"
          name="amount"
          type="number"
          min={0}
          step="0.01"
          defaultValue={
            transaction ? String(transaction.amount) : undefined
          }
          required
          aria-invalid={Boolean(state?.errors?.amount)}
          aria-describedby={state?.errors?.amount ? "amount-error" : undefined}
        />
        {state?.errors?.amount && (
          <p id="amount-error" className="text-sm text-destructive">
            {state.errors.amount[0]}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="category" className="text-sm font-medium">
          Categoria <span className="text-destructive" aria-hidden="true">*</span>
        </label>
        <Input
          id="category"
          name="category"
          defaultValue={transaction?.category}
          required
          aria-invalid={Boolean(state?.errors?.category)}
          aria-describedby={
            state?.errors?.category ? "category-error" : undefined
          }
        />
        {state?.errors?.category && (
          <p id="category-error" className="text-sm text-destructive">
            {state.errors.category[0]}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="occurredAt" className="text-sm font-medium">
          Data <span className="text-destructive" aria-hidden="true">*</span>
        </label>
        <Input
          id="occurredAt"
          name="occurredAt"
          type="date"
          defaultValue={
            transaction
              ? format(transaction.occurredAt, "yyyy-MM-dd")
              : format(new Date(), "yyyy-MM-dd")
          }
          required
          aria-invalid={Boolean(state?.errors?.occurredAt)}
          aria-describedby={
            state?.errors?.occurredAt ? "occurredAt-error" : undefined
          }
        />
        {state?.errors?.occurredAt && (
          <p id="occurredAt-error" className="text-sm text-destructive">
            {state.errors.occurredAt[0]}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="customerId" className="text-sm font-medium">
          Cliente (opcional)
        </label>
        <Select
          name="customerId"
          defaultValue={transaction?.customerId ?? "none"}
          items={[
            { value: "none", label: "Nenhum" },
            ...customers.map((customer) => ({
              value: customer.id,
              label: customer.name,
            })),
          ]}
        >
          <SelectTrigger id="customerId" className="w-full">
            <SelectValue placeholder="Nenhum cliente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhum</SelectItem>
            {customers.map((customer) => (
              <SelectItem key={customer.id} value={customer.id}>
                {customer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <label htmlFor="appointmentId" className="text-sm font-medium">
          Agendamento (opcional)
        </label>
        <Select
          name="appointmentId"
          defaultValue={transaction?.appointmentId ?? "none"}
          items={[
            { value: "none", label: "Nenhum" },
            ...appointments.map((appointment) => ({
              value: appointment.id,
              label: appointment.label,
            })),
          ]}
        >
          <SelectTrigger id="appointmentId" className="w-full">
            <SelectValue placeholder="Nenhum agendamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhum</SelectItem>
            {appointments.map((appointment) => (
              <SelectItem key={appointment.id} value={appointment.id}>
                {appointment.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <label htmlFor="description" className="text-sm font-medium">
          Descrição
        </label>
        <Textarea
          id="description"
          name="description"
          defaultValue={transaction?.description ?? ""}
          aria-invalid={Boolean(state?.errors?.description)}
          aria-describedby={
            state?.errors?.description ? "description-error" : undefined
          }
        />
        {state?.errors?.description && (
          <p id="description-error" className="text-sm text-destructive">
            {state.errors.description[0]}
          </p>
        )}
      </div>

      {state?.message && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}

      <div className="flex items-center gap-2 pt-2">
        <Button type="submit" disabled={pending} className="flex-1">
          {pending
            ? "Salvando..."
            : isEditing
              ? "Salvar alterações"
              : "Criar transação"}
        </Button>
        <Button type="button" variant="outline" render={<Link href="/finance" />}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
