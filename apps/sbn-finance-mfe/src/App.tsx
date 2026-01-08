import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import './index.css'
import { financeApi } from './api/finance'
import type { Transaction, Wallet, Category } from './types/finance'
import { WalletCards } from './components/WalletCards'
import { TransactionList } from './components/TransactionList'
import { CategoryGrid } from './components/CategoryGrid'
import { BalanceOverview } from './components/BalanceOverview'
import { IncomeExpenseChart } from './components/IncomeExpenseChart'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui'
import {
  CreditCard,
  TrendingUp,
  Calendar,
  RefreshCcw,
  PlusCircle,
} from 'lucide-react'
import { toast, Toaster } from 'sonner'

const App = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState({
    totalBalance: 0,
    totalIncome: 0,
    totalExpenses: 0,
  })

  const [searchParams, setSearchParams] = useSearchParams()
  const selectedMonth =
    Number(searchParams.get('month')) || new Date().getMonth() + 1
  const selectedYear =
    Number(searchParams.get('year')) || new Date().getFullYear()

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [txs, wls, cats, sum] = await Promise.all([
        financeApi.transactions.list(selectedMonth, selectedYear),
        financeApi.wallets.list(),
        financeApi.categories.list(),
        financeApi.transactions.summary(selectedMonth, selectedYear),
      ])
      setTransactions(txs)
      setWallets(wls)
      setCategories(cats)
      setSummary(sum)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast.error('Erro ao carregar dados. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }, [selectedMonth, selectedYear])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleTransactionSuccess = () => {
    loadData()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground animate-pulse">
            Carregando finanças...
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="w-full min-h-screen bg-background text-foreground">
        {/* Header Section */}
        <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold tracking-tight">Finanças</h1>
              {/* Separator replacement */}
              <div className="h-6 w-px bg-border hidden sm:block" />

              <div className="flex items-center gap-2">
                <Select
                  value={selectedMonth.toString()}
                  onValueChange={(value) =>
                    setSearchParams({
                      month: value,
                      year: selectedYear.toString(),
                    })
                  }
                >
                  <SelectTrigger className="w-[140px] h-8 text-xs">
                    <SelectValue placeholder="Mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <SelectItem
                        key={m}
                        value={m.toString()}
                        className="text-xs"
                      >
                        {new Date(0, m - 1).toLocaleString('pt-BR', {
                          month: 'long',
                        })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedYear.toString()}
                  onValueChange={(value) =>
                    setSearchParams({
                      month: selectedMonth.toString(),
                      year: value,
                    })
                  }
                >
                  <SelectTrigger className="w-[100px] h-8 text-xs">
                    <SelectValue placeholder="Ano" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }, (_, i) => 2023 + i).map((y) => (
                      <SelectItem
                        key={y}
                        value={y.toString()}
                        className="text-xs"
                      >
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => loadData()}
              className="h-8 w-8"
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 space-y-8">
          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Column: Overview & Main Stats (8 cols) */}
            <div className="md:col-span-8 space-y-6">
              {/* Balance Hero Section */}
              <BalanceOverview
                totalBalance={summary.totalBalance}
                totalIncome={summary.totalIncome}
                totalExpenses={summary.totalExpenses}
              />

              {/* Chart Section */}
              <IncomeExpenseChart
                transactions={transactions}
                year={selectedYear}
                month={selectedMonth}
              />

              {/* Transactions Tabs */}
              <div className="bg-card rounded-xl border shadow-sm p-1">
                <Tabs defaultValue="transactions" className="w-full">
                  <div className="px-4 py-3 flex items-center justify-between border-b border-border/50 mb-2">
                    <TabsList className="bg-transparent p-0 gap-6 h-auto">
                      <TabsTrigger
                        value="transactions"
                        className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-2 bg-transparent text-muted-foreground transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          <span>Transações</span>
                        </div>
                      </TabsTrigger>
                      <TabsTrigger
                        value="categories"
                        className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-2 bg-transparent text-muted-foreground transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Categorias</span>
                        </div>
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="transactions" className="p-4 pt-0">
                    <TransactionList
                      transactions={transactions}
                      wallets={wallets}
                      categories={categories}
                      onRefresh={handleTransactionSuccess}
                    />
                  </TabsContent>
                  <TabsContent value="categories" className="p-4 pt-0">
                    <CategoryGrid
                      categories={categories}
                      onRefresh={handleTransactionSuccess}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Right Column: Wallets & Quick Actions (4 cols) */}
            <div className="md:col-span-4 space-y-6">
              {/* Wallets Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold tracking-tight">
                      Carteiras
                    </h2>
                  </div>
                </div>
                <WalletCards wallets={wallets} onRefresh={loadData} />
              </div>

              {/* Quick Tips / Placeholder for future widget */}
              <div className="rounded-xl border border-dashed p-6 flex flex-col items-center justify-center text-center text-muted-foreground gap-2 bg-muted/20">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <PlusCircle className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm font-medium">Adicionar Widget</p>
                <p className="text-xs">Personalize seu dashboard</p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* 
        Hack: Force Tailwind to generate responsive classes used by the Host Shell.
        Since MFE CSS loads last, if these are missing, the global .hidden class from MFE
        might override the Host's .md:flex, causing the Header to disappear.
      */}
      <div
        className="hidden md:flex md:hidden lg:flex lg:hidden xl:flex"
        style={{ display: 'none' }}
      />
    </>
  )
}

export default App
