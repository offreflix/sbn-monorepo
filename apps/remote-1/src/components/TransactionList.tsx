import { useState } from 'react'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { ArrowUpRight, ArrowDownRight, Clock, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CreateTransactionModal } from './CreateTransactionModal'
import type { Transaction, Wallet, Category } from '../types/finance'

interface TransactionListProps {
  transactions: Transaction[]
  wallets: Wallet[]
  categories: Category[]
  onRefresh: () => void
}

export function TransactionList({ transactions, wallets, categories, onRefresh }: TransactionListProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(parseFloat(value))
  }

  const getStatusBadge = (status: string, is_paid: boolean) => {
    if (status === 'Pago' && is_paid) {
      return <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">Pago</Badge>
    }
    if (status === 'Pendente') {
      return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">Pendente</Badge>
    }
    if (status === 'Cancelado') {
      return <Badge variant="destructive">Cancelado</Badge>
    }
    return <Badge variant="secondary">{status}</Badge>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsCreateModalOpen(true)} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Transação
        </Button>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma transação encontrada</p>
          ) : (
            transactions.map((transaction) => {
              const category = categories.find((c) => c.id === transaction.category_id)
              const wallet = wallets.find((w) => w.id === transaction.wallet_id)
              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        transaction.type === 'Receita'
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : 'bg-red-500/10 text-red-600'
                      }`}
                    >
                      {transaction.type === 'Receita' ? (
                        <ArrowUpRight className="h-5 w-5" />
                      ) : (
                        <ArrowDownRight className="h-5 w-5" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground">
                          {transaction.description || 'Sem descrição'}
                        </h4>
                        {transaction.installment_number && transaction.total_installments && (
                          <span className="text-xs text-muted-foreground">
                            {transaction.installment_number}/{transaction.total_installments}x
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {category && (
                          <>
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: category.color || '#3b82f6' }}
                            />
                            <span className="text-sm text-muted-foreground">{category.name}</span>
                          </>
                        )}
                        {wallet && (
                          <>
                            <span className="text-sm text-muted-foreground">•</span>
                            <span className="text-sm text-muted-foreground">{wallet.name}</span>
                          </>
                        )}
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(transaction.date), 'dd MMM', { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {getStatusBadge(transaction.status, transaction.is_paid)}
                    <p
                      className={`text-lg font-bold ${
                        transaction.type === 'Receita' ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {transaction.type === 'Receita' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </Card>

      <CreateTransactionModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        wallets={wallets}
        categories={categories}
        onSuccess={() => {
          setIsCreateModalOpen(false)
          onRefresh()
        }}
      />
    </div>
  )
}

