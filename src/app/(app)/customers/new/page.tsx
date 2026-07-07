import { CustomerForm } from "@/features/customers/components/customer-form"

export default function NewCustomerPage() {
  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Novo cliente</h1>
        <p className="text-muted-foreground">
          Cadastre um novo cliente da sua empresa.
        </p>
      </div>

      <CustomerForm />
    </div>
  )
}
