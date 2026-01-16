import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import './index.css'
import { financeApi } from './api/finance'
import type {
  Transaction,
  Wallet,
  Category,
  DashboardSummary,
  DashboardCategories,
} from './types/finance'
import { TransactionList } from './components/TransactionList'
import { Dashboard } from './components/Dashboard'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
} from '@repo/ui'
import { LayoutDashboard, RefreshCcw, Receipt } from 'lucide-react'
import { toast, Toaster } from 'sonner'

type View = 'dashboard' | 'transactions' | 'recurrences'

const App = () => {
  const [view, setView] = useState<View>('dashboard')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // Dashboard Data
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary>({
    cards: { balance: 0, currentInvoice: 0, nextInvoice: 0, totalInvoices: 0 },
    overview: { income: 0, expense: 0, balance: 0 },
  })
  const [dashboardCategories, setDashboardCategories] =
    useState<DashboardCategories>({
      income: [],
      expense: [],
    })

  const [searchParams, setSearchParams] = useSearchParams()
  const selectedMonth =
    Number(searchParams.get('month')) || new Date().getMonth() + 1
  const selectedYear =
    Number(searchParams.get('year')) || new Date().getFullYear()

  const loadData = useCallback(async () => {
    try {
      setLoading(true)

      // Parallel Fetch
      const [txs, wls, cats, dashSum, dashCats] = await Promise.all([
        financeApi.transactions.list(selectedMonth, selectedYear),
        financeApi.wallets.list(),
        financeApi.categories.list(),
        financeApi.dashboard.summary(selectedMonth, selectedYear),
        financeApi.dashboard.categories(selectedMonth, selectedYear),
      ])

      setTransactions(txs)
      setWallets(wls)
      setCategories(cats)
      setDashboardSummary(dashSum)
      setDashboardCategories(dashCats)
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

  return (
    <>
      <Toaster position="top-right" />
      <div className="w-full min-h-screen bg-background text-foreground">
        {/* Header Section */}
        <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold tracking-tight">Finanças</h1>
              <div className="h-6 w-px bg-border hidden sm:block" />

              {/* View Switcher - Simple Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant={view === 'dashboard' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setView('dashboard')}
                  className="gap-2"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
                <Button
                  variant={view === 'transactions' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setView('transactions')}
                  className="gap-2"
                >
                  <Receipt className="h-4 w-4" />
                  Transações
                </Button>
              </div>
            </div>

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
                <SelectTrigger className="w-[120px] h-8 text-xs">
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
                <SelectTrigger className="w-[80px] h-8 text-xs">
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

              <Button
                variant="ghost"
                size="icon"
                onClick={() => loadData()}
                className="h-8 w-8"
              >
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 space-y-8">
          <div className="max-w-7xl mx-auto">
            {view === 'dashboard' && (
              <Dashboard
                summary={dashboardSummary}
                categories={dashboardCategories}
                wallets={wallets}
                loading={loading}
                onRefresh={handleTransactionSuccess}
              />
            )}

            {view === 'transactions' && (
              <TransactionList
                transactions={transactions}
                wallets={wallets}
                categories={categories}
                onRefresh={handleTransactionSuccess}
              />
            )}
          </div>
        </main>
      </div>

      <div
        className="hidden md:flex lg:flex xl:flex"
        style={{ display: 'none' }}
      />
    </>
  )
}

export default App
