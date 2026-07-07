import Link from "next/link"
import { format } from "date-fns"
import { Pencil, Trash2 } from "lucide-react"
import { deleteEmployee } from "@/features/employees/actions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"

interface EmployeeTableProps {
  employees: {
    id: string
    name: string
    role: string | null
    active: boolean
    createdAt: Date
  }[]
}

export function EmployeeTable({ employees }: EmployeeTableProps) {
  if (employees.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
        Nenhum funcionário cadastrado ainda.
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Cargo</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Criado em</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {employees.map((employee) => (
          <TableRow key={employee.id}>
            <TableCell className="font-medium">{employee.name}</TableCell>
            <TableCell>{employee.role || "—"}</TableCell>
            <TableCell>
              <Badge variant={employee.active ? "default" : "secondary"}>
                {employee.active ? "Ativo" : "Inativo"}
              </Badge>
            </TableCell>
            <TableCell>{format(employee.createdAt, "dd/MM/yyyy")}</TableCell>
            <TableCell className="flex justify-end gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                render={<Link href={`/employees/${employee.id}`} />}
              >
                <Pencil className="h-4 w-4" />
              </Button>

              <form action={deleteEmployee.bind(null, employee.id)}>
                <Button variant="ghost" size="icon-sm" type="submit">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </form>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
