import Link from "next/link"
import { getActiveMembership } from "@/lib/auth/dal"
import { listTransactions } from "@/features/finance/services"
import { TransactionTable } from "@/features/finance/components/transaction-table"
import { Button } from "@/components/ui/button"

export default async function FinancePage() {
  const membership = await getActiveMembership()
  const transactions = membership
    ? await listTransactions(membership.organizationId)
    : []

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Financeiro</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie as receitas e despesas da sua empresa.
          </p>
        </div>

        <Button render={<Link href="/finance/new" />}>Nova transação</Button>
      </div>

      <TransactionTable
        transactions={transactions.map((transaction) => ({
          ...transaction,
          amount: transaction.amount.toString(),
        }))}
      />
    </div>
  )
}
