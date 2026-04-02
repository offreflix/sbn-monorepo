import type React from 'react'
import type { ChartConfig } from '@repo/ui'
import type { WishlistItem, WishlistPriceEntry, WishlistPriorityEntry } from '../../api/wishlist'

export type WishlistDetailPriceForm = {
  cashPrice: number
  store: string
  storeUrl: string
  date: string
  notes: string
  currency: string
  installmentCount: number
  installmentValue: number
}

export type WishlistDetailPriorityForm = {
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  date: string
  notes: string
}

export type WishlistDetailEditForm = {
  name: string
  description: string
  imageUrl: string
  url: string
  tags: string
  notes: string
}

export type WishlistDetailModelOutput = {
  data: {
    item: WishlistItem | null
    priceEntries: WishlistPriceEntry[]
    priorityEntries: WishlistPriorityEntry[]
    bestEntry: WishlistPriceEntry | null
    charts: {
      price: {
        stores: string[]
        series: Array<{ key: string; color: string }>
        config: ChartConfig
        data: Array<Record<string, string | number | null>>
      }
      priority: {
        config: ChartConfig
        data: Array<{ date: string; priority: number; label: string }>
      }
    }
    ui: {
      statusBadgeClassByStatus: Record<string, string>
      statusLabelByStatus: Record<string, string>
      priorityLabelByNumeric: Record<number, string>
      priorityColorByPriority: Record<string, string>
      priorityLabelByPriority: Record<string, string>
    }
  }
  state: {
    loading: boolean
    notFound: boolean
    purchaseItem: WishlistItem | null
    addPriceOpen: boolean
    addPriorityOpen: boolean
    editOpen: boolean
    sameInstallment: boolean
    savingPrice: boolean
    savingPriority: boolean
    savingEdit: boolean
    priceForm: WishlistDetailPriceForm
    priorityForm: WishlistDetailPriorityForm
    editForm: WishlistDetailEditForm
  }
  setters: {
    setPurchaseItem: React.Dispatch<React.SetStateAction<WishlistItem | null>>
    setAddPriceOpen: React.Dispatch<React.SetStateAction<boolean>>
    setAddPriorityOpen: React.Dispatch<React.SetStateAction<boolean>>
    setEditOpen: React.Dispatch<React.SetStateAction<boolean>>
    setSameInstallment: React.Dispatch<React.SetStateAction<boolean>>
    setPriceForm: React.Dispatch<React.SetStateAction<WishlistDetailPriceForm>>
    setPriorityForm: React.Dispatch<React.SetStateAction<WishlistDetailPriorityForm>>
    setEditForm: React.Dispatch<React.SetStateAction<WishlistDetailEditForm>>
  }
  actions: {
    loadData: () => Promise<void>
    handleGoBack: () => void
    handlePriorityChange: (priority: string) => Promise<void>
    handleAddPrice: (e: React.FormEvent) => Promise<void>
    handleRemovePrice: (entryId: string) => Promise<void>
    handleAddPriority: (e: React.FormEvent) => Promise<void>
    handleRemovePriority: (entryId: string) => Promise<void>
    handleEditSave: (e: React.FormEvent) => Promise<void>
  }
}

