import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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
          <div className="flex h-32 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
            Nenhuma transação registrada ainda.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Últimas transações</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between rounded-lg border p-3"
          >
            <div>
              <p className="font-medium">{transaction.category}</p>
              <p className="text-sm text-muted-foreground">
                {format(transaction.occurredAt, "dd/MM/yyyy")}
              </p>
            </div>

            <span
              className={
                transaction.type === "INCOME"
                  ? "font-semibold text-green-600 dark:text-green-500"
                  : "font-semibold text-destructive"
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
