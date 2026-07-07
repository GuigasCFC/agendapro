"use client"

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
          Nome do serviço
        </label>
        <Input id="name" name="name" defaultValue={service?.name} required />
        {state?.errors?.name && (
          <p className="text-sm text-destructive">{state.errors.name[0]}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="durationMin" className="text-sm font-medium">
          Duração (minutos)
        </label>
        <Input
          id="durationMin"
          name="durationMin"
          type="number"
          min={1}
          step={1}
          defaultValue={service?.durationMin}
          required
        />
        {state?.errors?.durationMin && (
          <p className="text-sm text-destructive">
            {state.errors.durationMin[0]}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="price" className="text-sm font-medium">
          Preço
        </label>
        <Input
          id="price"
          name="price"
          type="number"
          min={0}
          step="0.01"
          defaultValue={service ? String(service.price) : undefined}
          required
        />
        {state?.errors?.price && (
          <p className="text-sm text-destructive">{state.errors.price[0]}</p>
        )}
      </div>

      <div className="flex items-center justify-between rounded-lg border p-3">
        <label htmlFor="active" className="text-sm font-medium">
          Serviço ativo
        </label>
        <Switch id="active" name="active" defaultChecked={service?.active ?? true} />
      </div>

      {state?.message && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Salvando..." : isEditing ? "Salvar alterações" : "Criar serviço"}
      </Button>
    </form>
  )
}
