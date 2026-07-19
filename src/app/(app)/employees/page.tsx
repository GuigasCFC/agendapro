import Link from "next/link"
import { getActiveMembership } from "@/lib/auth/dal"
import { listEmployees } from "@/features/employees/services"
import { EmployeeTable } from "@/features/employees/components/employee-table"
import { Button } from "@/components/ui/button"

export default async function EmployeesPage() {
  const membership = await getActiveMembership()
  const employees = membership
    ? await listEmployees(membership.organizationId)
    : []

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Funcionários</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os funcionários da sua empresa.
          </p>
        </div>

        <Button render={<Link href="/employees/new" />}>Novo funcionário</Button>
      </div>

      <EmployeeTable employees={employees} />
    </div>
  )
}
