import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui'
import type { MealLogsModelOutput } from './meal-logs.model'
import { Plus, RefreshCcw, Trash2 } from 'lucide-react'
import { Controller } from 'react-hook-form'

export function MealLogsView({
  data: { logs, foods, selectedFood, servingPreview, groupedTotal, groups },
  state: { loading, isCreateOpen, foodSearch, saving, deletingId, form },
  setters: { setIsCreateOpen, setFoodSearch },
  actions: { reload, openCreate, submitCreateMealLog, deleteMealLog },
}: MealLogsModelOutput) {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Refeiçaões</h2>
          <p className="text-muted-foreground">Registros do dia</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={openCreate} className="gap-2" disabled={loading}>
            <Plus className="h-4 w-4" />
            Adicionar
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => reload()}
            className="h-9 w-9"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Total do dia */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle>Total do dia</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {loading ? (
            <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
          ) : (
            <div className="flex items-center justify-between">
              <div className="tabular-nums">{groupedTotal.count} itens</div>
              <div className="tabular-nums font-semibold text-foreground">
                {groupedTotal.calories} kcal
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grupos de refeição */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold">Por refeição</h3>
        <div className="grid gap-4 lg:grid-cols-2">
          {groups.map(([key, label]) => {
            const items = logs[key] ?? []
            return (
              <Card key={key} variant="glass">
                <CardHeader>
                  <CardTitle className="text-base font-medium flex items-center justify-between">
                    <span>{label}</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      {loading ? '—' : `${items.length} itens`}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {loading ? (
                    <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
                  ) : items.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      Sem registros
                    </div>
                  ) : (
                    items.map((it) => (
                      <div
                        key={it.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="min-w-0">
                          <div className="truncate">
                            {it.food?.name ?? 'Alimento'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {it.amountConsumed} {it.unitConsumed}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="tabular-nums text-muted-foreground">
                            {it.calcCalories} kcal
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => deleteMealLog(it.id)}
                            disabled={deletingId === it.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar refeição</DialogTitle>
            <DialogDescription>
              Selecione um alimento e informe a quantidade.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submitCreateMealLog} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="food-search">Buscar alimento</Label>
              <Input
                id="food-search"
                value={foodSearch}
                onChange={(e) => setFoodSearch(e.target.value)}
                placeholder="Ex: banana"
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label>Alimento</Label>
              <Controller
                control={form.control}
                name="foodId"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={saving}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {foods.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {selectedFood && (
                <div className="text-xs text-muted-foreground">
                  1 porção = {selectedFood.servingSizeValue}{' '}
                  {selectedFood.servingSizeUnit} •{' '}
                  {selectedFood.caloriesPerServing} kcal
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Refeição</Label>
              <Controller
                control={form.control}
                name="mealType"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={saving}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakfast">Café da manhã</SelectItem>
                      <SelectItem value="lunch">Almoço</SelectItem>
                      <SelectItem value="dinner">Jantar</SelectItem>
                      <SelectItem value="snack">Lanche</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>Quantidade</Label>
              <div className="flex gap-2">
                <div className="w-28 shrink-0">
                  <Input
                    {...form.register('quantity')}
                    inputMode="decimal"
                    placeholder="1"
                    disabled={saving}
                  />
                </div>
                <Controller
                  control={form.control}
                  name="servingMode"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={saving || !selectedFood}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="serving">
                          porção
                          {selectedFood
                            ? ` (${selectedFood.servingSizeValue}${selectedFood.servingSizeUnit})`
                            : ''}
                        </SelectItem>
                        <SelectItem value="unit">
                          {selectedFood?.servingSizeUnit ?? 'unidade'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {servingPreview && (
                <div className="rounded-md bg-muted/50 px-3 py-2 text-sm space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      = {servingPreview.amount}
                      {servingPreview.unit}
                    </span>
                    <span className="font-semibold tabular-nums">
                      {servingPreview.kcal} kcal
                    </span>
                  </div>
                  {(servingPreview.protein != null ||
                    servingPreview.carbs != null ||
                    servingPreview.fat != null) && (
                    <div className="flex gap-3 text-xs text-muted-foreground tabular-nums">
                      {servingPreview.protein != null && (
                        <span>P {servingPreview.protein}g</span>
                      )}
                      {servingPreview.carbs != null && (
                        <span>C {servingPreview.carbs}g</span>
                      )}
                      {servingPreview.fat != null && (
                        <span>G {servingPreview.fat}g</span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsCreateOpen(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
