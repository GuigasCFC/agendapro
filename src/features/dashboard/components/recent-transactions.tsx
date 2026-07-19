import { format } from "date-fns"
import { Wallet } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"

interface RecentTransactionsProps {
  transactions: {
    id: string
    occurredAt: Date
    category: string
    type: string
    amount: number | string
  }[]
}

function formatAmount(amount: number | string) {
  return Number(amount).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Últimas transações</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState icon={Wallet} title="Nenhuma transação registrada ainda." />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Últimas transações</CardTitle>
      </CardHeader>

      <CardContent className="space-y-2">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between rounded-lg border border-transparent p-3 transition-colors hover:border-border hover:bg-muted/50"
          >
            <div>
              <p className="font-medium text-foreground">
                {transaction.category}
              </p>
              <p className="text-sm text-muted-foreground">
                {format(transaction.occurredAt, "dd/MM/yyyy")}
              </p>
            </div>

            <span
              className={
                transaction.type === "INCOME"
                  ? "font-mono font-semibold text-success"
                  : "font-mono font-semibold text-destructive"
              }
            >
              {transaction.type === "INCOME" ? "+" : "-"}
              {formatAmount(transaction.amount)}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
