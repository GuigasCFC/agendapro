"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { Pencil, Wallet } from "lucide-react"
import { deleteTransaction } from "@/features/finance/actions"
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
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return transactions

    return transactions.filter((transaction) =>
      [transaction.category, transaction.customer?.name]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query))
    )
  }, [transactions, search])

  if (transactions.length === 0) {
    return (
      <EmptyState icon={Wallet} title="Nenhuma transação cadastrada ainda." />
    )
  }

  return (
    <div className="space-y-4">
      <TableToolbar
        value={search}
        onValueChange={setSearch}
        placeholder="Buscar por categoria ou cliente..."
      />

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
          {filtered.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>
                <Badge
                  variant={
                    transaction.type === "INCOME" ? "success" : "destructive"
                  }
                >
                  {TYPE_LABELS[transaction.type] ?? transaction.type}
                </Badge>
              </TableCell>
              <TableCell className="max-w-[180px] truncate font-medium">
                {transaction.category}
              </TableCell>
              <TableCell className="max-w-[180px] truncate text-muted-foreground">
                {transaction.customer?.name ?? "—"}
              </TableCell>
              <TableCell
                className={
                  transaction.type === "INCOME"
                    ? "font-mono font-medium text-success"
                    : "font-mono font-medium text-destructive"
                }
              >
                {formatAmount(transaction.amount)}
              </TableCell>
              <TableCell className="font-mono text-muted-foreground">
                {format(transaction.occurredAt, "dd/MM/yyyy")}
              </TableCell>
              <TableCell className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  render={<Link href={`/finance/${transaction.id}`} />}
                  aria-label={`Editar transação de ${transaction.category}`}
                  title="Editar"
                >
                  <Pencil className="h-4 w-4" />
                </Button>

                <form action={deleteTransaction.bind(null, transaction.id)}>
                  <DeleteRowButton
                    label={`Excluir transação de ${transaction.category}`}
                  />
                </form>
              </TableCell>
            </TableRow>
          ))}

          {filtered.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={6}
                className="h-24 text-center text-muted-foreground"
              >
                Nenhum resultado para &quot;{search}&quot;.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <TablePagination shown={filtered.length} total={transactions.length} />
    </div>
  )
}
