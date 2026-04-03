import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { wishlistApi } from '../../api/wishlist'
import type { WishlistItem, WishlistCreateFormData } from './wishlist.type'

const initialFormData: WishlistCreateFormData = {
  name: '',
  description: '',
  price: 0,
  currency: 'BRL',
  url: '',
  imageUrl: '',
  priority: 'MEDIUM',
  tags: '',
  notes: '',
  installmentCount: 2,
  installmentValue: 0,
}

export function useWishlistModel() {
  const navigate = useNavigate()

  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [purchaseItem, setPurchaseItem] = useState<WishlistItem | null>(null)
  const [formData, setFormData] = useState<WishlistCreateFormData>(initialFormData)
  const [sameInstallment, setSameInstallment] = useState(true)

  const loadItems = useCallback(async () => {
    try {
      setLoading(true)
      const data = await wishlistApi.list(
        filterStatus !== 'all' ? filterStatus : undefined,
        filterPriority !== 'all' ? filterPriority : undefined,
      )
      setItems(data)
    } catch (error) {
      console.error('Erro ao carregar wishlist:', error)
      toast.error('Erro ao carregar lista de desejos')
    } finally {
      setLoading(false)
    }
  }, [filterPriority, filterStatus])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const tagsArray = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      await wishlistApi.create({
        name: formData.name,
        description: formData.description || undefined,
        price: formData.price > 0 ? formData.price : undefined,
        currency: formData.currency,
        url: formData.url || undefined,
        imageUrl: formData.imageUrl || undefined,
        priority: formData.priority,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
        notes: formData.notes || undefined,
        ...(!sameInstallment &&
          formData.installmentCount >= 2 &&
          formData.installmentValue > 0 && {
            installmentCount: formData.installmentCount,
            installmentValue: formData.installmentValue,
          }),
      })

      toast.success('Item adicionado à lista de desejos!')
      setIsDialogOpen(false)
      setFormData(initialFormData)
      setSameInstallment(true)
      await loadItems()
    } catch (error) {
      console.error('Erro ao criar item:', error)
      toast.error('Erro ao adicionar item')
    }
  }

  const handlePurchase = (item: WishlistItem) => {
    setPurchaseItem(item)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este item?')) return
    try {
      await wishlistApi.delete(id)
      toast.success('Item removido!')
      await loadItems()
    } catch (error) {
      console.error('Erro ao deletar item:', error)
      toast.error('Erro ao remover item')
    }
  }

  const handleNavigateToDetail = (id: string) => {
    navigate(`${id}`, { relative: 'path' })
  }

  return {
    data: {
      items,
    },
    state: {
      loading,
      isDialogOpen,
      filterStatus,
      filterPriority,
      purchaseItem,
      formData,
      sameInstallment,
    },
    setters: {
      setIsDialogOpen,
      setFilterStatus,
      setFilterPriority,
      setPurchaseItem,
      setFormData,
      setSameInstallment,
    },
    actions: {
      loadItems,
      handleSubmit,
      handleDelete,
      handlePurchase,
      handleNavigateToDetail,
    },
  }
}

export type WishlistModelOutput = ReturnType<typeof useWishlistModel>
