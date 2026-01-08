import { Card } from '@repo/ui'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'

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
    <div className="grid gap-4 md:grid-cols-2">
      {/* Hero Card for Total Balance */}
      <Card className="md:col-span-2 relative overflow-hidden bg-primary text-primary-foreground border-none p-8 dark:bg-primary/90">
        <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
        <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between h-full gap-8">
          <div className="flex items-start justify-between">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            {/* Decorative chip or indicator */}
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-white/50 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-white/30" />
              <div className="w-2 h-2 rounded-full bg-white/10" />
            </div>
          </div>

          <div>
            <p className="text-primary-foreground/80 font-medium mb-1">
              Saldo Total
            </p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight tabular-nums">
              {formatCurrency(totalBalance)}
            </h2>
          </div>
        </div>
      </Card>

      {/* Mini Stat: Income */}
      <Card className="p-5 flex flex-col justify-between gap-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </div>
          <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            <ArrowUpRight className="h-3 w-3 mr-1" />
            Receitas
          </span>
        </div>
        <div>
          <p className="text-sm text-muted-foreground font-medium">
            Entradas do mês
          </p>
          <p className="text-2xl font-bold text-foreground tabular-nums mt-1">
            {formatCurrency(totalIncome)}
          </p>
        </div>
      </Card>

      {/* Mini Stat: Expense */}
      <Card className="p-5 flex flex-col justify-between gap-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="h-10 w-10 rounded-full bg-rose-500/10 flex items-center justify-center">
            <TrendingDown className="h-5 w-5 text-rose-600" />
          </div>
          <span className="flex items-center text-xs font-medium text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded-full">
            <ArrowDownRight className="h-3 w-3 mr-1" />
            Despesas
          </span>
        </div>
        <div>
          <p className="text-sm text-muted-foreground font-medium">
            Saídas do mês
          </p>
          <p className="text-2xl font-bold text-foreground tabular-nums mt-1">
            {formatCurrency(totalExpenses)}
          </p>
        </div>
      </Card>
    </div>
  )
}
