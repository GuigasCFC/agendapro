import { notFound } from "next/navigation"
import { getActiveMembership } from "@/lib/auth/dal"
import { getEmployee } from "@/features/employees/services"
import { EmployeeForm } from "@/features/employees/components/employee-form"

interface EditEmployeePageProps {
  params: Promise<{ id: string }>
}

export default async function EditEmployeePage({ params }: EditEmployeePageProps) {
  const { id } = await params
  const membership = await getActiveMembership()
  const employee = membership
    ? await getEmployee(id, membership.organizationId)
    : null

  if (!employee) {
    notFound()
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Editar funcionário</h1>
        <p className="text-muted-foreground">
          Atualize os dados do funcionário.
        </p>
      </div>

      <EmployeeForm employee={employee} />
    </div>
  )
}
