import { format } from "date-fns"
import { CheckCircle2, CircleDashed, XCircle } from "lucide-react"

import { cn } from "@/lib/utils"

interface NotificationTimelineProps {
  createdAt: Date
  status: string
  sentAt: Date | null
  error: string | null
}

export function NotificationTimeline({
  createdAt,
  status,
  sentAt,
  error,
}: NotificationTimelineProps) {
  const steps = [
    {
      key: "created",
      label: "Notificação criada",
      date: createdAt,
      done: true,
      tone: "default" as const,
    },
    status === "SENT"
      ? {
          key: "sent",
          label: "Enviada com sucesso",
          date: sentAt,
          done: true,
          tone: "success" as const,
        }
      : status === "FAILED"
        ? {
            key: "failed",
            label: error ? `Falha no envio: ${error}` : "Falha no envio",
            date: sentAt,
            done: true,
            tone: "destructive" as const,
          }
        : {
            key: "pending",
            label: "Aguardando envio",
            date: null,
            done: false,
            tone: "muted" as const,
          },
  ]

  return (
    <ol className="space-y-4">
      {steps.map((step, index) => {
        const Icon =
          step.tone === "success"
            ? CheckCircle2
            : step.tone === "destructive"
              ? XCircle
              : CircleDashed

        return (
          <li key={step.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0",
                  step.tone === "success" && "text-success",
                  step.tone === "destructive" && "text-destructive",
                  step.tone === "default" && "text-primary",
                  step.tone === "muted" && "text-muted-foreground"
                )}
              />
              {index < steps.length - 1 && (
                <div className="mt-1 w-px flex-1 bg-border" />
              )}
            </div>

            <div className="pb-4">
              <p
                className={cn(
                  "text-sm font-medium",
                  step.tone === "muted" ? "text-muted-foreground" : "text-foreground"
                )}
              >
                {step.label}
              </p>
              {step.date && (
                <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                  {format(step.date, "dd/MM/yyyy HH:mm")}
                </p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
