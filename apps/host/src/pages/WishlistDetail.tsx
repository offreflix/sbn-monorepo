import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  ArrowLeft,
  ExternalLink,
  Plus,
  Trash2,
  ShoppingCart,
  TrendingDown,
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
import { wishlistApi, type WishlistItem, type WishlistPriceEntry } from '../api/wishlist'
import { MoneyInput } from '../components/MoneyInput'
import { Header } from '../components/Header'
import { PurchaseTransactionModal } from '../components/PurchaseTransactionModal'

// Cores para as séries do gráfico por loja
const STORE_COLORS = [
  '#6366f1',
  '#f59e0b',
  '#10b981',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#f97316',
]

function formatPrice(price?: number, currency = 'BRL') {
  if (!price) return 'Preço não informado'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(price)
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

// Constrói dados para o gráfico: uma série por loja
function buildChartData(entries: WishlistPriceEntry[]) {
  const stores = Array.from(new Set(entries.map((e) => e.store)))

  // Datas únicas ordenadas
  const dates = Array.from(new Set(entries.map((e) => e.date.slice(0, 10)))).sort()

  return {
    stores,
    data: dates.map((date) => {
      const point: Record<string, string | number> = { date }
      for (const store of stores) {
        const entry = entries.find(
          (e) => e.date.slice(0, 10) === date && e.store === store,
        )
        if (entry) point[store] = Number(entry.price)
      }
      return point
    }),
  }
}

export function WishlistDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [item, setItem] = useState<WishlistItem | null>(null)
  const [priceEntries, setPriceEntries] = useState<WishlistPriceEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [purchaseItem, setPurchaseItem] = useState<WishlistItem | null>(null)

  // Estado do dialog de adicionar preço
  const [addPriceOpen, setAddPriceOpen] = useState(false)
  const [priceForm, setPriceForm] = useState({
    price: 0,
    store: '',
    storeUrl: '',
    date: new Date().toISOString().slice(0, 10),
    notes: '',
    currency: 'BRL',
  })
  const [savingPrice, setSavingPrice] = useState(false)

  const loadData = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const [fetchedItem, fetchedPrices] = await Promise.all([
        wishlistApi.get(id),
        wishlistApi.getPrices(id),
      ])
      setItem(fetchedItem)
      setPriceEntries(fetchedPrices)
    } catch {
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handlePriorityChange = async (priority: string) => {
    if (!item) return
    try {
      const updated = await wishlistApi.update(item.id, { priority: priority as 'LOW' | 'MEDIUM' | 'HIGH' })
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

  // ── Melhor preço ──
  const bestEntry = priceEntries.length > 0
    ? priceEntries.reduce((a, b) => Number(a.price) <= Number(b.price) ? a : b)
    : null

  // ── Gráfico ──
  const { stores, data: chartData } = buildChartData(priceEntries)

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
        <main className="mx-auto max-w-4xl px-4 py-10 text-center">
          <p className="text-muted-foreground mb-4">Item não encontrado.</p>
          <Button onClick={() => navigate('/wishlist')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar para a Wishlist
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

        {/* Header do item */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold">{item.name}</h1>
                <div className="flex flex-wrap gap-2 items-center">
                  <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${getStatusBadge(item.status)}`}>
                    {getStatusLabel(item.status)}
                  </span>
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Ver produto
                    </a>
                  )}
                </div>
              </div>

              {/* Prioridade inline */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Prioridade:</span>
                <Select value={item.priority} onValueChange={handlePriorityChange}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">
                      <span className="text-green-500 font-semibold">Baixa</span>
                    </SelectItem>
                    <SelectItem value="MEDIUM">
                      <span className="text-yellow-500 font-semibold">Média</span>
                    </SelectItem>
                    <SelectItem value="HIGH">
                      <span className="text-red-500 font-semibold">Alta</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Preço atual */}
            {item.price && (
              <div className="text-2xl font-bold text-primary">
                {formatPrice(item.price, item.currency)}
              </div>
            )}

            {/* Imagem */}
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full max-h-80 object-cover rounded-lg"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
            )}

            {/* Descrição completa */}
            {item.description && (
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {item.description}
              </p>
            )}

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag, idx) => (
                  <span key={idx} className="px-2 py-1 text-xs bg-secondary rounded-md">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Notas */}
            {item.notes && (
              <p className="text-sm text-muted-foreground border-l-2 pl-3 italic">
                {item.notes}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Seção de Compra */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status de Compra</CardTitle>
          </CardHeader>
          <CardContent>
            {item.status === 'PURCHASED' ? (
              <div className="space-y-2">
                <p className="text-green-600 font-semibold flex items-center gap-2">
                  ✓ Comprado
                  {item.purchasedAt && (
                    <span className="text-muted-foreground font-normal">
                      em {new Date(item.purchasedAt).toLocaleDateString('pt-BR')}
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
              <Button
                onClick={() => setPurchaseItem(item)}
                className="flex items-center gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                Marcar como comprado
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Melhor Preço */}
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
                    {' · '}
                    {new Date(bestEntry.date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                {bestEntry.storeUrl && (
                  <a
                    href={bestEntry.storeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-1" /> Visitar
                    </Button>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Gráfico de Preços */}
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
                  <DialogHeader>
                    <DialogTitle>Registrar Preço</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddPrice} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="entry-price">Preço *</Label>
                      <MoneyInput
                        id="entry-price"
                        defaultValue={priceForm.price}
                        onChange={(v) => setPriceForm((f) => ({ ...f, price: v }))}
                        placeholder="0,00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="entry-currency">Moeda</Label>
                      <Select
                        value={priceForm.currency}
                        onValueChange={(v) => setPriceForm((f) => ({ ...f, currency: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BRL">BRL (R$)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="entry-store">Loja *</Label>
                      <Input
                        id="entry-store"
                        value={priceForm.store}
                        onChange={(e) => setPriceForm((f) => ({ ...f, store: e.target.value }))}
                        placeholder="Ex: Amazon, Mercado Livre..."
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="entry-store-url">URL da Loja</Label>
                      <Input
                        id="entry-store-url"
                        type="url"
                        value={priceForm.storeUrl}
                        onChange={(e) => setPriceForm((f) => ({ ...f, storeUrl: e.target.value }))}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="entry-date">Data *</Label>
                      <Input
                        id="entry-date"
                        type="date"
                        value={priceForm.date}
                        onChange={(e) => setPriceForm((f) => ({ ...f, date: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="entry-notes">Notas</Label>
                      <Textarea
                        id="entry-notes"
                        value={priceForm.notes}
                        onChange={(e) => setPriceForm((f) => ({ ...f, notes: e.target.value }))}
                        placeholder="Observações..."
                        rows={2}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setAddPriceOpen(false)}>
                        Cancelar
                      </Button>
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
                Nenhum preço registrado ainda. Clique em "Adicionar preço" para começar o tracking!
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v) => new Date(v + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    tickFormatter={(v) =>
                      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)
                    }
                    tick={{ fontSize: 12 }}
                    width={80}
                  />
                  <Tooltip
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any, name: any) => [
                      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value)),
                      name,
                    ]}
                    labelFormatter={(label) => new Date(String(label) + 'T00:00:00').toLocaleDateString('pt-BR')}
                  />
                  <Legend />
                  {stores.map((store, idx) => (
                    <Line
                      key={store}
                      type="monotone"
                      dataKey={store}
                      stroke={STORE_COLORS[idx % STORE_COLORS.length]}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      connectNulls={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Tabela de registros */}
        {priceEntries.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Registros de Preço</CardTitle>
            </CardHeader>
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
                        <td className="py-2 pr-4 whitespace-nowrap">
                          {new Date(entry.date).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-2 pr-4">
                          {entry.storeUrl ? (
                            <a
                              href={entry.storeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center gap-1"
                            >
                              {entry.store}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            entry.store
                          )}
                        </td>
                        <td className="py-2 pr-4 text-right font-semibold whitespace-nowrap">
                          {formatPrice(Number(entry.price), entry.currency)}
                        </td>
                        <td className="py-2 pr-4 text-muted-foreground max-w-[200px] truncate">
                          {entry.notes ?? '—'}
                        </td>
                        <td className="py-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemovePrice(entry.id)}
                            className="text-destructive hover:text-destructive h-7 w-7 p-0"
                          >
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
      </main>

      <PurchaseTransactionModal
        open={!!purchaseItem}
        onOpenChange={(open) => { if (!open) setPurchaseItem(null) }}
        item={purchaseItem}
        onSuccess={() => {
          setPurchaseItem(null)
          loadData()
        }}
      />
    </div>
  )
}
