"use client"

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
          Nome
        </label>
        <Input id="name" name="name" defaultValue={employee?.name} required />
        {state?.errors?.name && (
          <p className="text-sm text-destructive">{state.errors.name[0]}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="role" className="text-sm font-medium">
          Cargo
        </label>
        <Input id="role" name="role" defaultValue={employee?.role ?? ""} />
        {state?.errors?.role && (
          <p className="text-sm text-destructive">{state.errors.role[0]}</p>
        )}
      </div>

      <div className="flex items-center justify-between rounded-lg border p-3">
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

      <Button type="submit" disabled={pending} className="w-full">
        {pending
          ? "Salvando..."
          : isEditing
            ? "Salvar alterações"
            : "Criar funcionário"}
      </Button>
    </form>
  )
}
