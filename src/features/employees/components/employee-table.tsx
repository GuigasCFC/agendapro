"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { Pencil, UserCog } from "lucide-react"
import { deleteEmployee } from "@/features/employees/actions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DeleteRowButton } from "@/components/ui/delete-row-button"
import { EmptyState } from "@/components/ui/empty-state"
import { TableToolbar } from "@/components/ui/table-toolbar"
import { TablePagination } from "@/components/ui/table-pagination"
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
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return employees

    return employees.filter((employee) =>
      [employee.name, employee.role]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query))
    )
  }, [employees, search])

  if (employees.length === 0) {
    return (
      <EmptyState icon={UserCog} title="Nenhum funcionário cadastrado ainda." />
    )
  }

  return (
    <div className="space-y-4">
      <TableToolbar
        value={search}
        onValueChange={setSearch}
        placeholder="Buscar por nome ou cargo..."
      />

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
          {filtered.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell className="max-w-[200px] truncate font-medium">
                {employee.name}
              </TableCell>
              <TableCell className="max-w-[160px] truncate text-muted-foreground">
                {employee.role || "—"}
              </TableCell>
              <TableCell>
                <Badge variant={employee.active ? "success" : "secondary"}>
                  {employee.active ? "Ativo" : "Inativo"}
                </Badge>
              </TableCell>
              <TableCell className="font-mono text-muted-foreground">
                {format(employee.createdAt, "dd/MM/yyyy")}
              </TableCell>
              <TableCell className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  render={<Link href={`/employees/${employee.id}`} />}
                  aria-label={`Editar ${employee.name}`}
                  title="Editar"
                >
                  <Pencil className="h-4 w-4" />
                </Button>

                <form action={deleteEmployee.bind(null, employee.id)}>
                  <DeleteRowButton label={`Excluir ${employee.name}`} />
                </form>
              </TableCell>
            </TableRow>
          ))}

          {filtered.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-24 text-center text-muted-foreground"
              >
                Nenhum resultado para &quot;{search}&quot;.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <TablePagination shown={filtered.length} total={employees.length} />
    </div>
  )
}
