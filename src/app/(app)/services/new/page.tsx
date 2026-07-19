import { ServiceForm } from "@/features/services/components/service-form"
import { Card, CardContent } from "@/components/ui/card"

export default function NewServicePage() {
  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Novo serviço</h1>
        <p className="text-sm text-muted-foreground">
          Cadastre um novo serviço da sua empresa.
        </p>
      </div>

      <Card>
        <CardContent>
          <ServiceForm />
        </CardContent>
      </Card>
    </div>
  )
}
