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
} from "@repo/ui";
import type { MealLogsModelOutput } from "./meal-logs.model";
import {
  Plus,
  RefreshCcw,
  Trash2,
  Coffee,
  Sun,
  Moon,
  Apple,
  Utensils,
  Search,
} from "lucide-react";
import { Controller } from "react-hook-form";
import { MacronutrientsBadge } from "../../components/macro-badge";

// Utilitário para mapear ícones por tipo de refeição
const getMealIcon = (key: string) => {
  switch (key) {
    case "breakfast":
      return <Coffee className="h-4 w-4 text-orange-500" />;
    case "lunch":
      return <Sun className="h-4 w-4 text-yellow-500" />;
    case "dinner":
      return <Moon className="h-4 w-4 text-indigo-500" />;
    case "snack":
      return <Apple className="h-4 w-4 text-green-500" />;
    default:
      return <Utensils className="h-4 w-4 text-muted-foreground" />;
  }
};

export function MealLogsView({
  data: { logs, foods, selectedFood, servingPreview, groupedTotal, groups },
  state: { loading, isCreateOpen, foodSearch, saving, deletingId, form },
  setters: { setIsCreateOpen, setFoodSearch },
  actions: { reload, openCreate, submitCreateMealLog, deleteMealLog },
}: MealLogsModelOutput) {
  const { errors } = form.formState;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Refeições
          </h2>
          <p className="text-muted-foreground mt-1">
            Gerencie seus registros diários
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
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
          </Button>
          <Button
            onClick={openCreate}
            className="gap-2 h-10"
            disabled={loading}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Adicionar Refeição</span>
            <span className="sm:hidden">Adicionar</span>
          </Button>
        </div>
      </header>

      {/* Resumo Total do Dia */}
      <Card variant="glass" className="bg-primary/5 border-primary/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Total Consumido
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="space-y-2">
              <div className="h-8 w-48 bg-muted animate-pulse rounded" />
              <div className="h-4 w-64 bg-muted animate-pulse rounded" />
            </div>
          ) : (
            <>
              <div className="flex items-end justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold tabular-nums text-foreground">
                    {groupedTotal.calories}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    kcal
                  </span>
                </div>
                <div className="text-sm font-medium text-muted-foreground bg-background px-3 py-1 rounded-full shadow-sm">
                  {groupedTotal.count}{" "}
                  {groupedTotal.count === 1 ? "item" : "itens"}
                </div>
              </div>

              <div className="flex gap-1.5 text-sm">
                <MacronutrientsBadge
                  variant="protein"
                  value={groupedTotal.protein}
                />
                <MacronutrientsBadge
                  variant="carbs"
                  value={groupedTotal.carbs}
                />
                <MacronutrientsBadge variant="fat" value={groupedTotal.fat} />
              </div>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-muted-foreground">
                    Proteína:{" "}
                    <span className="tabular-nums font-medium text-foreground">
                      {groupedTotal.protein}g
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-muted-foreground">
                    Carbs:{" "}
                    <span className="tabular-nums font-medium text-foreground">
                      {groupedTotal.carbs}g
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-rose-500" />
                  <span className="text-muted-foreground">
                    Gordura:{" "}
                    <span className="tabular-nums font-medium text-foreground">
                      {groupedTotal.fat}g
                    </span>
                  </span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Listagem por Grupos */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold">Suas Refeições</h3>
        <div className="grid gap-6 lg:grid-cols-2">
          {groups.map(([key, label]) => {
            const items = logs[key] ?? [];
            const groupCalories = items.reduce(
              (acc, it) => acc + (it.calcCalories || 0),
              0,
            );
            const groupProtein =
              Math.round(
                items.reduce(
                  (acc, it) => acc + Number(it.calcProtein || 0),
                  0,
                ) * 10,
              ) / 10;
            const groupCarbs =
              Math.round(
                items.reduce((acc, it) => acc + Number(it.calcCarbs || 0), 0) *
                  10,
              ) / 10;
            const groupFat =
              Math.round(
                items.reduce((acc, it) => acc + Number(it.calcFat || 0), 0) *
                  10,
              ) / 10;

            return (
              <Card key={key} variant="glass" className="flex flex-col">
                <CardHeader className="pb-3 border-b bg-muted/20">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    {getMealIcon(key)}
                    <span>{label}</span>
                    <span className="ml-auto text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {loading
                        ? "—"
                        : `${items.length} ${items.length === 1 ? "item" : "itens"}`}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 flex-1 space-y-4">
                  {loading ? (
                    <div className="space-y-3">
                      <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
                      <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
                    </div>
                  ) : items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-6 text-center space-y-2 text-muted-foreground">
                      <Utensils className="h-8 w-8 opacity-20" />
                      <span className="text-sm">
                        Nenhum alimento registrado
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        {items.map((it) => (
                          <div
                            key={it.id}
                            className="group flex items-center justify-between gap-4 rounded-lg border p-3 hover:border-primary/30 hover:bg-muted/30 transition-colors"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium text-sm text-foreground">
                                {it.food?.name ?? "Alimento não encontrado"}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {it.amountConsumed} {it.unitConsumed}
                              </p>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <span className="tabular-nums font-medium text-sm text-foreground">
                                {it.calcCalories} kcal
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all focus:opacity-100 sm:opacity-100"
                                onClick={() => deleteMealLog(it.id)}
                                disabled={deletingId === it.id}
                                title="Remover item"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between border-t pt-3">
                        <span className="tabular-nums text-sm font-semibold text-foreground">
                          {groupCalories} kcal
                        </span>
                        <div className="flex gap-3 text-xs">
                          <span className="text-muted-foreground">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500 mr-1 align-middle" />
                            <span className="tabular-nums font-medium text-foreground">
                              {groupProtein}g
                            </span>{" "}
                            prot
                          </span>
                          <span className="text-muted-foreground">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500 mr-1 align-middle" />
                            <span className="tabular-nums font-medium text-foreground">
                              {groupCarbs}g
                            </span>{" "}
                            carbs
                          </span>
                          <span className="text-muted-foreground">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-rose-500 mr-1 align-middle" />
                            <span className="tabular-nums font-medium text-foreground">
                              {groupFat}g
                            </span>{" "}
                            gord
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Modal de Criação */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adicionar alimento</DialogTitle>
            <DialogDescription>
              Busque o alimento, selecione a refeição e defina a porção
              consumida.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submitCreateMealLog} className="space-y-5 mt-2">
            {/* Bloco de Busca e Seleção aglomerados visualmente */}
            <div className="space-y-3 bg-muted/30 p-4 rounded-lg border">
              <div className="space-y-1.5">
                <Label
                  htmlFor="food-search"
                  className="text-xs font-semibold uppercase text-muted-foreground"
                >
                  1. Buscar
                </Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="food-search"
                    className="pl-9"
                    value={foodSearch}
                    onChange={(e) => setFoodSearch(e.target.value)}
                    placeholder="Digite o nome (Ex: Banana)"
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase text-muted-foreground">
                  2. Selecionar Alimento
                </Label>
                <Controller
                  control={form.control}
                  name="foodId"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={saving || foods.length === 0}
                    >
                      <SelectTrigger
                        className={errors.foodId ? "border-destructive" : ""}
                      >
                        <SelectValue
                          placeholder={
                            foods.length === 0
                              ? "Busque primeiro..."
                              : "Selecione o alimento..."
                          }
                        />
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
                {errors.foodId && (
                  <span className="text-xs text-destructive">
                    {errors.foodId.message as string}
                  </span>
                )}

                {/* Metadados do Alimento Selecionado */}
                {selectedFood && (
                  <div className="mt-2 text-xs text-primary/80 bg-primary/10 px-2 py-1.5 rounded-md inline-block">
                    Informação base: 1 porção = {selectedFood.servingSizeValue}{" "}
                    {selectedFood.servingSizeUnit} (
                    {selectedFood.caloriesPerServing} kcal)
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Qual Refeição */}
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
                      <SelectTrigger
                        className={errors.mealType ? "border-destructive" : ""}
                      >
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
                {errors.mealType && (
                  <span className="text-xs text-destructive">
                    {errors.mealType.message as string}
                  </span>
                )}
              </div>

              {/* Quantidade */}
              <div className="space-y-2">
                <Label>Quantidade</Label>
                <div className="flex gap-2">
                  <Input
                    className={`w-20 ${errors.quantity ? "border-destructive" : ""}`}
                    {...form.register("quantity")}
                    inputMode="decimal"
                    placeholder="1"
                    disabled={saving}
                  />
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
                            Porção{" "}
                            {selectedFood
                              ? `(${selectedFood.servingSizeValue}${selectedFood.servingSizeUnit})`
                              : ""}
                          </SelectItem>
                          <SelectItem value="unit">
                            {selectedFood?.servingSizeUnit ?? "Unidade"}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                {errors.quantity && (
                  <span className="text-xs text-destructive">
                    {errors.quantity.message as string}
                  </span>
                )}
              </div>
            </div>

            {/* Preview de Macros Dinâmico */}
            {servingPreview && (
              <div className="rounded-lg bg-accent/50 border px-4 py-3 text-sm space-y-2 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-muted-foreground">
                    Total a registrar ({servingPreview.amount}
                    {servingPreview.unit}):
                  </span>
                  <span className="font-bold tabular-nums text-foreground">
                    {servingPreview.kcal} kcal
                  </span>
                </div>

                {(servingPreview.protein != null ||
                  servingPreview.carbs != null ||
                  servingPreview.fat != null) && (
                  <div className="flex justify-between text-xs font-medium tabular-nums pt-1">
                    {servingPreview.protein != null && (
                      <div className="flex flex-col items-center">
                        <span className="text-muted-foreground">Proteína</span>{" "}
                        <span>{servingPreview.protein}g</span>
                      </div>
                    )}
                    {servingPreview.carbs != null && (
                      <div className="flex flex-col items-center">
                        <span className="text-muted-foreground">Carbo</span>{" "}
                        <span>{servingPreview.carbs}g</span>
                      </div>
                    )}
                    {servingPreview.fat != null && (
                      <div className="flex flex-col items-center">
                        <span className="text-muted-foreground">Gordura</span>{" "}
                        <span>{servingPreview.fat}g</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Ações do Modal */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t mt-6">
              <Button
                variant="ghost"
                type="button"
                onClick={() => setIsCreateOpen(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving} className="min-w-[120px]">
                {saving ? "Salvando..." : "Adicionar Registro"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
