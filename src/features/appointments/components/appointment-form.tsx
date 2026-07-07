"use client"

import { useActionState } from "react"
import { format } from "date-fns"
import {
  createAppointment,
  updateAppointment,
} from "@/features/appointments/actions"
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

const STATUS_OPTIONS = [
  { value: "SCHEDULED", label: "Agendado" },
  { value: "CONFIRMED", label: "Confirmado" },
  { value: "COMPLETED", label: "Concluído" },
  { value: "CANCELED", label: "Cancelado" },
  { value: "NO_SHOW", label: "Não compareceu" },
]

interface AppointmentFormProps {
  appointment?: {
    id: string
    customerId: string
    serviceId: string
    employeeId: string
    startsAt: Date
    status: string
    notes: string | null
  }
  customers: { id: string; name: string }[]
  services: { id: string; name: string }[]
  employees: { id: string; name: string }[]
}

export function AppointmentForm({
  appointment,
  customers,
  services,
  employees,
}: AppointmentFormProps) {
  const isEditing = Boolean(appointment)
  const [state, action, pending] = useActionState(
    isEditing ? updateAppointment : createAppointment,
    undefined
  )

  return (
    <form action={action} className="space-y-4">
      {isEditing && <input type="hidden" name="id" value={appointment!.id} />}

      <div className="space-y-1">
        <label htmlFor="customerId" className="text-sm font-medium">
          Cliente
        </label>
        <Select name="customerId" defaultValue={appointment?.customerId}>
          <SelectTrigger id="customerId" className="w-full">
            <SelectValue placeholder="Selecione um cliente" />
          </SelectTrigger>
          <SelectContent>
            {customers.map((customer) => (
              <SelectItem key={customer.id} value={customer.id}>
                {customer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state?.errors?.customerId && (
          <p className="text-sm text-destructive">
            {state.errors.customerId[0]}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="serviceId" className="text-sm font-medium">
          Serviço
        </label>
        <Select name="serviceId" defaultValue={appointment?.serviceId}>
          <SelectTrigger id="serviceId" className="w-full">
            <SelectValue placeholder="Selecione um serviço" />
          </SelectTrigger>
          <SelectContent>
            {services.map((service) => (
              <SelectItem key={service.id} value={service.id}>
                {service.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state?.errors?.serviceId && (
          <p className="text-sm text-destructive">
            {state.errors.serviceId[0]}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="employeeId" className="text-sm font-medium">
          Funcionário
        </label>
        <Select name="employeeId" defaultValue={appointment?.employeeId}>
          <SelectTrigger id="employeeId" className="w-full">
            <SelectValue placeholder="Selecione um funcionário" />
          </SelectTrigger>
          <SelectContent>
            {employees.map((employee) => (
              <SelectItem key={employee.id} value={employee.id}>
                {employee.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state?.errors?.employeeId && (
          <p className="text-sm text-destructive">
            {state.errors.employeeId[0]}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="date" className="text-sm font-medium">
            Data
          </label>
          <Input
            id="date"
            name="date"
            type="date"
            defaultValue={
              appointment ? format(appointment.startsAt, "yyyy-MM-dd") : undefined
            }
            required
          />
          {state?.errors?.date && (
            <p className="text-sm text-destructive">{state.errors.date[0]}</p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="time" className="text-sm font-medium">
            Horário
          </label>
          <Input
            id="time"
            name="time"
            type="time"
            defaultValue={
              appointment ? format(appointment.startsAt, "HH:mm") : undefined
            }
            required
          />
          {state?.errors?.time && (
            <p className="text-sm text-destructive">{state.errors.time[0]}</p>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="status" className="text-sm font-medium">
          Status
        </label>
        <Select
          name="status"
          defaultValue={appointment?.status ?? "SCHEDULED"}
        >
          <SelectTrigger id="status" className="w-full">
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state?.errors?.status && (
          <p className="text-sm text-destructive">{state.errors.status[0]}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="notes" className="text-sm font-medium">
          Observações
        </label>
        <Textarea id="notes" name="notes" defaultValue={appointment?.notes ?? ""} />
        {state?.errors?.notes && (
          <p className="text-sm text-destructive">{state.errors.notes[0]}</p>
        )}
      </div>

      {state?.message && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending
          ? "Salvando..."
          : isEditing
            ? "Salvar alterações"
            : "Criar agendamento"}
      </Button>
    </form>
  )
}
