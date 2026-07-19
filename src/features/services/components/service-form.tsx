"use client"

import Link from "next/link"
import { useActionState } from "react"
import { createService, updateService } from "@/features/services/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

interface ServiceFormProps {
  service?: {
    id: string
    name: string
    durationMin: number
    price: number | string
    active: boolean
  }
}

export function ServiceForm({ service }: ServiceFormProps) {
  const isEditing = Boolean(service)
  const [state, action, pending] = useActionState(
    isEditing ? updateService : createService,
    undefined
  )

  return (
    <form action={action} className="space-y-4">
      {isEditing && <input type="hidden" name="id" value={service!.id} />}

      <div className="space-y-1">
        <label htmlFor="name" className="text-sm font-medium">
          Nome do serviço <span className="text-destructive" aria-hidden="true">*</span>
        </label>
        <Input
          id="name"
          name="name"
          defaultValue={service?.name}
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="durationMin" className="text-sm font-medium">
            Duração (minutos) <span className="text-destructive" aria-hidden="true">*</span>
          </label>
          <Input
            id="durationMin"
            name="durationMin"
            type="number"
            min={1}
            step={1}
            defaultValue={service?.durationMin}
            required
            aria-invalid={Boolean(state?.errors?.durationMin)}
            aria-describedby={
              state?.errors?.durationMin ? "durationMin-error" : undefined
            }
          />
          {state?.errors?.durationMin && (
            <p id="durationMin-error" className="text-sm text-destructive">
              {state.errors.durationMin[0]}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="price" className="text-sm font-medium">
            Preço <span className="text-destructive" aria-hidden="true">*</span>
          </label>
          <Input
            id="price"
            name="price"
            type="number"
            min={0}
            step="0.01"
            defaultValue={service ? String(service.price) : undefined}
            required
            aria-invalid={Boolean(state?.errors?.price)}
            aria-describedby={state?.errors?.price ? "price-error" : undefined}
          />
          {state?.errors?.price && (
            <p id="price-error" className="text-sm text-destructive">
              {state.errors.price[0]}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3.5">
        <label htmlFor="active" className="text-sm font-medium">
          Serviço ativo
        </label>
        <Switch id="active" name="active" defaultChecked={service?.active ?? true} />
      </div>

      {state?.message && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}

      <div className="flex items-center gap-2 pt-2">
        <Button type="submit" disabled={pending} className="flex-1">
          {pending ? "Salvando..." : isEditing ? "Salvar alterações" : "Criar serviço"}
        </Button>
        <Button type="button" variant="outline" render={<Link href="/services" />}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
