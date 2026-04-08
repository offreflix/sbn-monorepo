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
import type { GoalsModelOutput } from "./goals.model";
import { Plus, RefreshCcw } from "lucide-react";

export function GoalsView({
  data: { current, history },
  state: { loading, isCreateOpen, saving, form },
  setters: { setIsCreateOpen },
  actions: { reload, openCreate, submitCreateGoal },
}: GoalsModelOutput) {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Metas</h2>
          <p className="text-muted-foreground">Meta ativa e histórico</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={openCreate} className="gap-2" disabled={loading}>
            <Plus className="h-4 w-4" />
            Nova meta
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

      <Card variant="glass">
        <CardHeader>
          <CardTitle>Meta atual</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
          ) : !current ? (
            <div className="text-sm text-muted-foreground">Nenhuma meta ativa</div>
          ) : (
            <div className="space-y-1">
              <div className="text-2xl font-bold tabular-nums">
                {current.dailyCalorieGoal} kcal
              </div>
              <div className="text-sm text-muted-foreground">
                Proteína: {current.proteinGoalG}g · Carbs: {current.carbsGoalG}g · Gordura:{" "}
                {current.fatGoalG}g
              </div>
              <div className="text-sm text-muted-foreground">
                Água: {current.waterGoalMl} ml
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card variant="glass">
        <CardHeader>
          <CardTitle>Histórico</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
          ) : history.length === 0 ? (
            <div className="text-sm text-muted-foreground">Sem histórico</div>
          ) : (
            history.map((g) => (
              <div
                key={g.id}
                className="flex items-center justify-between text-sm py-1 border-b border-border last:border-0"
              >
                <div className="text-muted-foreground">{g.activeFrom}</div>
                <div className="text-right">
                  <div className="tabular-nums font-medium">{g.dailyCalorieGoal} kcal</div>
                  <div className="text-xs text-muted-foreground">
                    {g.proteinGoalG}P / {g.carbsGoalG}C / {g.fatGoalG}G · {g.waterGoalMl} ml
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
            <DialogTitle>Nova meta</DialogTitle>
            <DialogDescription>
              Defina suas metas diárias de calorias, macros e hidratação.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submitCreateGoal} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goal-calories">Calorias (kcal/dia)</Label>
              <Input
                id="goal-calories"
                {...form.register("dailyCalorieGoal")}
                inputMode="decimal"
                placeholder="2000"
                disabled={saving}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="goal-protein">Proteína (g)</Label>
                <Input
                  id="goal-protein"
                  {...form.register("proteinGoalG")}
                  inputMode="decimal"
                  placeholder="150"
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal-carbs">Carbs (g)</Label>
                <Input
                  id="goal-carbs"
                  {...form.register("carbsGoalG")}
                  inputMode="decimal"
                  placeholder="250"
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal-fat">Gordura (g)</Label>
                <Input
                  id="goal-fat"
                  {...form.register("fatGoalG")}
                  inputMode="decimal"
                  placeholder="65"
                  disabled={saving}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal-water">Água (ml/dia, opcional)</Label>
              <Input
                id="goal-water"
                {...form.register("waterGoalMl")}
                inputMode="decimal"
                placeholder="2000"
                disabled={saving}
              />
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
