"use client"

import { useActionState, useEffect, useState } from "react"
import { toast } from "sonner"

import { updateBusinessHours } from "@/features/settings/actions"
import {
  WEEKDAYS,
  WEEKDAY_LABELS,
  type WeekdayValue,
} from "@/features/settings/schemas"
import type { BusinessHoursDay } from "@/features/settings/services"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

interface BusinessHoursCardProps {
  initialData: BusinessHoursDay[]
}

export function BusinessHoursCard({ initialData }: BusinessHoursCardProps) {
  const [state, action, pending] = useActionState(
    updateBusinessHours,
    undefined
  )
  const [openDays, setOpenDays] = useState<Record<WeekdayValue, boolean>>(
    () =>
      Object.fromEntries(
        initialData.map((day) => [day.weekday, day.isOpen])
      ) as Record<WeekdayValue, boolean>
  )

  useEffect(() => {
    if (state?.success) {
      toast.success("Horário de funcionamento atualizado.")
    }
  }, [state])

  const byWeekday = new Map(initialData.map((day) => [day.weekday, day]))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Horário de funcionamento</CardTitle>
        <CardDescription>
          Defina os dias e horários em que sua empresa atende.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form action={action} className="space-y-3">
          {WEEKDAYS.map((weekday) => {
            const day = byWeekday.get(weekday)
            const isOpen = openDays[weekday]
            const errors = state?.errors?.[weekday]

            return (
              <div
                key={weekday}
                className="space-y-2 rounded-xl border border-border p-3.5"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                  <div className="flex w-32 shrink-0 items-center gap-2.5">
                    <Switch
                      name={`${weekday}-isOpen`}
                      checked={isOpen}
                      onCheckedChange={(checked) =>
                        setOpenDays((prev) => ({ ...prev, [weekday]: checked }))
                      }
                      aria-label={`Ativar ${WEEKDAY_LABELS[weekday]}`}
                    />
                    <span className="text-sm font-medium text-foreground">
                      {WEEKDAY_LABELS[weekday]}
                    </span>
                  </div>

                  <div className="flex flex-1 items-center gap-2">
                    <Input
                      type="time"
                      name={`${weekday}-opensAt`}
                      defaultValue={day?.opensAt ?? ""}
                      disabled={!isOpen}
                      aria-label={`Horário de abertura de ${WEEKDAY_LABELS[weekday]}`}
                      aria-invalid={Boolean(errors)}
                      aria-describedby={errors ? `${weekday}-error` : undefined}
                      className="w-full sm:w-36"
                    />
                    <span className="text-sm text-muted-foreground">até</span>
                    <Input
                      type="time"
                      name={`${weekday}-closesAt`}
                      defaultValue={day?.closesAt ?? ""}
                      disabled={!isOpen}
                      aria-label={`Horário de fechamento de ${WEEKDAY_LABELS[weekday]}`}
                      aria-invalid={Boolean(errors)}
                      aria-describedby={errors ? `${weekday}-error` : undefined}
                      className="w-full sm:w-36"
                    />
                  </div>
                </div>

                {errors && (
                  <p id={`${weekday}-error`} className="text-sm text-destructive">
                    {errors[0]}
                  </p>
                )}
              </div>
            )
          })}

          {state?.message && (
            <p className="text-sm text-destructive">{state.message}</p>
          )}

          <Button type="submit" disabled={pending}>
            {pending ? "Salvando..." : "Salvar horários"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
