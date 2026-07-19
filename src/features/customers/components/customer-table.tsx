"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { Pencil, Users } from "lucide-react"
import { deleteCustomer } from "@/features/customers/actions"
import { Button } from "@/components/ui/button"
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

interface CustomerTableProps {
  customers: {
    id: string
    name: string
    email: string | null
    phone: string | null
    createdAt: Date
  }[]
}

export function CustomerTable({ customers }: CustomerTableProps) {
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return customers

    return customers.filter((customer) =>
      [customer.name, customer.email, customer.phone]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query))
    )
  }, [customers, search])

  if (customers.length === 0) {
    return <EmptyState icon={Users} title="Nenhum cliente cadastrado ainda." />
  }

  return (
    <div className="space-y-4">
      <TableToolbar
        value={search}
        onValueChange={setSearch}
        placeholder="Buscar por nome, e-mail ou telefone..."
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Criado em</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filtered.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell className="max-w-[220px] truncate font-medium">
                {customer.name}
              </TableCell>
              <TableCell className="max-w-[220px] truncate">
                {customer.email || "—"}
              </TableCell>
              <TableCell>{customer.phone || "—"}</TableCell>
              <TableCell className="font-mono text-muted-foreground">
                {format(customer.createdAt, "dd/MM/yyyy")}
              </TableCell>
              <TableCell className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  render={<Link href={`/customers/${customer.id}`} />}
                  aria-label={`Editar ${customer.name}`}
                  title="Editar"
                >
                  <Pencil className="h-4 w-4" />
                </Button>

                <form action={deleteCustomer.bind(null, customer.id)}>
                  <DeleteRowButton label={`Excluir ${customer.name}`} />
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

      <TablePagination shown={filtered.length} total={customers.length} />
    </div>
  )
}
