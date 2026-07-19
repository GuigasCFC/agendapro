"use client"

import Link from "next/link"
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
          Cliente <span className="text-destructive" aria-hidden="true">*</span>
        </label>
        <Select
          name="customerId"
          defaultValue={appointment?.customerId}
          items={customers.map((customer) => ({
            value: customer.id,
            label: customer.name,
          }))}
        >
          <SelectTrigger
            id="customerId"
            className="w-full"
            aria-invalid={Boolean(state?.errors?.customerId)}
            aria-describedby={
              state?.errors?.customerId ? "customerId-error" : undefined
            }
          >
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
          <p id="customerId-error" className="text-sm text-destructive">
            {state.errors.customerId[0]}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="serviceId" className="text-sm font-medium">
          Serviço <span className="text-destructive" aria-hidden="true">*</span>
        </label>
        <Select
          name="serviceId"
          defaultValue={appointment?.serviceId}
          items={services.map((service) => ({
            value: service.id,
            label: service.name,
          }))}
        >
          <SelectTrigger
            id="serviceId"
            className="w-full"
            aria-invalid={Boolean(state?.errors?.serviceId)}
            aria-describedby={
              state?.errors?.serviceId ? "serviceId-error" : undefined
            }
          >
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
          <p id="serviceId-error" className="text-sm text-destructive">
            {state.errors.serviceId[0]}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="employeeId" className="text-sm font-medium">
          Funcionário <span className="text-destructive" aria-hidden="true">*</span>
        </label>
        <Select
          name="employeeId"
          defaultValue={appointment?.employeeId}
          items={employees.map((employee) => ({
            value: employee.id,
            label: employee.name,
          }))}
        >
          <SelectTrigger
            id="employeeId"
            className="w-full"
            aria-invalid={Boolean(state?.errors?.employeeId)}
            aria-describedby={
              state?.errors?.employeeId ? "employeeId-error" : undefined
            }
          >
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
          <p id="employeeId-error" className="text-sm text-destructive">
            {state.errors.employeeId[0]}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="date" className="text-sm font-medium">
            Data <span className="text-destructive" aria-hidden="true">*</span>
          </label>
          <Input
            id="date"
            name="date"
            type="date"
            defaultValue={
              appointment ? format(appointment.startsAt, "yyyy-MM-dd") : undefined
            }
            required
            aria-invalid={Boolean(state?.errors?.date)}
            aria-describedby={state?.errors?.date ? "date-error" : undefined}
          />
          {state?.errors?.date && (
            <p id="date-error" className="text-sm text-destructive">
              {state.errors.date[0]}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="time" className="text-sm font-medium">
            Horário <span className="text-destructive" aria-hidden="true">*</span>
          </label>
          <Input
            id="time"
            name="time"
            type="time"
            defaultValue={
              appointment ? format(appointment.startsAt, "HH:mm") : undefined
            }
            required
            aria-invalid={Boolean(state?.errors?.time)}
            aria-describedby={state?.errors?.time ? "time-error" : undefined}
          />
          {state?.errors?.time && (
            <p id="time-error" className="text-sm text-destructive">
              {state.errors.time[0]}
            </p>
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
          items={STATUS_OPTIONS}
        >
          <SelectTrigger
            id="status"
            className="w-full"
            aria-invalid={Boolean(state?.errors?.status)}
            aria-describedby={state?.errors?.status ? "status-error" : undefined}
          >
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
          <p id="status-error" className="text-sm text-destructive">
            {state.errors.status[0]}
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
          defaultValue={appointment?.notes ?? ""}
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
          {pending
            ? "Salvando..."
            : isEditing
              ? "Salvar alterações"
              : "Criar agendamento"}
        </Button>
        <Button type="button" variant="outline" render={<Link href="/appointments" />}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
