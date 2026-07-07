import Link from "next/link"
import { format } from "date-fns"
import { Pencil, Trash2 } from "lucide-react"
import { deleteTransaction } from "@/features/finance/actions"
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

const TYPE_LABELS: Record<string, string> = {
  INCOME: "Receita",
  EXPENSE: "Despesa",
}

interface TransactionTableProps {
  transactions: {
    id: string
    type: string
    amount: number | string
    category: string
    occurredAt: Date
    customer: { name: string } | null
  }[]
}

function formatAmount(amount: number | string) {
  return Number(amount).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
        Nenhuma transação cadastrada ainda.
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tipo</TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Data</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {transactions.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell>
              <Badge
                variant={
                  transaction.type === "INCOME" ? "default" : "destructive"
                }
              >
                {TYPE_LABELS[transaction.type] ?? transaction.type}
              </Badge>
            </TableCell>
            <TableCell className="font-medium">
              {transaction.category}
            </TableCell>
            <TableCell>{transaction.customer?.name ?? "—"}</TableCell>
            <TableCell>{formatAmount(transaction.amount)}</TableCell>
            <TableCell>{format(transaction.occurredAt, "dd/MM/yyyy")}</TableCell>
            <TableCell className="flex justify-end gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                render={<Link href={`/finance/${transaction.id}`} />}
              >
                <Pencil className="h-4 w-4" />
              </Button>

              <form action={deleteTransaction.bind(null, transaction.id)}>
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
