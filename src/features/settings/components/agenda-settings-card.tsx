"use client"

import { useActionState, useEffect } from "react"
import { toast } from "sonner"

import { updateAgendaSettings } from "@/features/settings/actions"
import { SLOT_MINUTES_OPTIONS } from "@/features/settings/schemas"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AgendaSettingsCardProps {
  appointmentSlotMinutes: number | null
}

export function AgendaSettingsCard({
  appointmentSlotMinutes,
}: AgendaSettingsCardProps) {
  const [state, action, pending] = useActionState(
    updateAgendaSettings,
    undefined
  )

  useEffect(() => {
    if (state?.success) {
      toast.success("Configurações de agenda atualizadas.")
    }
  }, [state])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agenda</CardTitle>
        <CardDescription>
          Intervalo padrão entre horários de agendamento.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form action={action} className="space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="appointmentSlotMinutes"
              className="text-sm font-medium"
            >
              Intervalo padrão
            </label>
            <Select
              name="appointmentSlotMinutes"
              defaultValue={String(appointmentSlotMinutes ?? 30)}
              items={SLOT_MINUTES_OPTIONS.map((minutes) => ({
                value: String(minutes),
                label: `${minutes} min`,
              }))}
            >
              <SelectTrigger
                id="appointmentSlotMinutes"
                className="w-full"
                aria-invalid={Boolean(state?.errors?.appointmentSlotMinutes)}
                aria-describedby={
                  state?.errors?.appointmentSlotMinutes
                    ? "appointmentSlotMinutes-error"
                    : undefined
                }
              >
                <SelectValue placeholder="Selecione o intervalo" />
              </SelectTrigger>
              <SelectContent>
                {SLOT_MINUTES_OPTIONS.map((minutes) => (
                  <SelectItem key={minutes} value={String(minutes)}>
                    {minutes} min
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state?.errors?.appointmentSlotMinutes && (
              <p
                id="appointmentSlotMinutes-error"
                className="text-sm text-destructive"
              >
                {state.errors.appointmentSlotMinutes[0]}
              </p>
            )}
          </div>

          {state?.message && (
            <p className="text-sm text-destructive">{state.message}</p>
          )}

          <Button type="submit" disabled={pending}>
            {pending ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
