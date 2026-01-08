import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import './index.css'
import { financeApi } from './api/finance'
import type { Transaction, Wallet, Category } from './types/finance'
import { WalletCards } from './components/WalletCards'
import { TransactionList } from './components/TransactionList'
import { CategoryGrid } from './components/CategoryGrid'
import { BalanceOverview } from './components/BalanceOverview'
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
  IncomeExpenseChart,
} from '@repo/ui'
import { CreditCard, TrendingUp, Calendar, RefreshCcw } from 'lucide-react'
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

  // Date filter state
  // Date filter state
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
  }, [loadData]) // Reload when filter changes

  // Remove client-side calculation since we use server summary
  // const totalBalance... (removed)
  // const totalIncome... (removed)
  // const totalExpenses... (removed)

  const handleTransactionSuccess = () => {
    loadData()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="w-full">
        <main className="container mx-auto px-4 py-6 space-y-6">
          {/* Balance Overview */}
          <BalanceOverview
            totalBalance={summary.totalBalance}
            totalIncome={summary.totalIncome}
            totalExpenses={summary.totalExpenses}
          />

          {/* Filtering Controls */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Dashboard Financeiro
              </h1>
              <div className="flex gap-2 ml-4">
                <Select
                  value={selectedMonth.toString()}
                  onValueChange={(value) =>
                    setSearchParams({
                      month: value,
                      year: selectedYear.toString(),
                    })
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Selecione o mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <SelectItem key={m} value={m.toString()}>
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
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Ano" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }, (_, i) => 2023 + i).map((y) => (
                      <SelectItem key={y} value={y.toString()}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => loadData()}>
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {/* Charts Section */}
          <IncomeExpenseChart
            transactions={transactions}
            year={selectedYear}
            month={selectedMonth}
          />

          {/* Wallets Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold text-foreground">
                Minhas Carteiras
              </h2>
            </div>
            <WalletCards wallets={wallets} onRefresh={loadData} />
          </section>

          {/* Tabs for Transactions and Categories */}
          <Tabs defaultValue="transactions" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="transactions"
                className="flex items-center gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                Transações
              </TabsTrigger>
              <TabsTrigger
                value="categories"
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Categorias
              </TabsTrigger>
            </TabsList>
            <TabsContent value="transactions" className="mt-6">
              <TransactionList
                transactions={transactions}
                wallets={wallets}
                categories={categories}
                onRefresh={handleTransactionSuccess}
              />
            </TabsContent>
            <TabsContent value="categories" className="mt-6">
              <CategoryGrid
                categories={categories}
                onRefresh={handleTransactionSuccess}
              />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  )
}

export default App
