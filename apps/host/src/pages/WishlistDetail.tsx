import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  type ChartConfig,
} from '@repo/ui'
import {
  ArrowLeft,
  ExternalLink,
  Plus,
  Trash2,
  ShoppingCart,
  TrendingDown,
  Pencil,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@repo/ui'
import {
  wishlistApi,
  type WishlistItem,
  type WishlistPriceEntry,
  type WishlistPriorityEntry,
} from '../api/wishlist'
import { MoneyInput } from '../components/MoneyInput'
import { Header } from '../components/Header'
import { PurchaseTransactionModal } from '../components/PurchaseTransactionModal'

// ── Paleta de cores para séries por loja ─────────────────────────────────────
const SERIES_COLORS = [
  '#6366f1', '#f59e0b', '#10b981', '#ef4444',
  '#8b5cf6', '#06b6d4', '#f97316',
]

const PRIORITY_NUMERIC: Record<string, number> = { LOW: 1, MEDIUM: 2, HIGH: 3 }
const PRIORITY_LABELS: Record<number, string> = { 1: 'Baixa', 2: 'Média', 3: 'Alta' }
const PRIORITY_COLOR: Record<string, string> = {
  LOW: '#10b981',
  MEDIUM: '#f59e0b',
  HIGH: '#ef4444',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatPrice(price?: number, currency = 'BRL') {
  if (!price) return 'Preço não informado'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(price)
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR')
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'PURCHASED': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'REMOVED': return 'bg-gray-100 text-gray-600'
    default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'PURCHASED': return 'Comprado'
    case 'REMOVED': return 'Removido'
    default: return 'Desejado'
  }
}

// Gera dados e config para o gráfico de preços (uma série por loja)
function buildPriceChart(entries: WishlistPriceEntry[]) {
  const stores = Array.from(new Set(entries.map((e) => e.store)))
  const dates = Array.from(new Set(entries.map((e) => e.date.slice(0, 10)))).sort()

  const config: ChartConfig = {}
  stores.forEach((store, idx) => {
    config[store] = { label: store, color: SERIES_COLORS[idx % SERIES_COLORS.length] }
  })

  const data = dates.map((date) => {
    const point: Record<string, string | number | null> = { date }
    stores.forEach((store) => {
      const entry = entries.find(
        (e) => e.date.slice(0, 10) === date && e.store === store,
      )
      point[store] = entry ? Number(entry.price) : null
    })
    return point
  })

  return { stores, config, data }
}

// Gera dados e config para o gráfico de prioridade
function buildPriorityChart(entries: WishlistPriorityEntry[]) {
  const config: ChartConfig = {
    priority: { label: 'Prioridade', color: '#6366f1' },
  }
  const data = entries.map((e) => ({
    date: e.date.slice(0, 10),
    priority: PRIORITY_NUMERIC[e.priority] ?? 2,
    label: e.priority,
  }))
  return { config, data }
}

// ── Componente principal ──────────────────────────────────────────────────────

export function WishlistDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [item, setItem] = useState<WishlistItem | null>(null)
  const [priceEntries, setPriceEntries] = useState<WishlistPriceEntry[]>([])
  const [priorityEntries, setPriorityEntries] = useState<WishlistPriorityEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [purchaseItem, setPurchaseItem] = useState<WishlistItem | null>(null)

  // ── Dialog: adicionar preço ──
  const [addPriceOpen, setAddPriceOpen] = useState(false)
  const [priceForm, setPriceForm] = useState({
    price: 0, store: '', storeUrl: '',
    date: new Date().toISOString().slice(0, 10),
    notes: '', currency: 'BRL',
  })
  const [savingPrice, setSavingPrice] = useState(false)

  // ── Dialog: adicionar prioridade ──
  const [addPriorityOpen, setAddPriorityOpen] = useState(false)
  const [priorityForm, setPriorityForm] = useState({
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH',
    date: new Date().toISOString().slice(0, 10),
    notes: '',
  })
  const [savingPriority, setSavingPriority] = useState(false)

  // ── Dialog: editar item ──
  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '', description: '', imageUrl: '', url: '', tags: '', notes: '',
  })
  const [savingEdit, setSavingEdit] = useState(false)

  // ── Carregamento ──
  const loadData = useCallback(async () => {
    if (!id) return
    setLoading(true)
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

  useEffect(() => { loadData() }, [loadData])

  // Preenche o form de edição quando o item carrega
  useEffect(() => {
    if (item) {
      setEditForm({
        name: item.name,
        description: item.description ?? '',
        imageUrl: item.imageUrl ?? '',
        url: item.url ?? '',
        tags: item.tags.join(', '),
        notes: item.notes ?? '',
      })
    }
  }, [item])

  // ── Handlers ──

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
        price: priceForm.price,
        store: priceForm.store,
        currency: priceForm.currency,
        storeUrl: priceForm.storeUrl || undefined,
        date: priceForm.date,
        notes: priceForm.notes || undefined,
      })
      toast.success('Preço registrado!')
      setAddPriceOpen(false)
      setPriceForm({ price: 0, store: '', storeUrl: '', date: new Date().toISOString().slice(0, 10), notes: '', currency: 'BRL' })
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
      setPriorityForm({ priority: 'MEDIUM', date: new Date().toISOString().slice(0, 10), notes: '' })
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

  // ── Dados dos gráficos ──
  const { stores, config: priceConfig, data: priceChartData } = buildPriceChart(priceEntries)
  const { config: priorityConfig, data: priorityChartData } = buildPriorityChart(priorityEntries)

  const bestEntry = priceEntries.length > 0
    ? priceEntries.reduce((a, b) => Number(a.price) <= Number(b.price) ? a : b)
    : null

  // ── Loading / Not found ──

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header subtitle="Detalhe do Item" />
        <main className="mx-auto max-w-4xl px-4 py-10 text-center text-muted-foreground">
          Carregando...
        </main>
      </div>
    )
  }

  if (notFound || !item) {
    return (
      <div className="min-h-screen bg-background">
        <Header subtitle="Detalhe do Item" />
        <main className="mx-auto max-w-4xl px-4 py-10 text-center space-y-4">
          <p className="text-muted-foreground">Item não encontrado.</p>
          <Button onClick={() => navigate('/wishlist')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header subtitle="Detalhe do Item" />

      <main className="mx-auto max-w-4xl px-4 py-10 space-y-6">
        {/* Botão Voltar */}
        <Button variant="ghost" onClick={() => navigate('/wishlist')} className="-ml-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Wishlist
        </Button>

        {/* ── Header do item ── */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{item.name}</h1>
                  {/* Botão editar */}
                  <Dialog open={editOpen} onOpenChange={setEditOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Editar Item</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleEditSave} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-name">Nome</Label>
                          <Input
                            id="edit-name"
                            value={editForm.name}
                            onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-description">Descrição</Label>
                          <Textarea
                            id="edit-description"
                            value={editForm.description}
                            onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                            rows={4}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-url">URL do Produto</Label>
                          <Input
                            id="edit-url"
                            type="url"
                            value={editForm.url}
                            onChange={(e) => setEditForm((f) => ({ ...f, url: e.target.value }))}
                            placeholder="https://..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-imageUrl">URL da Imagem</Label>
                          <Input
                            id="edit-imageUrl"
                            type="url"
                            value={editForm.imageUrl}
                            onChange={(e) => setEditForm((f) => ({ ...f, imageUrl: e.target.value }))}
                            placeholder="https://..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-tags">Tags (separadas por vírgula)</Label>
                          <Input
                            id="edit-tags"
                            value={editForm.tags}
                            onChange={(e) => setEditForm((f) => ({ ...f, tags: e.target.value }))}
                            placeholder="eletrônicos, tecnologia..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-notes">Notas</Label>
                          <Textarea
                            id="edit-notes"
                            value={editForm.notes}
                            onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
                            rows={3}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                            Cancelar
                          </Button>
                          <Button type="submit" disabled={savingEdit}>
                            {savingEdit ? 'Salvando...' : 'Salvar'}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                  <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${getStatusBadge(item.status)}`}>
                    {getStatusLabel(item.status)}
                  </span>
                  {item.url && (
                    <a href={item.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-primary hover:underline">
                      <ExternalLink className="h-3 w-3" />
                      Ver produto
                    </a>
                  )}
                </div>
              </div>

              {/* Prioridade inline */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm text-muted-foreground">Prioridade:</span>
                <Select value={item.priority} onValueChange={handlePriorityChange}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW"><span className="text-green-500 font-semibold">Baixa</span></SelectItem>
                    <SelectItem value="MEDIUM"><span className="text-yellow-500 font-semibold">Média</span></SelectItem>
                    <SelectItem value="HIGH"><span className="text-red-500 font-semibold">Alta</span></SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {item.price && (
              <div className="text-2xl font-bold text-primary">
                {formatPrice(item.price, item.currency)}
              </div>
            )}

            {item.imageUrl && (
              <img src={item.imageUrl} alt={item.name}
                className="w-full max-h-80 object-cover rounded-lg"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
            )}

            {item.description && (
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {item.description}
              </p>
            )}

            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag, idx) => (
                  <span key={idx} className="px-2 py-1 text-xs bg-secondary rounded-md">{tag}</span>
                ))}
              </div>
            )}

            {item.notes && (
              <p className="text-sm text-muted-foreground border-l-2 pl-3 italic">{item.notes}</p>
            )}
          </CardContent>
        </Card>

        {/* ── Seção de Compra ── */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Status de Compra</CardTitle></CardHeader>
          <CardContent>
            {item.status === 'PURCHASED' ? (
              <div className="space-y-1">
                <p className="text-green-600 font-semibold flex items-center gap-2">
                  ✓ Comprado
                  {item.purchasedAt && (
                    <span className="text-muted-foreground font-normal">
                      em {formatDate(item.purchasedAt)}
                    </span>
                  )}
                </p>
                {item.price && (
                  <p className="text-sm text-muted-foreground">
                    Preço registrado: {formatPrice(item.price, item.currency)}
                  </p>
                )}
              </div>
            ) : (
              <Button onClick={() => setPurchaseItem(item)}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Marcar como comprado
              </Button>
            )}
          </CardContent>
        </Card>

        {/* ── Melhor Preço ── */}
        {bestEntry && (
          <Card className="border-green-500">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-green-500" />
                Melhor Preço Encontrado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {formatPrice(Number(bestEntry.price), bestEntry.currency)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    em <span className="font-semibold">{bestEntry.store}</span>
                    {' · '}{formatDate(bestEntry.date)}
                  </p>
                </div>
                {bestEntry.storeUrl && (
                  <a href={bestEntry.storeUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-1" /> Visitar
                    </Button>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Gráfico de Preços ── */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Histórico de Preços</CardTitle>
              <Dialog open={addPriceOpen} onOpenChange={setAddPriceOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar preço
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader><DialogTitle>Registrar Preço</DialogTitle></DialogHeader>
                  <form onSubmit={handleAddPrice} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Preço *</Label>
                      <MoneyInput
                        defaultValue={priceForm.price}
                        onChange={(v) => setPriceForm((f) => ({ ...f, price: v }))}
                        placeholder="0,00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Moeda</Label>
                      <Select value={priceForm.currency} onValueChange={(v) => setPriceForm((f) => ({ ...f, currency: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BRL">BRL (R$)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Loja *</Label>
                      <Input value={priceForm.store}
                        onChange={(e) => setPriceForm((f) => ({ ...f, store: e.target.value }))}
                        placeholder="Ex: Amazon, Mercado Livre..." required />
                    </div>
                    <div className="space-y-2">
                      <Label>URL da Loja</Label>
                      <Input type="url" value={priceForm.storeUrl}
                        onChange={(e) => setPriceForm((f) => ({ ...f, storeUrl: e.target.value }))}
                        placeholder="https://..." />
                    </div>
                    <div className="space-y-2">
                      <Label>Data *</Label>
                      <Input type="date" value={priceForm.date}
                        onChange={(e) => setPriceForm((f) => ({ ...f, date: e.target.value }))} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Notas</Label>
                      <Textarea value={priceForm.notes}
                        onChange={(e) => setPriceForm((f) => ({ ...f, notes: e.target.value }))}
                        placeholder="Observações..." rows={2} />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setAddPriceOpen(false)}>Cancelar</Button>
                      <Button type="submit" disabled={savingPrice || priceForm.price === 0}>
                        {savingPrice ? 'Salvando...' : 'Registrar'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {priceEntries.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">
                Nenhum preço registrado. Clique em "Adicionar preço" para começar o tracking!
              </p>
            ) : (
              <ChartContainer config={priceConfig} className="w-full h-[280px]">
                <LineChart data={priceChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: string) =>
                      new Date(v + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                    }
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatCurrency}
                    tick={{ fontSize: 12 }}
                    width={80}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) =>
                          new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value))
                        }
                        labelFormatter={(label) =>
                          new Date(String(label) + 'T00:00:00').toLocaleDateString('pt-BR')
                        }
                      />
                    }
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  {stores.map((store, idx) => (
                    <Line
                      key={store}
                      type="monotone"
                      dataKey={store}
                      stroke={SERIES_COLORS[idx % SERIES_COLORS.length]}
                      strokeWidth={2}
                      dot={{ r: 4, fill: SERIES_COLORS[idx % SERIES_COLORS.length] }}
                      activeDot={{ r: 6 }}
                      connectNulls={true}
                    />
                  ))}
                </LineChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* ── Tabela de registros de preço ── */}
        {priceEntries.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Registros de Preço</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left py-2 pr-4">Data</th>
                      <th className="text-left py-2 pr-4">Loja</th>
                      <th className="text-right py-2 pr-4">Preço</th>
                      <th className="text-left py-2 pr-4">Notas</th>
                      <th className="py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {priceEntries.map((entry) => (
                      <tr key={entry.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="py-2 pr-4 whitespace-nowrap">{formatDate(entry.date)}</td>
                        <td className="py-2 pr-4">
                          {entry.storeUrl ? (
                            <a href={entry.storeUrl} target="_blank" rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center gap-1">
                              {entry.store}<ExternalLink className="h-3 w-3" />
                            </a>
                          ) : entry.store}
                        </td>
                        <td className="py-2 pr-4 text-right font-semibold whitespace-nowrap">
                          {formatPrice(Number(entry.price), entry.currency)}
                        </td>
                        <td className="py-2 pr-4 text-muted-foreground max-w-[200px] truncate">
                          {entry.notes ?? '—'}
                        </td>
                        <td className="py-2">
                          <Button variant="ghost" size="sm"
                            onClick={() => handleRemovePrice(entry.id)}
                            className="text-destructive hover:text-destructive h-7 w-7 p-0">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Gráfico de Prioridade ── */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Histórico de Prioridade</CardTitle>
              <Dialog open={addPriorityOpen} onOpenChange={setAddPriorityOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Registrar prioridade
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-sm">
                  <DialogHeader><DialogTitle>Registrar Prioridade</DialogTitle></DialogHeader>
                  <form onSubmit={handleAddPriority} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Prioridade *</Label>
                      <Select value={priorityForm.priority}
                        onValueChange={(v) => setPriorityForm((f) => ({ ...f, priority: v as 'LOW' | 'MEDIUM' | 'HIGH' }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOW"><span className="text-green-500 font-semibold">Baixa</span></SelectItem>
                          <SelectItem value="MEDIUM"><span className="text-yellow-500 font-semibold">Média</span></SelectItem>
                          <SelectItem value="HIGH"><span className="text-red-500 font-semibold">Alta</span></SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Data *</Label>
                      <Input type="date" value={priorityForm.date}
                        onChange={(e) => setPriorityForm((f) => ({ ...f, date: e.target.value }))} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Notas</Label>
                      <Textarea value={priorityForm.notes}
                        onChange={(e) => setPriorityForm((f) => ({ ...f, notes: e.target.value }))}
                        placeholder="Ex: mudei de ideia por causa do preço..." rows={2} />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setAddPriorityOpen(false)}>Cancelar</Button>
                      <Button type="submit" disabled={savingPriority}>
                        {savingPriority ? 'Salvando...' : 'Registrar'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {priorityEntries.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">
                Nenhum registro de prioridade. Clique em "Registrar prioridade" para começar!
              </p>
            ) : (
              <>
                <ChartContainer config={priorityConfig} className="w-full h-[220px]">
                  <LineChart data={priorityChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v: string) =>
                        new Date(v + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                      }
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      domain={[0.5, 3.5]}
                      ticks={[1, 2, 3]}
                      tickFormatter={(v: number) => PRIORITY_LABELS[v] ?? ''}
                      tick={{ fontSize: 12 }}
                      width={50}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => PRIORITY_LABELS[Number(value)] ?? String(value)}
                          labelFormatter={(label) =>
                            new Date(String(label) + 'T00:00:00').toLocaleDateString('pt-BR')
                          }
                        />
                      }
                    />
                    <Line
                      type="stepAfter"
                      dataKey="priority"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      dot={(props) => {
                        const { cx, cy, payload } = props
                        const color = PRIORITY_COLOR[payload.label] ?? '#6366f1'
                        return <circle key={`dot-${cx}-${cy}`} cx={cx} cy={cy} r={5} fill={color} stroke="white" strokeWidth={2} />
                      }}
                    />
                  </LineChart>
                </ChartContainer>

                {/* Tabela de histórico de prioridade */}
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-muted-foreground">
                        <th className="text-left py-2 pr-4">Data</th>
                        <th className="text-left py-2 pr-4">Prioridade</th>
                        <th className="text-left py-2 pr-4">Notas</th>
                        <th className="py-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {[...priorityEntries].reverse().map((entry) => (
                        <tr key={entry.id} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="py-2 pr-4 whitespace-nowrap">{formatDate(entry.date)}</td>
                          <td className="py-2 pr-4">
                            <span style={{ color: PRIORITY_COLOR[entry.priority] }} className="font-semibold">
                              {entry.priority === 'HIGH' ? 'Alta' : entry.priority === 'MEDIUM' ? 'Média' : 'Baixa'}
                            </span>
                          </td>
                          <td className="py-2 pr-4 text-muted-foreground max-w-[200px] truncate">
                            {entry.notes ?? '—'}
                          </td>
                          <td className="py-2">
                            <Button variant="ghost" size="sm"
                              onClick={() => handleRemovePriority(entry.id)}
                              className="text-destructive hover:text-destructive h-7 w-7 p-0">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>

      <PurchaseTransactionModal
        open={!!purchaseItem}
        onOpenChange={(open) => { if (!open) setPurchaseItem(null) }}
        item={purchaseItem}
        onSuccess={() => { setPurchaseItem(null); loadData() }}
      />
    </div>
  )
}
