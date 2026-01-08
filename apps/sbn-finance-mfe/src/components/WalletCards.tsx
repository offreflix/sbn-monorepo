import { Card, Badge, Button } from '@repo/ui'
import {
  Plus,
  CreditCard as CreditCardIcon,
  Landmark,
  Wallet as WalletIcon,
  Signal,
} from 'lucide-react'
import type { Wallet } from '../types/finance'
import { CreateWalletModal } from './CreateWalletModal'
import { useState } from 'react'

interface WalletCardsProps {
  wallets: Wallet[]
  onRefresh: () => void
}

export function WalletCards({ wallets, onRefresh }: WalletCardsProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(num)
  }

  // Helper to determine card visual style
  const getCardStyle = (type: string) => {
    const t = type.toLowerCase()
    if (t.includes('crédito') || t.includes('credit')) {
      return 'bg-gradient-to-br from-slate-900 to-slate-800 text-white border-slate-700'
    }
    if (t.includes('poupança') || t.includes('savings')) {
      return 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-emerald-600'
    }
    // Checking / Default
    return 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-indigo-500'
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end sticky top-0 backdrop-blur z-10 py-2">
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          size="sm"
          className="gap-2 rounded-full"
        >
          <Plus className="h-4 w-4" />
          Nova Carteira
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1">
        {wallets.map((wallet) => {
          const balance = parseFloat(wallet.balance)
          const styleClass = getCardStyle(wallet.type)
          const isCredit = wallet.type.toLowerCase().includes('crédito')

          return (
            <div
              key={wallet.id}
              className={`relative w-full aspect-[1.586/1] rounded-2xl p-6 shadow-xl overflow-hidden flex flex-col justify-between transition-transform hover:scale-[1.02] cursor-pointer ${styleClass}`}
            >
              {/* Background noise/texture overlay could go here */}

              {/* Top Row: Chip & NFC */}
              <div className="flex justify-between items-start">
                <div className="w-12 h-9 rounded bg-gradient-to-tr from-yellow-200 to-yellow-400 border border-yellow-500/30 flex items-center justify-center opacity-90">
                  <div className="w-full h-[1px] bg-black/10 absolute top-1/3" />
                  <div className="w-full h-[1px] bg-black/10 absolute top-2/3" />
                  <div className="h-full w-[1px] bg-black/10 absolute left-1/3" />
                  <div className="h-full w-[1px] bg-black/10 absolute left-2/3" />
                </div>
                <Signal className="h-6 w-6 opacity-60 rotate-90" />
              </div>

              {/* Middle: Number (Masked) */}
              <div className="flex justify-between items-center mt-2">
                <div className="text-lg tracking-widest font-mono opacity-90 flex gap-4">
                  <span>••••</span>
                  <span>••••</span>
                  <span>••••</span>
                  <span className="text-sm font-sans opacity-70 absolute top-2 right-6">
                    {isCredit ? 'CREDIT' : 'DEBIT'}
                  </span>
                </div>
              </div>

              {/* Bottom: Info & Balance */}
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider opacity-70">
                  Saldo {isCredit ? 'Disponível' : 'Atual'}
                </p>
                <div className="flex justify-between items-end">
                  <p className="text-2xl font-bold tracking-tight tabular-nums">
                    {isCredit && wallet.limit
                      ? formatCurrency(parseFloat(wallet.limit) + balance)
                      : formatCurrency(balance)}
                  </p>
                  <div className="flex flex-col items-end">
                    <p className="text-xs font-medium opacity-80">
                      {wallet.name}
                    </p>
                    {/* Mastercard/Visa visual circle proxy */}
                    <div className="flex -space-x-2 mt-1">
                      <div className="w-6 h-6 rounded-full bg-red-500/80" />
                      <div className="w-6 h-6 rounded-full bg-orange-400/80" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
