import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '../components/Header'
import { MoneyInput } from '../components/MoneyInput'
import { wishlistApi, type WishlistItem } from '../api/wishlist'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui'
import { Button } from '@repo/ui'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui'
import { Input } from '@repo/ui'
import { Label } from '@repo/ui'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui'
import { Switch } from '@repo/ui'
import { Textarea } from '@repo/ui'
import {
  Plus,
  Heart,
  Check,
  Trash2,
  ExternalLink,
  Filter,
  ShoppingCart,
} from 'lucide-react'
import { toast } from 'sonner'
import { PurchaseTransactionModal } from '../components/PurchaseTransactionModal'

export const WishlistPage = () => {
  const navigate = useNavigate()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [purchaseItem, setPurchaseItem] = useState<WishlistItem | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    currency: 'BRL',
    url: '',
    imageUrl: '',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH',
    tags: '',
    notes: '',
    installmentCount: 2,
    installmentValue: 0,
  })
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
  }, [filterStatus, filterPriority])

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
        ...(!sameInstallment && formData.installmentCount >= 2 && formData.installmentValue > 0 && {
          installmentCount: formData.installmentCount,
          installmentValue: formData.installmentValue,
        }),
      })

      toast.success('Item adicionado à lista de desejos!')
      setIsDialogOpen(false)
      setFormData({
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
      })
      setSameInstallment(true)
      loadItems()
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
      loadItems()
    } catch (error) {
      console.error('Erro ao deletar item:', error)
      toast.error('Erro ao remover item')
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'text-red-500'
      case 'MEDIUM':
        return 'text-yellow-500'
      case 'LOW':
        return 'text-green-500'
      default:
        return 'text-gray-500'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'Alta'
      case 'MEDIUM':
        return 'Média'
      case 'LOW':
        return 'Baixa'
      default:
        return priority
    }
  }

  const formatPrice = (price?: number, currency: string = 'BRL') => {
    if (!price) return 'Preço não informado'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency,
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header subtitle="Lista de Desejos" />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
        {/* Header com filtros e botão de adicionar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <h1 className="text-2xl font-bold">Minha Lista de Desejos</h1>
            <div className="flex gap-2 items-center">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={filterStatus}
                onValueChange={(value) => setFilterStatus(value)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="WISHED">Desejado</SelectItem>
                  <SelectItem value="PURCHASED">Comprado</SelectItem>
                  <SelectItem value="REMOVED">Removido</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filterPriority}
                onValueChange={(value) => setFilterPriority(value)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="HIGH">Alta</SelectItem>
                  <SelectItem value="MEDIUM">Média</SelectItem>
                  <SelectItem value="LOW">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Adicionar Item à Lista de Desejos</DialogTitle>
                <DialogDescription>
                  Adicione um novo item à sua lista de desejos
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    placeholder="Ex: iPhone 15 Pro"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Descrição do item..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Preço à vista</Label>
                    <MoneyInput
                      id="price"
                      defaultValue={formData.price}
                      onChange={(value) =>
                        setFormData({ ...formData, price: value })
                      }
                      placeholder="0,00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Moeda</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(value) =>
                        setFormData({ ...formData, currency: value })
                      }
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
                </div>

                {/* Switch: Mesmo valor parcelado */}
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <Label
                      htmlFor="same-installment-add"
                      className="cursor-pointer"
                    >
                      Mesmo valor parcelado
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Desative para informar parcelamento diferente
                    </p>
                  </div>
                  <Switch
                    id="same-installment-add"
                    checked={sameInstallment}
                    onCheckedChange={setSameInstallment}
                  />
                </div>

                {/* Campos de parcelamento */}
                {!sameInstallment && (
                  <div className="space-y-3 rounded-lg p-3 border">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Nº de parcelas</Label>
                        <Input
                          type="number"
                          min={2}
                          value={formData.installmentCount}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              installmentCount: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Valor da parcela</Label>
                        <MoneyInput
                          defaultValue={formData.installmentValue}
                          onChange={(v) =>
                            setFormData((f) => ({ ...f, installmentValue: v }))
                          }
                          placeholder="0,00"
                        />
                      </div>
                    </div>
                    {formData.installmentCount >= 2 &&
                      formData.installmentValue > 0 &&
                      (() => {
                        const total =
                          formData.installmentCount * formData.installmentValue
                        const diff = total - formData.price
                        const fmt = (v: number) =>
                          new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(v)
                        return (
                          <div className="text-sm space-y-0.5">
                            <p className="text-muted-foreground">
                              Total parcelado:{' '}
                              <span className="font-semibold text-foreground">
                                {fmt(total)}
                              </span>
                            </p>
                            {diff > 0 ? (
                              <p className="text-orange-600 font-medium">
                                + {fmt(diff)} mais caro parcelando
                              </p>
                            ) : (
                              <p className="text-green-600 font-medium">
                                Sem acréscimo
                              </p>
                            )}
                          </div>
                        )
                      })()}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="url">URL do Produto</Label>
                  <Input
                    id="url"
                    type="url"
                    value={formData.url}
                    onChange={(e) =>
                      setFormData({ ...formData, url: e.target.value })
                    }
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">URL da Imagem</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, imageUrl: e.target.value })
                    }
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: 'LOW' | 'MEDIUM' | 'HIGH') =>
                      setFormData({ ...formData, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Baixa</SelectItem>
                      <SelectItem value="MEDIUM">Média</SelectItem>
                      <SelectItem value="HIGH">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                    placeholder="eletrônicos, tecnologia, celular"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Notas adicionais..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">Adicionar</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de itens */}
        {loading ? (
          <div className="text-center py-10 text-muted-foreground">
            Carregando...
          </div>
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Sua lista de desejos está vazia. Adicione seu primeiro item!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <Card
                key={item.id}
                className={`cursor-pointer transition-shadow hover:shadow-md ${
                  item.status === 'PURCHASED'
                    ? 'opacity-60 border-green-500'
                    : ''
                }`}
                onClick={() => navigate(`/wishlist/${item.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      {item.description && (
                        <CardDescription className="mt-1">
                          {item.description.length > 100
                            ? `${item.description.slice(0, 100)}…`
                            : item.description}
                        </CardDescription>
                      )}
                    </div>
                    <span
                      className={`text-sm font-semibold ${getPriorityColor(
                        item.priority,
                      )}`}
                    >
                      {getPriorityLabel(item.priority)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-48 object-cover rounded-md"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  )}

                  {item.price && (
                    <div className="text-lg font-semibold">
                      {formatPrice(item.price, item.currency)}
                    </div>
                  )}

                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Ver produto
                    </a>
                  )}

                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs bg-secondary rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {item.notes && (
                    <p className="text-sm text-muted-foreground">
                      {item.notes}
                    </p>
                  )}

                  {item.status === 'PURCHASED' && item.purchasedAt && (
                    <div className="text-sm text-green-600 flex items-center gap-1">
                      <Check className="h-4 w-4" />
                      Comprado em{' '}
                      {new Date(item.purchasedAt).toLocaleDateString('pt-BR')}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2 border-t">
                    {item.status !== 'PURCHASED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePurchase(item)
                        }}
                        className="flex-1"
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Comprado
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(item.id)
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <PurchaseTransactionModal
        open={!!purchaseItem}
        onOpenChange={(open) => {
          if (!open) setPurchaseItem(null)
        }}
        item={purchaseItem}
        onSuccess={() => {
          setPurchaseItem(null)
          loadItems()
        }}
      />
    </div>
  )
}
