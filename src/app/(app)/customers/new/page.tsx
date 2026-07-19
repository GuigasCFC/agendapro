import { CustomerForm } from "@/features/customers/components/customer-form"
import { Card, CardContent } from "@/components/ui/card"

export default function NewCustomerPage() {
  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Novo cliente</h1>
        <p className="text-sm text-muted-foreground">
          Cadastre um novo cliente da sua empresa.
        </p>
      </div>

      <Card>
        <CardContent>
          <CustomerForm />
        </CardContent>
      </Card>
    </div>
  )
}
