import { useState, useEffect } from 'react'
import './index.css'
import { financeApi } from './api/finance'
import type { Transaction, Wallet, Category } from './types/finance'
import { WalletCards } from './components/WalletCards'
import { TransactionList } from './components/TransactionList'
import { CategoryGrid } from './components/CategoryGrid'
import { BalanceOverview } from './components/BalanceOverview'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui'
import { CreditCard, TrendingUp, Calendar } from 'lucide-react'
import { toast, Toaster } from 'sonner'

const App = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [txs, wls, cats] = await Promise.all([
        financeApi.transactions.list(),
        financeApi.wallets.list(),
        financeApi.categories.list(),
      ])
      setTransactions(txs)
      setWallets(wls)
      setCategories(cats)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao carregar dados'
      )
    } finally {
      setLoading(false)
    }
  }

  const totalBalance = wallets.reduce(
    (sum, wallet) => sum + parseFloat(wallet.balance),
    0
  )
  const totalIncome = transactions
    .filter((t) => t.type === 'Receita' && t.isPaid)
    .reduce((sum, t) => sum + parseFloat(t.amount), 0)
  const totalExpenses = transactions
    .filter((t) => t.type === 'Despesa' && t.isPaid)
    .reduce((sum, t) => sum + parseFloat(t.amount), 0)

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
            totalBalance={totalBalance}
            totalIncome={totalIncome}
            totalExpenses={totalExpenses}
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
                onRefresh={loadData}
              />
            </TabsContent>
            <TabsContent value="categories" className="mt-6">
              <CategoryGrid categories={categories} onRefresh={loadData} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  )
}

export default App
