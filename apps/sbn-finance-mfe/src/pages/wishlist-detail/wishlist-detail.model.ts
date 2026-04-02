import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  wishlistApi,
  type WishlistItem,
  type WishlistPriceEntry,
  type WishlistPriorityEntry,
} from '../../api/wishlist'
import type {
  WishlistDetailEditForm,
  WishlistDetailPriceForm,
  WishlistDetailPriorityForm,
} from './wishlist-detail.type'
import type { ChartConfig } from '@repo/ui'

const SERIES_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316']

const PRIORITY_NUMERIC: Record<string, number> = { LOW: 1, MEDIUM: 2, HIGH: 3 }
const PRIORITY_LABELS: Record<number, string> = { 1: 'Baixa', 2: 'Média', 3: 'Alta' }
const PRIORITY_LABEL_BY_PRIORITY: Record<string, string> = { LOW: 'Baixa', MEDIUM: 'Média', HIGH: 'Alta' }
const PRIORITY_COLOR: Record<string, string> = { LOW: '#10b981', MEDIUM: '#f59e0b', HIGH: '#ef4444' }

const STATUS_BADGE_CLASS: Record<string, string> = {
  PURCHASED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  REMOVED: 'bg-gray-100 text-gray-600',
  WISHED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
}
const STATUS_LABEL: Record<string, string> = { PURCHASED: 'Comprado', REMOVED: 'Removido', WISHED: 'Desejado' }

const initialPriceForm: WishlistDetailPriceForm = {
  cashPrice: 0,
  store: '',
  storeUrl: '',
  date: new Date().toISOString().slice(0, 10),
  notes: '',
  currency: 'BRL',
  installmentCount: 2,
  installmentValue: 0,
}
const initialPriorityForm: WishlistDetailPriorityForm = {
  priority: 'MEDIUM',
  date: new Date().toISOString().slice(0, 10),
  notes: '',
}
const initialEditForm: WishlistDetailEditForm = {
  name: '',
  description: '',
  imageUrl: '',
  url: '',
  tags: '',
  notes: '',
}

function buildPriceChart(entries: WishlistPriceEntry[]) {
  const stores = Array.from(new Set(entries.map((e) => e.store)))
  const dates = Array.from(new Set(entries.map((e) => e.date.slice(0, 10)))).sort()
  const series = stores.map((store, idx) => ({ key: store, color: SERIES_COLORS[idx % SERIES_COLORS.length] }))
  const config: ChartConfig = {}
  series.forEach((s) => {
    ;(config as any)[s.key] = { label: s.key, color: s.color }
  })
  const data = dates.map((date) => {
    const point: Record<string, string | number | null> = { date }
    stores.forEach((store) => {
      const entry = entries.find((e) => e.date.slice(0, 10) === date && e.store === store)
      point[store] = entry ? Number(entry.price) : null
    })
    return point
  })
  return { stores, series, config, data }
}

function buildPriorityChart(entries: Array<{ date: string; priority: string }>) {
  const config: ChartConfig = { priority: { label: 'Prioridade', color: '#6366f1' } }
  const data = entries.map((e) => ({
    date: e.date.slice(0, 10),
    priority: PRIORITY_NUMERIC[e.priority] ?? 2,
    label: e.priority,
  }))
  return { config, data }
}

