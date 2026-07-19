"use client"

import { useActionState, useEffect } from "react"
import { toast } from "sonner"

import { updatePreferences } from "@/features/settings/actions"
import {
  CURRENCY_OPTIONS,
  DATE_FORMAT_OPTIONS,
  LOCALE_OPTIONS,
  TIMEZONE_OPTIONS,
  TIME_FORMAT_OPTIONS,
} from "@/features/settings/schemas"
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

interface PreferencesCardProps {
  locale: string | null
  currency: string | null
  timezone: string | null
  dateFormat: string | null
  timeFormat: string | null
}

const FIELDS = [
  {
    name: "locale",
    label: "Idioma",
    options: LOCALE_OPTIONS,
    fallback: "pt-BR",
  },
  {
    name: "currency",
    label: "Moeda",
    options: CURRENCY_OPTIONS,
    fallback: "BRL",
  },
  {
    name: "timezone",
    label: "Fuso horário",
    options: TIMEZONE_OPTIONS,
    fallback: "America/Sao_Paulo",
  },
  {
    name: "dateFormat",
    label: "Formato da data",
    options: DATE_FORMAT_OPTIONS,
    fallback: "dd/MM/yyyy",
  },
  {
    name: "timeFormat",
    label: "Formato da hora",
    options: TIME_FORMAT_OPTIONS,
    fallback: "24h",
  },
] as const

export function PreferencesCard({
  locale,
  currency,
  timezone,
  dateFormat,
  timeFormat,
}: PreferencesCardProps) {
  const [state, action, pending] = useActionState(updatePreferences, undefined)

  useEffect(() => {
    if (state?.success) {
      toast.success("Preferências atualizadas.")
    }
  }, [state])

  const currentValues: Record<string, string | null> = {
    locale,
    currency,
    timezone,
    dateFormat,
    timeFormat,
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferências</CardTitle>
        <CardDescription>
          Idioma, moeda, fuso horário e formatos de exibição.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form action={action} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {FIELDS.map((field) => (
              <div key={field.name} className="space-y-1">
                <label htmlFor={field.name} className="text-sm font-medium">
                  {field.label}
                </label>
                <Select
                  name={field.name}
                  defaultValue={currentValues[field.name] ?? field.fallback}
                  items={field.options}
                >
                  <SelectTrigger
                    id={field.name}
                    className="w-full"
                    aria-invalid={Boolean(state?.errors?.[field.name])}
                    aria-describedby={
                      state?.errors?.[field.name]
                        ? `${field.name}-error`
                        : undefined
                    }
                  >
                    <SelectValue
                      placeholder={`Selecione ${field.label.toLowerCase()}`}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {state?.errors?.[field.name] && (
                  <p id={`${field.name}-error`} className="text-sm text-destructive">
                    {state.errors[field.name]![0]}
                  </p>
                )}
              </div>
            ))}
          </div>

          {state?.message && (
            <p className="text-sm text-destructive">{state.message}</p>
          )}

          <Button type="submit" disabled={pending}>
            {pending ? "Salvando..." : "Salvar preferências"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
