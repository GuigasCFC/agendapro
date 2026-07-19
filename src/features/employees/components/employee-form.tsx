"use client"

import Link from "next/link"
import { useActionState } from "react"
import { createEmployee, updateEmployee } from "@/features/employees/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

interface EmployeeFormProps {
  employee?: {
    id: string
    name: string
    role: string | null
    active: boolean
  }
}

export function EmployeeForm({ employee }: EmployeeFormProps) {
  const isEditing = Boolean(employee)
  const [state, action, pending] = useActionState(
    isEditing ? updateEmployee : createEmployee,
    undefined
  )

  return (
    <form action={action} className="space-y-4">
      {isEditing && <input type="hidden" name="id" value={employee!.id} />}

      <div className="space-y-1">
        <label htmlFor="name" className="text-sm font-medium">
          Nome <span className="text-destructive" aria-hidden="true">*</span>
        </label>
        <Input
          id="name"
          name="name"
          defaultValue={employee?.name}
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
        <label htmlFor="role" className="text-sm font-medium">
          Cargo
        </label>
        <Input
          id="role"
          name="role"
          defaultValue={employee?.role ?? ""}
          aria-invalid={Boolean(state?.errors?.role)}
          aria-describedby={state?.errors?.role ? "role-error" : undefined}
        />
        {state?.errors?.role && (
          <p id="role-error" className="text-sm text-destructive">
            {state.errors.role[0]}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3.5">
        <label htmlFor="active" className="text-sm font-medium">
          Funcionário ativo
        </label>
        <Switch
          id="active"
          name="active"
          defaultChecked={employee?.active ?? true}
        />
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
              : "Criar funcionário"}
        </Button>
        <Button type="button" variant="outline" render={<Link href="/employees" />}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
