import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  CreditCard,
  DollarSign,
  Calendar,
} from 'lucide-react'
import { formatCurrency } from '../lib/utils'
import type {
  DashboardSummary,
  DashboardCategories,
  Wallet as WalletType,
} from '../types/finance'
import { WalletCards } from './WalletCards'

interface DashboardProps {
  summary: DashboardSummary
  categories: DashboardCategories
  wallets: WalletType[]
  loading: boolean
  onRefresh: () => void
}

export function Dashboard({
  summary,
  categories,
  wallets,
  loading,
  onRefresh,
}: DashboardProps) {
  // Helper for Skeleton or value
  const Val = ({
    val,
    type = 'currency',
  }: {
    val: number | undefined
    type?: 'currency' | 'text'
  }) => {
    if (loading || val === undefined)
      return <div className="h-6 w-24 bg-muted animate-pulse rounded" />
    return (
      <span className={type === 'currency' ? 'tabular-nums' : ''}>
        {type === 'currency' ? formatCurrency(val) : val}
      </span>
    )
  }

  // Simple Progress Component
  const SimpleProgress = ({
    value,
    colorClass,
  }: {
    value: number
    colorClass: string
  }) => (
    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
      <div
        className={`h-full ${colorClass}`}
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Visão geral de todas as contas e cartões de créditos
        </p>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Valor em conta(s) */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Valor em conta(s)
                </p>
                <div className="text-2xl font-bold">
                  <Val val={summary.cards.balance} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fatura atual */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Fatura atual
                </p>
                <div className="text-2xl font-bold">
                  <Val val={summary.cards.currentInvoice} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Próxima fatura */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Próxima fatura
                </p>
                <div className="text-2xl font-bold">
                  <Val val={summary.cards.nextInvoice} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Todas as faturas */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Todas as faturas
                </p>
                <div className="text-2xl font-bold">
                  <Val val={summary.cards.totalInvoices} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visão Geral */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold">Visão geral</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Receita */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-emerald-100 dark:bg-emerald-900/20 p-2 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  Receita
                </span>
              </div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                <Val val={summary.overview.income} />
              </div>
            </CardContent>
          </Card>

          {/* Despesa */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-red-100 dark:bg-red-900/20 p-2 rounded-lg">
                  <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  Despesa
                </span>
              </div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                <Val val={summary.overview.expense} />
              </div>
            </CardContent>
          </Card>

          {/* Saldo */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-purple-100 dark:bg-purple-900/20 p-2 rounded-lg">
                  <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  Saldo
                </span>
              </div>
              <div
                className={`text-2xl font-bold ${summary.overview.balance >= 0 ? 'text-foreground' : 'text-red-600 dark:text-red-400'}`}
              >
                <Val val={summary.overview.balance} />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Categories Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Receitas por categoria */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              Receitas por categoria
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {categories.income.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem dados</p>
            ) : (
              categories.income.slice(0, 5).map((cat) => (
                <div key={cat.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="text-emerald-600 dark:text-emerald-400">
                        💰
                      </span>
                      {cat.name}{' '}
                      <span className="text-muted-foreground">
                        ({cat.percentage.toFixed(1)}%)
                      </span>
                    </span>
                    <span>{formatCurrency(cat.value)}</span>
                  </div>
                  <SimpleProgress
                    value={cat.percentage}
                    colorClass="bg-emerald-600 dark:bg-emerald-400"
                  />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Despesas por categoria */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              Despesas por categoria
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {categories.expense.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem dados</p>
            ) : (
              categories.expense.slice(0, 5).map((cat) => (
                <div key={cat.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      {/* TODO: Add icons dynamically if possible */}
                      <span className="text-red-600 dark:text-red-400">🛒</span>
                      {cat.name}{' '}
                      <span className="text-muted-foreground">
                        ({cat.percentage.toFixed(1)}%)
                      </span>
                    </span>
                    <span>{formatCurrency(cat.value)}</span>
                  </div>
                  <SimpleProgress
                    value={cat.percentage}
                    colorClass="bg-red-600 dark:bg-red-400"
                  />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
      {/* Wallets Section */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold">Carteiras</h3>
        {/* Reuse WalletCards but adjust visuals if needed. For now keeping it simple. */}
        <div className="max-w-md">
          <WalletCards wallets={wallets} onRefresh={onRefresh} />
        </div>
      </section>
    </div>
  )
}