export function useWishlistDetailModel() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [item, setItem] = useState<WishlistItem | null>(null)
  const [priceEntries, setPriceEntries] = useState<WishlistPriceEntry[]>([])
  const [priorityEntries, setPriorityEntries] = useState<WishlistPriorityEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [purchaseItem, setPurchaseItem] = useState<WishlistItem | null>(null)

  const [addPriceOpen, setAddPriceOpen] = useState(false)
  const [priceForm, setPriceForm] = useState<WishlistDetailPriceForm>(initialPriceForm)
  const [sameInstallment, setSameInstallment] = useState(true)
  const [savingPrice, setSavingPrice] = useState(false)

  const [addPriorityOpen, setAddPriorityOpen] = useState(false)
  const [priorityForm, setPriorityForm] = useState<WishlistDetailPriorityForm>(initialPriorityForm)
  const [savingPriority, setSavingPriority] = useState(false)

  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState<WishlistDetailEditForm>(initialEditForm)
  const [savingEdit, setSavingEdit] = useState(false)

  const loadData = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setNotFound(false)
    try {
      const [fetchedItem, fetchedPrices, fetchedPriorities] = await Promise.all([
        wishlistApi.get(id),
        wishlistApi.getPrices(id),
        wishlistApi.getPriorities(id),
      ])
      setItem(fetchedItem)
      setPriceEntries(fetchedPrices)
      setPriorityEntries(fetchedPriorities)
    } catch {
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    if (!item) return
    setEditForm({
      name: item.name,
      description: item.description ?? '',
      imageUrl: item.imageUrl ?? '',
      url: item.url ?? '',
      tags: item.tags.join(', '),
      notes: item.notes ?? '',
    })
  }, [item])

  const { stores, series, config: priceConfig, data: priceChartData } = useMemo(() => {
    return buildPriceChart(priceEntries)
  }, [priceEntries])

  const { config: priorityConfig, data: priorityChartData } = useMemo(() => {
    return buildPriorityChart(priorityEntries)
  }, [priorityEntries])

  const bestEntry = useMemo(() => {
    if (priceEntries.length === 0) return null
    return priceEntries.reduce((a, b) => (Number(a.price) <= Number(b.price) ? a : b))
  }, [priceEntries])

  const handleGoBack = () => {
    navigate('..', { replace: true })
  }

  const handlePriorityChange = async (priority: string) => {
    if (!item) return
    try {
      const updated = await wishlistApi.update(item.id, {
        priority: priority as 'LOW' | 'MEDIUM' | 'HIGH',
      })
      setItem(updated)
      toast.success('Prioridade atualizada!')
    } catch {
      toast.error('Erro ao atualizar prioridade')
    }
  }

  const handleAddPrice = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !priceForm.store.trim()) return
    setSavingPrice(true)
    try {
      await wishlistApi.addPrice(id, {
        price: priceForm.cashPrice,
        cashPrice: priceForm.cashPrice,
        store: priceForm.store,
        currency: priceForm.currency,
        storeUrl: priceForm.storeUrl || undefined,
        date: priceForm.date,
        notes: priceForm.notes || undefined,
        ...(!sameInstallment && {
          installmentCount: priceForm.installmentCount,
          installmentValue: priceForm.installmentValue,
        }),
      })
      toast.success('Preço registrado!')
      setAddPriceOpen(false)
      setPriceForm({ ...initialPriceForm, date: new Date().toISOString().slice(0, 10) })
      setSameInstallment(true)
      const prices = await wishlistApi.getPrices(id)
      setPriceEntries(prices)
    } catch {
      toast.error('Erro ao registrar preço')
    } finally {
      setSavingPrice(false)
    }
  }

  const handleRemovePrice = async (entryId: string) => {
    if (!id) return
    if (!confirm('Remover este registro de preço?')) return
    try {
      await wishlistApi.removePrice(id, entryId)
      setPriceEntries((prev) => prev.filter((e) => e.id !== entryId))
      toast.success('Registro removido!')
    } catch {
      toast.error('Erro ao remover registro')
    }
  }

  const handleAddPriority = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    setSavingPriority(true)
    try {
      await wishlistApi.addPriority(id, priorityForm)
      toast.success('Prioridade registrada!')
      setAddPriorityOpen(false)
      setPriorityForm({ ...initialPriorityForm, date: new Date().toISOString().slice(0, 10) })
      const priorities = await wishlistApi.getPriorities(id)
      setPriorityEntries(priorities)
    } catch {
      toast.error('Erro ao registrar prioridade')
    } finally {
      setSavingPriority(false)
    }
  }

  const handleRemovePriority = async (entryId: string) => {
    if (!id) return
    if (!confirm('Remover este registro de prioridade?')) return
    try {
      await wishlistApi.removePriority(id, entryId)
      setPriorityEntries((prev) => prev.filter((e) => e.id !== entryId))
      toast.success('Registro removido!')
    } catch {
      toast.error('Erro ao remover registro')
    }
  }

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!item) return
    setSavingEdit(true)
    try {
      const tags = editForm.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
      const updated = await wishlistApi.update(item.id, {
        name: editForm.name || undefined,
        description: editForm.description || undefined,
        imageUrl: editForm.imageUrl || undefined,
        url: editForm.url || undefined,
        tags: tags.length > 0 ? tags : undefined,
        notes: editForm.notes || undefined,
      })
      setItem(updated)
      toast.success('Item atualizado!')
      setEditOpen(false)
    } catch {
      toast.error('Erro ao atualizar item')
    } finally {
      setSavingEdit(false)
    }
  }

  return {
    data: {
      item,
      priceEntries,
      priorityEntries,
      bestEntry,
      charts: {
        price: { stores, series, config: priceConfig, data: priceChartData },
        priority: { config: priorityConfig, data: priorityChartData },
      },
      ui: {
        statusBadgeClassByStatus: STATUS_BADGE_CLASS,
        statusLabelByStatus: STATUS_LABEL,
        priorityLabelByNumeric: PRIORITY_LABELS,
        priorityColorByPriority: PRIORITY_COLOR,
        priorityLabelByPriority: PRIORITY_LABEL_BY_PRIORITY,
      },
    },
    state: {
      loading,
      notFound,
      purchaseItem,
      addPriceOpen,
      addPriorityOpen,
      editOpen,
      sameInstallment,
      savingPrice,
      savingPriority,
      savingEdit,
      priceForm,
      priorityForm,
      editForm,
    },
    setters: {
      setPurchaseItem,
      setAddPriceOpen,
      setAddPriorityOpen,
      setEditOpen,
      setSameInstallment,
      setPriceForm,
      setPriorityForm,
      setEditForm,
    },
    actions: {
      loadData,
      handleGoBack,
      handlePriorityChange,
      handleAddPrice,
      handleRemovePrice,
      handleAddPriority,
      handleRemovePriority,
      handleEditSave,
    },
  }
}

export type WishlistDetailModelOutput = ReturnType<typeof useWishlistDetailModel>
