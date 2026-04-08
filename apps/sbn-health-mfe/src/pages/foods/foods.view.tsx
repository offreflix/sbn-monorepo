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
} from "@repo/ui";
import type { FoodsModelOutput } from "./foods.model";
import { Plus, RefreshCcw, Search } from "lucide-react";

export function FoodsView({
  data: { foods },
  state: { loading, search, isCreateOpen, saving, form },
  setters: { setSearch, setIsCreateOpen },
  actions: { reload, openCreate, submitCreateFood },
}: FoodsModelOutput) {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Alimentos</h2>
          <p className="text-muted-foreground">Banco de alimentos visíveis</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={openCreate} className="gap-2" disabled={loading}>
            <Plus className="h-4 w-4" />
            Novo
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

      <div className="flex gap-2">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Card variant="glass">
        <CardHeader>
          <CardTitle>Resultados</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {loading ? (
            <div className="h-6 w-1/3 bg-muted animate-pulse rounded" />
          ) : foods.length === 0 ? (
            <div className="text-sm text-muted-foreground py-2">Sem resultados</div>
          ) : (
            foods.map((f) => (
              <div key={f.id} className="py-2 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="truncate font-medium">{f.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {f.brand || "—"} • {f.caloriesPerServing} kcal por{" "}
                    {f.servingSizeValue} {f.servingSizeUnit}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo alimento</DialogTitle>
            <DialogDescription>
              Crie um alimento para usar nos registros de refeição.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submitCreateFood} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="food-name">Nome</Label>
              <Input
                id="food-name"
                {...form.register("name")}
                placeholder="Ex: Banana"
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="food-brand">Marca (opcional)</Label>
              <Input
                id="food-brand"
                {...form.register("brand")}
                placeholder="Ex: —"
                disabled={saving}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="food-serving">Porção</Label>
                <Input
                  id="food-serving"
                  {...form.register("servingSizeValue")}
                  inputMode="decimal"
                  placeholder="100"
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="food-unit">Unidade</Label>
                <Input
                  id="food-unit"
                  {...form.register("servingSizeUnit")}
                  placeholder="g"
                  disabled={saving}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="food-calories">Calorias (kcal) por porção</Label>
              <Input
                id="food-calories"
                {...form.register("caloriesPerServing")}
                inputMode="decimal"
                placeholder="0"
                disabled={saving}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="food-protein">Proteína (g)</Label>
                <Input
                  id="food-protein"
                  {...form.register("proteinPerServing")}
                  inputMode="decimal"
                  placeholder="0"
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="food-carbs">Carboidratos (g)</Label>
                <Input
                  id="food-carbs"
                  {...form.register("carbsPerServing")}
                  inputMode="decimal"
                  placeholder="0"
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="food-fat">Gordura (g)</Label>
                <Input
                  id="food-fat"
                  {...form.register("fatPerServing")}
                  inputMode="decimal"
                  placeholder="0"
                  disabled={saving}
                />
              </div>
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
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
