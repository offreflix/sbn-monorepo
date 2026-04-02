import type React from 'react'
import type { WishlistItem } from '../../api/wishlist'

export type WishlistCreateFormData = {
  name: string
  description: string
  price: number
  currency: string
  url: string
  imageUrl: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  tags: string
  notes: string
  installmentCount: number
  installmentValue: number
}

export type WishlistModelOutput = {
  data: {
    items: WishlistItem[]
  }
  state: {
    loading: boolean
    isDialogOpen: boolean
    filterStatus: string
    filterPriority: string
    purchaseItem: WishlistItem | null
    formData: WishlistCreateFormData
    sameInstallment: boolean
  }
  setters: {
    setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
    setFilterStatus: React.Dispatch<React.SetStateAction<string>>
    setFilterPriority: React.Dispatch<React.SetStateAction<string>>
    setPurchaseItem: React.Dispatch<React.SetStateAction<WishlistItem | null>>
    setFormData: React.Dispatch<React.SetStateAction<WishlistCreateFormData>>
    setSameInstallment: React.Dispatch<React.SetStateAction<boolean>>
  }
  actions: {
    loadItems: () => Promise<void>
    handleSubmit: (e: React.FormEvent) => Promise<void>
    handleDelete: (id: string) => Promise<void>
    handlePurchase: (item: WishlistItem) => void
    handleNavigateToDetail: (id: string) => void
  }
}

