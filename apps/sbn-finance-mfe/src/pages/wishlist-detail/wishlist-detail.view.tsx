import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Line,
  LineChart,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
  XAxis,
  YAxis,
  CartesianGrid,
} from '@repo/ui'
import {
  ArrowLeft,
  ExternalLink,
  Pencil,
  Plus,
  ShoppingCart,
  Trash2,
  TrendingDown,
} from 'lucide-react'
import { MoneyInput } from '../../components/MoneyInput'
import { PurchaseTransactionModal } from '../../components/PurchaseTransactionModal'
import type { WishlistDetailModelOutput } from './wishlist-detail.model'

function formatPrice(price?: number, currency = 'BRL') {
  if (!price) return 'Preço não informado'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(
    price,
  )
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

export function WishlistDetailView({
  data: { item, priceEntries, priorityEntries, bestEntry, charts, ui },
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
}: WishlistDetailModelOutput) {
  if (loading) {
    return (
      <div className="py-10 text-center text-muted-foreground">
        Carregando...
      </div>
    )
  }

  if (notFound || !item) {
    return (
      <div className="py-10 text-center space-y-4">
        <p className="text-muted-foreground">Item não encontrado.</p>
        <Button onClick={handleGoBack}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={handleGoBack} className="-ml-2">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Wishlist
      </Button>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{item.name}</h1>
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
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              name: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-description">Descrição</Label>
                        <Textarea
                          id="edit-description"
                          value={editForm.description}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              description: e.target.value,
                            }))
                          }
                          rows={4}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-url">URL do Produto</Label>
                        <Input
                          id="edit-url"
                          type="url"
                          value={editForm.url}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              url: e.target.value,
                            }))
                          }
                          placeholder="https://..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-imageUrl">URL da Imagem</Label>
                        <Input
                          id="edit-imageUrl"
                          type="url"
                          value={editForm.imageUrl}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              imageUrl: e.target.value,
                            }))
                          }
                          placeholder="https://..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-tags">
                          Tags (separadas por vírgula)
                        </Label>
                        <Input
                          id="edit-tags"
                          value={editForm.tags}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              tags: e.target.value,
                            }))
                          }
                          placeholder="eletrônicos, tecnologia..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-notes">Notas</Label>
                        <Textarea
                          id="edit-notes"
                          value={editForm.notes}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              notes: e.target.value,
                            }))
                          }
                          rows={3}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setEditOpen(false)}
                        >
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
                <span
                  className={`text-sm font-semibold px-2 py-0.5 rounded-full ${
                    ui.statusBadgeClassByStatus[item.status] ?? ''
                  }`}
                >
                  {ui.statusLabelByStatus[item.status] ?? item.status}
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

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm text-muted-foreground">Prioridade:</span>
              <Select
                value={item.priority}
                onValueChange={handlePriorityChange}
              >
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

          {item.price && (
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight text-primary">
                  {formatPrice(item.price, item.currency)}
                </span>
                <span className="text-xs font-medium uppercase text-muted-foreground">
                  à vista
                </span>
              </div>

              {item.installmentCount && item.installmentValue && (
                <div className="space-y-1 border-l-2 border-primary/20 pl-3">
                  <p className="text-sm font-medium text-foreground">
                    ou {item.installmentCount}x de{' '}
                    <span className="font-bold">
                      {formatPrice(item.installmentValue, item.currency)}
                    </span>
                  </p>

                  <div className="text-xs text-muted-foreground">
                    <p>
                      Total a prazo:{' '}
                      {formatPrice(
                        item.installmentCount * item.installmentValue,
                        item.currency,
                      )}
                    </p>
                    {item.installmentCount * item.installmentValue >
                      item.price && (
                      <p className="text-destructive/80">
                        (+{' '}
                        {formatPrice(
                          item.installmentCount * item.installmentValue -
                            item.price,
                          item.currency,
                        )}{' '}
                        de juros)
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {item.imageUrl && (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full max-h-80 object-cover rounded-lg"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
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
            <p className="text-sm text-muted-foreground border-l-2 pl-3 italic">
              {item.notes}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Status de Compra</CardTitle>
        </CardHeader>
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
                  {formatDate(bestEntry.date)}
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
                    <Label>Preço à vista *</Label>
                    <MoneyInput
                      defaultValue={priceForm.cashPrice}
                      onChange={(v) =>
                        setPriceForm((f) => ({ ...f, cashPrice: v }))
                      }
                      placeholder="0,00"
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <Label
                        htmlFor="same-installment"
                        className="cursor-pointer"
                      >
                        Mesmo valor parcelado
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Desative para informar parcelamento diferente
                      </p>
                    </div>
                    <Switch
                      id="same-installment"
                      checked={sameInstallment}
                      onCheckedChange={setSameInstallment}
                    />
                  </div>

                  {!sameInstallment && (
                    <div className="space-y-3 rounded-lg bg-muted/40 p-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Nº de parcelas *</Label>
                          <Input
                            type="number"
                            min={2}
                            value={priceForm.installmentCount}
                            onChange={(e) =>
                              setPriceForm((f) => ({
                                ...f,
                                installmentCount: Number(e.target.value),
                              }))
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Valor da parcela *</Label>
                          <MoneyInput
                            defaultValue={priceForm.installmentValue}
                            onChange={(v) =>
                              setPriceForm((f) => ({
                                ...f,
                                installmentValue: v,
                              }))
                            }
                            placeholder="0,00"
                          />
                        </div>
                      </div>
                      {priceForm.installmentCount >= 2 &&
                        priceForm.installmentValue > 0 &&
                        (() => {
                          const total =
                            priceForm.installmentCount *
                            priceForm.installmentValue
                          const diff = total - priceForm.cashPrice
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
                    <Label>Moeda</Label>
                    <Select
                      value={priceForm.currency}
                      onValueChange={(v) =>
                        setPriceForm((f) => ({ ...f, currency: v }))
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
                  <div className="space-y-2">
                    <Label>Loja *</Label>
                    <Input
                      value={priceForm.store}
                      onChange={(e) =>
                        setPriceForm((f) => ({ ...f, store: e.target.value }))
                      }
                      placeholder="Ex: Amazon, Mercado Livre..."
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>URL da Loja</Label>
                    <Input
                      type="url"
                      value={priceForm.storeUrl}
                      onChange={(e) =>
                        setPriceForm((f) => ({
                          ...f,
                          storeUrl: e.target.value,
                        }))
                      }
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Data *</Label>
                    <Input
                      type="date"
                      value={priceForm.date}
                      onChange={(e) =>
                        setPriceForm((f) => ({ ...f, date: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Notas</Label>
                    <Textarea
                      value={priceForm.notes}
                      onChange={(e) =>
                        setPriceForm((f) => ({ ...f, notes: e.target.value }))
                      }
                      placeholder="Observações..."
                      rows={2}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setAddPriceOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={savingPrice || priceForm.cashPrice === 0}
                    >
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
              Nenhum preço registrado. Clique em Adicionar preço para começar o
              tracking!
            </p>
          ) : (
            <ChartContainer
              config={charts.price.config}
              className="w-full h-[280px]"
            >
              <LineChart
                data={charts.price.data}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: string) =>
                    new Date(v + 'T00:00:00').toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                    })
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
                        new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(Number(value))
                      }
                      labelFormatter={(label) =>
                        new Date(
                          String(label) + 'T00:00:00',
                        ).toLocaleDateString('pt-BR')
                      }
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent />} />
                {charts.price.series.map((s) => (
                  <Line
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    stroke={s.color}
                    strokeWidth={2}
                    dot={{ r: 4, fill: s.color }}
                    activeDot={{ r: 6 }}
                    connectNulls={true}
                  />
                ))}
              </LineChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

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
                    <th className="text-right py-2 pr-4">À vista</th>
                    <th className="text-left py-2 pr-4">Parcelado</th>
                    <th className="text-left py-2 pr-4">Notas</th>
                    <th className="py-2" />
                  </tr>
                </thead>
                <tbody>
                  {priceEntries.map((entry) => {
                    const cashPrice = entry.cashPrice ?? entry.price
                    const hasInstallment =
                      entry.installmentCount && entry.installmentValue
                    const installmentTotal = hasInstallment
                      ? entry.installmentCount! * entry.installmentValue!
                      : null
                    return (
                      <tr
                        key={entry.id}
                        className="border-b last:border-0 hover:bg-muted/30"
                      >
                        <td className="py-2 pr-4 whitespace-nowrap">
                          {formatDate(entry.date)}
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
                          {formatPrice(Number(cashPrice), entry.currency)}
                        </td>
                        <td className="py-2 pr-4 whitespace-nowrap">
                          {hasInstallment ? (
                            <span className="text-sm">
                              <span className="font-medium">
                                {entry.installmentCount}x
                              </span>
                              {' de '}
                              <span className="font-medium">
                                {formatPrice(
                                  Number(entry.installmentValue),
                                  entry.currency,
                                )}
                              </span>
                              {installmentTotal &&
                                Number(installmentTotal) >
                                  Number(cashPrice) && (
                                  <span className="text-orange-500 text-xs ml-1">
                                    (+
                                    {formatPrice(
                                      Number(installmentTotal) -
                                        Number(cashPrice),
                                      entry.currency,
                                    )}
                                    )
                                  </span>
                                )}
                            </span>
                          ) : (
                            '—'
                          )}
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
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

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
                <DialogHeader>
                  <DialogTitle>Registrar Prioridade</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddPriority} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Prioridade *</Label>
                    <Select
                      value={priorityForm.priority}
                      onValueChange={(v) =>
                        setPriorityForm((f) => ({
                          ...f,
                          priority: v as 'LOW' | 'MEDIUM' | 'HIGH',
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">
                          <span className="text-green-500 font-semibold">
                            Baixa
                          </span>
                        </SelectItem>
                        <SelectItem value="MEDIUM">
                          <span className="text-yellow-500 font-semibold">
                            Média
                          </span>
                        </SelectItem>
                        <SelectItem value="HIGH">
                          <span className="text-red-500 font-semibold">
                            Alta
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Data *</Label>
                    <Input
                      type="date"
                      value={priorityForm.date}
                      onChange={(e) =>
                        setPriorityForm((f) => ({ ...f, date: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Notas</Label>
                    <Textarea
                      value={priorityForm.notes}
                      onChange={(e) =>
                        setPriorityForm((f) => ({
                          ...f,
                          notes: e.target.value,
                        }))
                      }
                      placeholder="Ex: mudei de ideia por causa do preço..."
                      rows={2}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setAddPriorityOpen(false)}
                    >
                      Cancelar
                    </Button>
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
              Nenhum registro de prioridade. Clique em Registrar prioridade para
              começar!
            </p>
          ) : (
            <>
              <ChartContainer
                config={charts.priority.config}
                className="w-full h-[220px]"
              >
                <LineChart
                  data={charts.priority.data}
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: string) =>
                      new Date(v + 'T00:00:00').toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                      })
                    }
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    domain={[0.5, 3.5]}
                    ticks={[1, 2, 3]}
                    tickFormatter={(v: number) =>
                      ui.priorityLabelByNumeric[v] ?? ''
                    }
                    tick={{ fontSize: 12 }}
                    width={50}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) =>
                          ui.priorityLabelByNumeric[Number(value)] ??
                          String(value)
                        }
                        labelFormatter={(label) =>
                          new Date(
                            String(label) + 'T00:00:00',
                          ).toLocaleDateString('pt-BR')
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
                      const p = props as {
                        cx?: number
                        cy?: number
                        payload?: unknown
                      }
                      const payloadObj =
                        p.payload && typeof p.payload === 'object'
                          ? (p.payload as Record<string, unknown>)
                          : null
                      const payloadLabel = payloadObj?.label
                      const label =
                        typeof payloadLabel === 'string'
                          ? payloadLabel
                          : undefined
                      const color =
                        (label && ui.priorityColorByPriority[label]) ??
                        '#6366f1'
                      const cx = typeof p.cx === 'number' ? p.cx : 0
                      const cy = typeof p.cy === 'number' ? p.cy : 0
                      return (
                        <circle
                          key={`dot-${cx}-${cy}`}
                          cx={cx}
                          cy={cy}
                          r={5}
                          fill={color}
                          stroke="white"
                          strokeWidth={2}
                        />
                      )
                    }}
                  />
                </LineChart>
              </ChartContainer>

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
                      <tr
                        key={entry.id}
                        className="border-b last:border-0 hover:bg-muted/30"
                      >
                        <td className="py-2 pr-4 whitespace-nowrap">
                          {formatDate(entry.date)}
                        </td>
                        <td className="py-2 pr-4">
                          <span
                            style={{
                              color: ui.priorityColorByPriority[entry.priority],
                            }}
                            className="font-semibold"
                          >
                            {ui.priorityLabelByPriority[entry.priority] ??
                              entry.priority}
                          </span>
                        </td>
                        <td className="py-2 pr-4 text-muted-foreground max-w-[200px] truncate">
                          {entry.notes ?? '—'}
                        </td>
                        <td className="py-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemovePriority(entry.id)}
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
            </>
          )}
        </CardContent>
      </Card>

      <PurchaseTransactionModal
        open={!!purchaseItem}
        onOpenChange={(open) => {
          if (!open) setPurchaseItem(null)
        }}
        item={purchaseItem}
        onSuccess={() => {
          setPurchaseItem(null)
          loadData()
        }}
      />
    </div>
  )
}
