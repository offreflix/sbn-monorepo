import { useState, useMemo } from 'react'
import { Button } from '@repo/ui'
import {
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  CalendarDays,
} from 'lucide-react'
import { format, isToday, isYesterday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CreateTransactionModal } from './CreateTransactionModal'
import type { Transaction, Wallet, Category } from '../types/finance'
import { financeApi } from '../api/finance'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Input,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui'

interface TransactionListProps {
  transactions: Transaction[]
  wallets: Wallet[]
  categories: Category[]
  onRefresh: () => void
}

export function TransactionList({
  transactions,
  wallets,
  categories,
  onRefresh,
}: TransactionListProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null)
  const [transactionToDelete, setTransactionToDelete] =
    useState<Transaction | null>(null)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [importWalletId, setImportWalletId] = useState('')
  const [importFile, setImportFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [walletFilter, setWalletFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(parseFloat(value))
  }

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        t.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false
      const matchesCategory =
        categoryFilter === 'all' || t.categoryId === categoryFilter
      const matchesWallet =
        walletFilter === 'all' || t.walletId === walletFilter
      const matchesType = typeFilter === 'all' || t.type === typeFilter
      return matchesSearch && matchesCategory && matchesWallet && matchesType
    })
  }, [transactions, searchTerm, categoryFilter, walletFilter, typeFilter])

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {}

    // Sort by date desc first
    const sorted = [...filteredTransactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    sorted.forEach((t) => {
      const dateKey = format(new Date(t.date), 'yyyy-MM-dd')
      if (!groups[dateKey]) groups[dateKey] = []
      groups[dateKey].push(t)
    })

    return groups
  }, [filteredTransactions])

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr)
    if (isToday(date)) return 'Hoje'
    if (isYesterday(date)) return 'Ontem'
    return format(date, "dd 'de' MMMM", { locale: ptBR })
  }

  const handleDelete = async () => {
    if (!transactionToDelete) return
    try {
      await financeApi.transactions.delete(transactionToDelete.id)
      toast.success('Transação excluída com sucesso')
      onRefresh()
    } catch {
      toast.error('Erro ao excluir transação')
    } finally {
      setTransactionToDelete(null)
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setIsCreateModalOpen(true)
  }

  const handleImportNubank = async () => {
    if (!importWalletId || !importFile) {
      toast.error('Selecione carteira e arquivo antes de importar')
      return
    }

    try {
      setIsImporting(true)
      await financeApi.transactions.importNubank(importWalletId, importFile)
      toast.success('Fatura Nubank importada com sucesso')
      setIsImportModalOpen(false)
      setImportWalletId('')
      setImportFile(null)
      onRefresh()
    } catch {
      toast.error('Erro ao importar fatura Nubank')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Actions & Filters */}
      <div className="space-y-4 glass-dark p-4 rounded-xl">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="relative w-full md:w-64">
            <Input
              placeholder="Buscar transações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setEditingTransaction(null)
                setIsCreateModalOpen(true)
              }}
              size="sm"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Nova Transação
            </Button>
            <Button
              onClick={() => setIsImportModalOpen(true)}
              size="sm"
              variant="outline"
              className="gap-2"
            >
              Importar Nubank
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="Receita">Receitas</SelectItem>
              <SelectItem value="Despesa">Despesas</SelectItem>
            </SelectContent>
          </Select>

          <Select value={walletFilter} onValueChange={setWalletFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as contas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as contas</SelectItem>
              {wallets.map((wallet) => (
                <SelectItem key={wallet.id} value={wallet.id}>
                  {wallet.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Dialog
        open={isImportModalOpen}
        onOpenChange={(open) => {
          setIsImportModalOpen(open)
          if (!open) {
            setImportWalletId('')
            setImportFile(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Importar fatura Nubank</DialogTitle>
            <DialogDescription>
              Selecione a carteira e o arquivo CSV, OFX ou PDF exportado do
              Nubank.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="import-wallet">Carteira</Label>
              <Select value={importWalletId} onValueChange={setImportWalletId}>
                <SelectTrigger id="import-wallet">
                  <SelectValue placeholder="Selecione a carteira" />
                </SelectTrigger>
                <SelectContent>
                  {wallets.map((wallet) => (
                    <SelectItem key={wallet.id} value={wallet.id}>
                      {wallet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="import-file">Arquivo Nubank</Label>
              <Input
                id="import-file"
                type="file"
                accept=".csv,.ofx,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null
                  setImportFile(file)
                }}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsImportModalOpen(false)}
                disabled={isImporting}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleImportNubank}
                disabled={isImporting}
              >
                {isImporting ? 'Importando...' : 'Importar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
        {Object.keys(groupedTransactions).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <div className="bg-muted/50 p-4 rounded-full mb-4">
              <CalendarDays className="h-8 w-8 opacity-50" />
            </div>
            <p>Nenhuma transação encontrada</p>
          </div>
        ) : (
          Object.entries(groupedTransactions).map(([date, txs]) => (
            <div
              key={date}
              className="animate-in fade-in slide-in-from-bottom-2 duration-500"
            >
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 ml-1">
                {getDateLabel(date)}
              </h3>
              <div className="space-y-2">
                {txs.map((transaction) => {
                  const category = categories.find(
                    (c) => c.id === transaction.categoryId
                  )
                  const wallet = wallets.find(
                    (w) => w.id === transaction.walletId
                  )
                  const isIncome = transaction.type === 'Receita'

                  return (
                    <div
                      key={transaction.id}
                      className="group relative flex items-center justify-between p-3 rounded-xl hover:bg-muted/40 transition-colors border border-transparent hover:border-border/50"
                    >
                      <div className="flex items-center gap-4">
                        {/* Icon Box */}
                        <div
                          className="h-10 w-10 rounded-xl flex items-center justify-center text-lg shadow-sm"
                          style={{
                            backgroundColor: category?.color
                              ? `${category.color}20`
                              : '#f3f4f6',
                            color: category?.color || '#6b7280',
                          }}
                        >
                          {category?.icon ||
                            (isIncome ? (
                              <ArrowUpRight className="h-5 w-5" />
                            ) : (
                              <ArrowDownRight className="h-5 w-5" />
                            ))}
                        </div>

                        <div>
                          <p className="font-medium text-sm text-foreground">
                            {transaction.description ||
                              category?.name ||
                              'Sem descrição'}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            {wallet?.name}
                            {transaction.installmentNumber &&
                              ` • ${transaction.installmentNumber}/${transaction.totalInstallments}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p
                            className={`font-semibold tabular-nums text-sm ${isIncome ? 'text-emerald-600' : 'text-foreground'}`}
                          >
                            {isIncome ? '+' : '-'}{' '}
                            {formatCurrency(transaction.amount)}
                          </p>
                          <div className="flex justify-end mt-0.5">
                            {transaction.isPaid ? (
                              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <Clock className="h-3 w-3 text-amber-500" />
                            )}
                          </div>
                        </div>

                        {/* Direct actions instead of DropdownMenu */}
                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => handleEdit(transaction)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => setTransactionToDelete(transaction)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>

      <CreateTransactionModal
        open={isCreateModalOpen}
        onOpenChange={(open) => {
          setIsCreateModalOpen(open)
          if (!open) setEditingTransaction(null)
        }}
        wallets={wallets}
        categories={categories}
        initialData={editingTransaction}
        onSuccess={() => {
          setIsCreateModalOpen(false)
          setEditingTransaction(null)
          onRefresh()
        }}
      />

      <AlertDialog
        open={!!transactionToDelete}
        onOpenChange={() => setTransactionToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Transação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta transação? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
