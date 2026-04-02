import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  CreditCard,
  DollarSign,
  Calendar,
} from 'lucide-react'
import { formatCurrency } from '../../lib/utils'
import { WalletCards } from '../../components/WalletCards'
import { CategoryGrid } from '../../pages/categories/page'
import { TransactionList } from '../../pages/transactions/page'
import type { DashboardModelOutput } from './dashboard.model'

export function DashboardView({
  data: { summary, categories, wallets, allCategories, transactions },
  state: { loading },
  actions: { onRefresh },
}: DashboardModelOutput) {
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
        className={`h-full ${colorClass} transition-all duration-500`}
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  )

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Visão geral de todas as contas e cartões de créditos
        </p>
      </div>

      {/* Top Cards - Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="glass">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
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

        <Card variant="glass">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400">
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

        <Card variant="glass">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-400">
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

        <Card variant="glass">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400">
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

      {/* Overview - Income/Expense/Balance */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold">Visão geral do mês</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variant="glass">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-emerald-500/20 p-2 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  Receita
                </span>
              </div>
              <div className="text-2xl font-bold text-emerald-400">
                <Val val={summary.overview.income} />
              </div>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-red-500/20 p-2 rounded-lg">
                  <TrendingDown className="h-5 w-5 text-red-400" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  Despesa
                </span>
              </div>
              <div className="text-2xl font-bold text-red-400">
                <Val val={summary.overview.expense} />
              </div>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-primary/20 p-2 rounded-lg">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  Saldo
                </span>
              </div>
              <div
                className={`text-2xl font-bold ${summary.overview.balance >= 0 ? 'text-primary' : 'text-red-400'}`}
              >
                <Val val={summary.overview.balance} />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Categories by Type - Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card variant="glass">
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
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      {cat.name}{' '}
                      <span className="text-muted-foreground">
                        ({cat.percentage.toFixed(1)}%)
                      </span>
                    </span>
                    <span className="tabular-nums">
                      {formatCurrency(cat.value)}
                    </span>
                  </div>
                  <SimpleProgress
                    value={cat.percentage}
                    colorClass="bg-emerald-400"
                  />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card variant="glass">
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
                      <span className="w-2 h-2 rounded-full bg-red-400" />
                      {cat.name}{' '}
                      <span className="text-muted-foreground">
                        ({cat.percentage.toFixed(1)}%)
                      </span>
                    </span>
                    <span className="tabular-nums">
                      {formatCurrency(cat.value)}
                    </span>
                  </div>
                  <SimpleProgress
                    value={cat.percentage}
                    colorClass="bg-red-400"
                  />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Wallets & Categories Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wallets Section */}
        <section className="space-y-4">
          <h3 className="text-xl font-semibold">Carteiras</h3>
          <WalletCards wallets={wallets} onRefresh={onRefresh} />
        </section>

        {/* Categories Section */}
        <section className="space-y-4">
          <h3 className="text-xl font-semibold">Categorias</h3>
          <CategoryGrid categories={allCategories} onRefresh={onRefresh} />
        </section>
      </div>

      {/* Transactions Section */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold">Transações</h3>
        <TransactionList
          transactions={transactions}
          wallets={wallets}
          categories={allCategories}
          onRefresh={onRefresh}
        />
      </section>
    </div>
  )
}
