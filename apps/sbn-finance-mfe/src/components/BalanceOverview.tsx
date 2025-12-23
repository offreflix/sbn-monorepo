import { Card } from '@repo/ui'
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react'

interface BalanceOverviewProps {
  totalBalance: number
  totalIncome: number
  totalExpenses: number
}

export function BalanceOverview({
  totalBalance,
  totalIncome,
  totalExpenses,
}: BalanceOverviewProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">
              Saldo Total
            </p>
            <p className="text-2xl font-bold text-foreground">
              {formatCurrency(totalBalance)}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
            <TrendingUp className="h-6 w-6 text-emerald-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">
              Receitas
            </p>
            <p className="text-2xl font-bold text-emerald-600">
              {formatCurrency(totalIncome)}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
            <TrendingDown className="h-6 w-6 text-red-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">
              Despesas
            </p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpenses)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
