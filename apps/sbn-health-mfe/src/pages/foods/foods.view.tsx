import {
  Badge,
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
} from '@repo/ui'
import type { FoodsModelOutput } from './foods.model'
import {
  Plus,
  RefreshCcw,
  Search,
  Package,
  Flame,
  SearchX,
  Apple,
} from 'lucide-react'

export function FoodsView({
  data: { foods },
  state: { loading, search, isCreateOpen, saving, form },
  setters: { setSearch, setIsCreateOpen },
  actions: { reload, openCreate, submitCreateFood },
}: FoodsModelOutput) {
  const { errors } = form.formState

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Alimentos
          </h2>
          <p className="text-muted-foreground mt-1">
            Banco de alimentos e ingredientes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => reload()}
            disabled={loading}
            className="h-10 w-10 shrink-0"
            title="Atualizar dados"
          >
            <RefreshCcw
              className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
            />
          </Button>
          <Button
            onClick={openCreate}
            className="gap-2 h-10"
            disabled={loading}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Novo Alimento</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        </div>
      </header>

      {/* Barra de Busca */}
      <div className="relative w-full sm:max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar alimento por nome ou marca..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-11 bg-background"
        />
      </div>

      {/* Lista de Resultados */}
      <Card variant="glass" className="overflow-hidden">
        <CardHeader className="bg-muted/20 border-b pb-4">
          <CardTitle className="text-base flex items-center justify-between">
            <span>Resultados</span>
            <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {loading ? '—' : `${foods.length} itens`}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="divide-y p-4 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center pt-2">
                  <div className="space-y-2 w-1/2">
                    <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                    <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                  </div>
                  <div className="h-6 w-16 bg-muted animate-pulse rounded-md" />
                </div>
              ))}
            </div>
          ) : foods.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-3">
              {search ? (
                <>
                  <SearchX className="h-10 w-10 opacity-20" />
                  <p className="text-sm">Nenhum resultado para "{search}"</p>
                </>
              ) : (
                <>
                  <Apple className="h-10 w-10 opacity-20" />
                  <p className="text-sm">Seu banco de alimentos está vazio.</p>
                </>
              )}
            </div>
          ) : (
            <div className="divide-y">
              {foods.map((f) => (
                <div
                  key={f.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-foreground">
                      {f.name}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      {f.brand && (
                        <span className="flex items-center gap-1 bg-muted/50 px-1.5 py-0.5 rounded">
                          <Package className="h-3 w-3" />
                          {f.brand}
                        </span>
                      )}
                      <span>
                        Porção: {f.servingSizeValue} {f.servingSizeUnit}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 shrink-0 sm:justify-end">
                    {/* Calorias (Destaque Principal) */}
                    <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-md text-sm font-bold w-fit">
                      <Flame className="h-4 w-4" />
                      {f.caloriesPerServing} kcal
                    </div>

                    {/* Macros (Tags Secundárias) */}
                    {(f.proteinPerServing != null ||
                      f.carbsPerServing != null ||
                      f.fatPerServing != null) && (
                      <div className="flex items-center gap-1.5">
                        {f.proteinPerServing != null && (
                          <div
                            className="flex items-baseline gap-0.5 px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                            title="Proteínas"
                          >
                            <span className="text-xs font-semibold tabular-nums">
                              {f.proteinPerServing}g
                            </span>
                            <span className="text-[10px] uppercase font-bold opacity-70">
                              P
                            </span>
                          </div>
                        )}

                        {f.carbsPerServing != null && (
                          <div
                            className="flex items-baseline gap-0.5 px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            title="Carboidratos"
                          >
                            <span className="text-xs font-semibold tabular-nums">
                              {f.carbsPerServing}g
                            </span>
                            <span className="text-[10px] uppercase font-bold opacity-70">
                              C
                            </span>
                          </div>
                        )}

                        {f.fatPerServing != null && (
                          <div
                            className="flex items-baseline gap-0.5 px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                            title="Gorduras"
                          >
                            <span className="text-xs font-semibold tabular-nums">
                              {f.fatPerServing}g
                            </span>
                            <span className="text-[10px] uppercase font-bold opacity-70">
                              G
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Criação */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Alimento</DialogTitle>
            <DialogDescription>
              Cadastre as informações nutricionais para usar em suas refeições.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submitCreateFood} className="space-y-6 mt-2">
            {/* Bloco 1: Informações Básicas */}
            <div className="space-y-4 bg-muted/20 p-4 rounded-lg border border-border/50">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Informações Básicas
              </h4>
              <div className="space-y-2">
                <Label htmlFor="food-name">Nome do Alimento *</Label>
                <Input
                  id="food-name"
                  {...form.register('name')}
                  placeholder="Ex: Peito de Frango Grelhado"
                  disabled={saving}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <span className="text-xs text-destructive">
                    {errors.name.message as string}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="food-brand">Marca (Opcional)</Label>
                <Input
                  id="food-brand"
                  {...form.register('brand')}
                  placeholder="Ex: Seara, Nestlé..."
                  disabled={saving}
                />
              </div>
            </div>

            {/* Bloco 2: Porção e Calorias */}
            <div className="space-y-4 bg-muted/20 p-4 rounded-lg border border-border/50">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Referência da Porção
              </h4>
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="food-serving">Quantidade *</Label>
                  <Input
                    id="food-serving"
                    {...form.register('servingSizeValue')}
                    inputMode="decimal"
                    placeholder="100"
                    disabled={saving}
                    className={
                      errors.servingSizeValue ? 'border-destructive' : ''
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="food-unit">Unidade *</Label>
                  <Input
                    id="food-unit"
                    {...form.register('servingSizeUnit')}
                    placeholder="g, ml, un"
                    disabled={saving}
                    className={
                      errors.servingSizeUnit ? 'border-destructive' : ''
                    }
                  />
                </div>

                <div className="space-y-2 sm:col-span-1 col-span-2">
                  <Label
                    htmlFor="food-calories"
                    className="text-primary font-medium"
                  >
                    Calorias (kcal) *
                  </Label>
                  <Input
                    id="food-calories"
                    {...form.register('caloriesPerServing')}
                    inputMode="decimal"
                    placeholder="0"
                    disabled={saving}
                    className={
                      errors.caloriesPerServing
                        ? 'border-destructive'
                        : 'border-primary/30'
                    }
                  />
                </div>
              </div>
            </div>

            {/* Bloco 3: Macronutrientes */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
                Macronutrientes (Opcional)
              </h4>
              <div className="grid gap-4 grid-cols-3">
                <div className="space-y-2">
                  <Label
                    htmlFor="food-protein"
                    className="text-muted-foreground"
                  >
                    Proteína (g)
                  </Label>
                  <Input
                    id="food-protein"
                    {...form.register('proteinPerServing')}
                    inputMode="decimal"
                    placeholder="0"
                    disabled={saving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="food-carbs" className="text-muted-foreground">
                    Carbo (g)
                  </Label>
                  <Input
                    id="food-carbs"
                    {...form.register('carbsPerServing')}
                    inputMode="decimal"
                    placeholder="0"
                    disabled={saving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="food-fat" className="text-muted-foreground">
                    Gordura (g)
                  </Label>
                  <Input
                    id="food-fat"
                    {...form.register('fatPerServing')}
                    inputMode="decimal"
                    placeholder="0"
                    disabled={saving}
                  />
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button
                variant="ghost"
                type="button"
                onClick={() => setIsCreateOpen(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving} className="min-w-[120px]">
                {saving ? 'Salvando...' : 'Salvar Alimento'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
