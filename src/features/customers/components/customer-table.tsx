import Link from "next/link"
import { format } from "date-fns"
import { Pencil, Trash2 } from "lucide-react"
import { deleteCustomer } from "@/features/customers/actions"
import { Button } from "@/components/ui/button"
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
  if (customers.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
        Nenhum cliente cadastrado ainda.
      </div>
    )
  }

  return (
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
        {customers.map((customer) => (
          <TableRow key={customer.id}>
            <TableCell className="font-medium">{customer.name}</TableCell>
            <TableCell>{customer.email || "—"}</TableCell>
            <TableCell>{customer.phone || "—"}</TableCell>
            <TableCell>{format(customer.createdAt, "dd/MM/yyyy")}</TableCell>
            <TableCell className="flex justify-end gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                render={<Link href={`/customers/${customer.id}`} />}
              >
                <Pencil className="h-4 w-4" />
              </Button>

              <form action={deleteCustomer.bind(null, customer.id)}>
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
