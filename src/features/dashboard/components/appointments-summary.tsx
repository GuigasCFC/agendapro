import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const STATUS_LABELS: { key: string; label: string }[] = [
  { key: "SCHEDULED", label: "Agendados" },
  { key: "CONFIRMED", label: "Confirmados" },
  { key: "COMPLETED", label: "Concluídos" },
  { key: "CANCELED", label: "Cancelados" },
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

      <CardContent className="grid grid-cols-2 gap-4">
        {STATUS_LABELS.map(({ key, label }) => (
          <div key={key} className="rounded-lg border p-3">
            <p className="text-2xl font-bold">{counts[key] ?? 0}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
