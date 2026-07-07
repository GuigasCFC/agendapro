import { ServiceForm } from "@/features/services/components/service-form"

export default function NewServicePage() {
  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Novo serviço</h1>
        <p className="text-muted-foreground">
          Cadastre um novo serviço da sua empresa.
        </p>
      </div>

      <ServiceForm />
    </div>
  )
}
