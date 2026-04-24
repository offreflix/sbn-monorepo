import { Card, CardContent, CardHeader, CardTitle, Button } from "@repo/ui";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  CreditCard,
  DollarSign,
  Calendar,
  RefreshCcw,
  PieChart,
  ArrowRightLeft,
  Repeat,
  LayoutGrid,
} from "lucide-react";
import { WalletCards } from "../../components/wallet-cards";
import { CategoryGrid } from "../../pages/categories/page";
import { TransactionList } from "../../pages/transactions/page";
import type { DashboardModelOutput } from "./dashboard.model";
import { RecurrenceList } from "../../components/recurrences-list";
import { SimpleProgress } from "../../components/simple-progress";
import { renderValue } from "../../lib/render-value";
import { formatCurrency } from "../../lib/utils";

export function DashboardView({
  data: {
    summary,
    categories,
    wallets,
    allCategories,
    transactions,
    recurrences,
  },
  state: { loading },
  actions: { onRefresh },
}: DashboardModelOutput) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">
            Visão geral de suas contas, cartões e categorias
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={loading}
            className="h-10 w-10 shrink-0"
            title="Atualizar dados"
          >
            <RefreshCcw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </header>

      {/* Top Cards - Cartões e Contas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="glass" className="border-purple-500/10">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
                <Wallet className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Saldo em Conta(s)
                </p>
                <div className="text-2xl font-bold text-foreground mt-0.5">
                  {renderValue(summary.cards.balance, loading)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass" className="border-red-500/10">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
                <CreditCard className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Fatura Atual
                </p>
                <div className="text-2xl font-bold text-foreground mt-0.5">
                  {renderValue(summary.cards.currentInvoice, loading)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass" className="border-yellow-500/10">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 shrink-0">
                <Calendar className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Próxima Fatura
                </p>
                <div className="text-2xl font-bold text-foreground mt-0.5">
                  {renderValue(summary.cards.nextInvoice, loading)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass" className="border-orange-500/10">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                <CreditCard className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Todas as Faturas
                </p>
                <div className="text-2xl font-bold text-foreground mt-0.5">
                  {renderValue(summary.cards.totalInvoices, loading)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visão Geral do Mês (Receitas, Despesas, Saldo) */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <PieChart className="h-5 w-5 text-muted-foreground" />
          Visão geral do mês
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variant="glass">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-emerald-500/10 p-2.5 rounded-lg text-emerald-500">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Receita Total
                </span>
              </div>
              <div className="text-3xl font-extrabold text-emerald-500 tabular-nums">
                {renderValue(
                  summary.overview.income,
                  loading,
                  "currency",
                  "w-32",
                )}
              </div>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-red-500/10 p-2.5 rounded-lg text-red-500">
                  <TrendingDown className="h-5 w-5" />
                </div>
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Despesa Total
                </span>
              </div>
              <div className="text-3xl font-extrabold text-red-500 tabular-nums">
                {renderValue(
                  summary.overview.expense,
                  loading,
                  "currency",
                  "w-32",
                )}
              </div>
            </CardContent>
          </Card>

          <Card
            variant="glass"
            className={
              !loading && summary.overview.balance < 0
                ? "bg-red-500/5 border-red-500/20"
                : "bg-primary/5 border-primary/20"
            }
          >
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-background p-2.5 rounded-lg shadow-sm">
                  <DollarSign
                    className={`h-5 w-5 ${!loading && summary.overview.balance < 0 ? "text-red-500" : "text-primary"}`}
                  />
                </div>
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Balanço Mensal
                </span>
              </div>
              <div
                className={`text-3xl font-extrabold tabular-nums ${!loading && summary.overview.balance < 0 ? "text-red-500" : "text-primary"}`}
              >
                {renderValue(
                  summary.overview.balance,
                  loading,
                  "currency",
                  "w-32",
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Categorias - Gráficos de Barras */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Receitas */}
        <Card variant="glass" className="flex flex-col">
          <CardHeader className="pb-3 border-b bg-muted/20">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Receitas por categoria
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5 flex-1">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                      <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                    </div>
                    <div className="h-1.5 w-full bg-muted animate-pulse rounded-full" />
                  </div>
                ))}
              </div>
            ) : categories.income.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-8 text-center space-y-2 text-muted-foreground">
                <PieChart className="h-8 w-8 opacity-20" />
                <p className="text-sm">Nenhuma receita registrada.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {categories.income.slice(0, 5).map((cat) => (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <div className="flex items-center gap-2 font-medium">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                        <span className="truncate max-w-[150px] sm:max-w-[200px]">
                          {cat.name}
                        </span>
                        <span className="text-xs text-muted-foreground font-normal">
                          {cat.percentage.toFixed(1)}%
                        </span>
                      </div>
                      <span className="tabular-nums font-semibold text-foreground">
                        {formatCurrency(cat.value)}
                      </span>
                    </div>
                    <SimpleProgress
                      value={cat.percentage}
                      colorClass="bg-emerald-500"
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Despesas */}
        <Card variant="glass" className="flex flex-col">
          <CardHeader className="pb-3 border-b bg-muted/20">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              Despesas por categoria
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5 flex-1">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                      <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                    </div>
                    <div className="h-1.5 w-full bg-muted animate-pulse rounded-full" />
                  </div>
                ))}
              </div>
            ) : categories.expense.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-8 text-center space-y-2 text-muted-foreground">
                <PieChart className="h-8 w-8 opacity-20" />
                <p className="text-sm">Nenhuma despesa registrada.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {categories.expense.slice(0, 5).map((cat) => (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <div className="flex items-center gap-2 font-medium">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                        <span className="truncate max-w-[150px] sm:max-w-[200px]">
                          {cat.name}
                        </span>
                        <span className="text-xs text-muted-foreground font-normal">
                          {cat.percentage.toFixed(1)}%
                        </span>
                      </div>
                      <span className="tabular-nums font-semibold text-foreground">
                        {formatCurrency(cat.value)}
                      </span>
                    </div>
                    <SimpleProgress
                      value={cat.percentage}
                      colorClass="bg-red-500"
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Grid: Contas/Carteiras vs Gerenciamento de Categorias */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <Card variant="glass" className="flex flex-col">
          <CardHeader className="pb-3 border-b bg-muted/20">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Minhas Carteiras
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5 flex-1">
            <WalletCards wallets={wallets} onRefresh={onRefresh} />
          </CardContent>
        </Card>

        <Card variant="glass" className="flex flex-col">
          <CardHeader className="pb-3 border-b bg-muted/20">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              Gerenciar Carteiras
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5 flex-1">
            <CategoryGrid
              categories={allCategories}
              onRefresh={onRefresh}
              hasTitle={false}
            />
          </CardContent>
        </Card>
      </div>

      {/* Lista de Transações */}
      <section className="space-y-4 pt-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <ArrowRightLeft className="h-5 w-5 text-muted-foreground" />
          Últimas Transações
        </h3>
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <TransactionList
            transactions={transactions}
            wallets={wallets}
            categories={allCategories}
            onRefresh={onRefresh}
          />
        </div>
      </section>

      {/* Lista de Recorrências */}
      <section className="space-y-4 pt-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Repeat className="h-5 w-5 text-muted-foreground" />
          Recorrências (Assinaturas e Parcelas)
        </h3>
        <div className="bg-card rounded-xl border shadow-sm p-1">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-[72px] rounded-lg bg-muted/50 animate-pulse"
                />
              ))}
            </div>
          ) : recurrences.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
              <Repeat className="h-10 w-10 opacity-20 mb-3" />
              <p className="text-sm">
                Você não possui contas recorrentes cadastradas.
              </p>
            </div>
          ) : (
            <RecurrenceList recurrences={recurrences.slice(0, 5)} />
          )}
        </div>
      </section>
    </div>
  );
}
