import { EmployeeForm } from "@/features/employees/components/employee-form"

export default function NewEmployeePage() {
  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Novo funcionário</h1>
        <p className="text-muted-foreground">
          Cadastre um novo funcionário da sua empresa.
        </p>
      </div>

      <EmployeeForm />
    </div>
  )
}
