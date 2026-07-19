import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const TONE_STYLES = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  destructive: "bg-destructive/10 text-destructive",
  info: "bg-info/10 text-info",
} as const

const STATUS_TILES: { key: string; label: string; tone: keyof typeof TONE_STYLES }[] = [
  { key: "SCHEDULED", label: "Agendados", tone: "info" },
  { key: "CONFIRMED", label: "Confirmados", tone: "primary" },
  { key: "COMPLETED", label: "Concluídos", tone: "success" },
  { key: "CANCELED", label: "Cancelados", tone: "destructive" },
]

interface AppointmentsSummaryProps {
  counts: Record<string, number>
}

export function AppointmentsSummary({ counts }: AppointmentsSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo de agendamentos</CardTitle>
      </CardHeader>

      <CardContent className="grid grid-cols-2 gap-3">
        {STATUS_TILES.map(({ key, label, tone }) => (
          <div
            key={key}
            className={cn("rounded-xl p-3", TONE_STYLES[tone])}
          >
            <p className="font-mono text-2xl font-semibold">
              {counts[key] ?? 0}
            </p>
            <p className="text-sm opacity-80">{label}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
