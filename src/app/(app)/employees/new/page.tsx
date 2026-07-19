import { EmployeeForm } from "@/features/employees/components/employee-form"
import { Card, CardContent } from "@/components/ui/card"

export default function NewEmployeePage() {
  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Novo funcionário</h1>
        <p className="text-sm text-muted-foreground">
          Cadastre um novo funcionário da sua empresa.
        </p>
      </div>

      <Card>
        <CardContent>
          <EmployeeForm />
        </CardContent>
      </Card>
    </div>
  )
}
