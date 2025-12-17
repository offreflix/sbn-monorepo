import { Card, Badge, Button } from '@repo/ui'
import { CreditCard, Wallet as WalletIcon, PiggyBank, Plus } from 'lucide-react'
import type { Wallet } from '../types/finance'
import { CreateWalletModal } from './CreateWalletModal'
import { useState } from 'react'

interface WalletCardsProps {
  wallets: Wallet[]
  onRefresh: () => void
}

export function WalletCards({ wallets, onRefresh }: WalletCardsProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(parseFloat(value))
  }

  const getWalletIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'credit':
      case 'cartão de crédito':
        return <CreditCard className="h-5 w-5" />
      case 'savings':
      case 'poupança':
        return <PiggyBank className="h-5 w-5" />
      default:
        return <WalletIcon className="h-5 w-5" />
    }
  }

  const getWalletType = (type: string) => {
    switch (type.toLowerCase()) {
      case 'credit':
      case 'cartão de crédito':
        return 'Crédito'
      case 'savings':
      case 'poupança':
        return 'Poupança'
      case 'checking':
      case 'conta corrente':
        return 'Corrente'
      default:
        return type
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          size="sm"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Carteira
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {wallets.map((wallet) => {
          const balance = parseFloat(wallet.balance)
          return (
            <Card
              key={wallet.id}
              className="p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {getWalletIcon(wallet.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {wallet.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {getWalletType(wallet.type)}
                    </p>
                  </div>
                </div>
                {wallet.is_active && (
                  <Badge variant="secondary" className="text-xs">
                    Ativa
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Saldo</p>
                  <p
                    className={`text-2xl font-bold ${balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}
                  >
                    {formatCurrency(wallet.balance)}
                  </p>
                </div>

                {wallet.type.toLowerCase().includes('crédito') &&
                  wallet.limit && (
                    <div className="pt-3 border-t border-border">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Limite</span>
                        <span className="font-medium text-foreground">
                          {formatCurrency(wallet.limit)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-muted-foreground">
                          Disponível
                        </span>
                        <span className="font-medium text-emerald-600">
                          {formatCurrency(parseFloat(wallet.limit) + balance)}
                        </span>
                      </div>
                      {wallet.invoice_closing_day && wallet.invoice_due_day && (
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-muted-foreground">Fatura</span>
                          <span className="font-medium text-foreground">
                            Dia {wallet.invoice_due_day}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
              </div>
            </Card>
          )
        })}
      </div>

      <CreateWalletModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={() => {
          setIsCreateModalOpen(false)
          onRefresh()
        }}
      />
    </div>
  )
}
