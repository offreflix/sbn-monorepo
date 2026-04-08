import { Button, Card, CardContent, CardHeader, CardTitle } from "@repo/ui";
import {
  RefreshCcw,
  Flame,
  Dumbbell,
  Wheat,
  Droplets,
} from "lucide-react";
import { formatNumber } from "../../lib/utils";
import type { SummaryModelOutput } from "./summary.model";

const SimpleProgress = ({
  value,
  colorClass,
}: {
  value: number;
  colorClass: string;
}) => (
  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
    <div
      className={`h-full ${colorClass} transition-all duration-500`}
      style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
    />
  </div>
);

export function SummaryView({
  data: { summary },
  state: { loading },
  actions: { reload },
}: SummaryModelOutput) {
  const Val = ({ children }: { children: React.ReactNode }) => {
    if (loading) return <div className="h-6 w-24 bg-muted animate-pulse rounded" />;
    return <>{children}</>;
  };

  const goal = summary?.goal ?? null;
  const consumed = summary?.consumed ?? null;
  const water = summary?.water ?? null;

  const caloriesPct = goal && consumed
    ? (consumed.calories / goal.dailyCalorieGoal) * 100
    : 0;
  const proteinPct = goal && consumed
    ? (consumed.protein / goal.proteinGoalG) * 100
    : 0;
  const carbsPct = goal && consumed
    ? (consumed.carbs / goal.carbsGoalG) * 100
    : 0;
  const fatPct = goal && consumed
    ? (consumed.fat / goal.fatGoalG) * 100
    : 0;
  const waterPct = water?.goalMl
    ? (water.totalMl / water.goalMl) * 100
    : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Resumo</h2>
        <p className="text-muted-foreground">
          Consumo, água e refeições do dia selecionado
        </p>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="glass">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400">
                <Flame className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-muted-foreground">Calorias</p>
                <div className="text-2xl font-bold">
                  <Val>{formatNumber(consumed?.calories ?? 0)} kcal</Val>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  <Val>Meta: {goal ? `${formatNumber(goal.dailyCalorieGoal)} kcal` : "—"}</Val>
                </div>
              </div>
            </div>
            <div className="mt-3">
              <SimpleProgress value={caloriesPct} colorClass="bg-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                <Dumbbell className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-muted-foreground">Proteína</p>
                <div className="text-2xl font-bold">
                  <Val>{formatNumber(Math.round(consumed?.protein ?? 0))} g</Val>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  <Val>Meta: {goal ? `${goal.proteinGoalG} g` : "—"}</Val>
                </div>
              </div>
            </div>
            <div className="mt-3">
              <SimpleProgress value={proteinPct} colorClass="bg-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-400">
                <Wheat className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-muted-foreground">Carbs / Gordura</p>
                <div className="text-lg font-bold">
                  <Val>
                    {formatNumber(Math.round(consumed?.carbs ?? 0))}g /&nbsp;
                    {formatNumber(Math.round(consumed?.fat ?? 0))}g
                  </Val>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  <Val>
                    Meta: {goal ? `${goal.carbsGoalG}g / ${goal.fatGoalG}g` : "—"}
                  </Val>
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <SimpleProgress value={carbsPct} colorClass="bg-yellow-400" />
              <SimpleProgress value={fatPct} colorClass="bg-amber-400" />
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Droplets className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-muted-foreground">Água</p>
                <div className="text-2xl font-bold">
                  <Val>{formatNumber(water?.totalMl ?? 0)} ml</Val>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  <Val>
                    Meta: {water?.goalMl ? `${formatNumber(water.goalMl)} ml` : "—"}
                  </Val>
                </div>
              </div>
            </div>
            <div className="mt-3">
              <SimpleProgress value={waterPct} colorClass="bg-cyan-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Refresh button */}
      <div className="flex justify-end -mt-4">
        <Button variant="ghost" size="icon" onClick={() => reload()} className="h-9 w-9">
          <RefreshCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Refeições */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold">Refeições do dia</h3>
        <div className="grid gap-4 lg:grid-cols-2">
          {(["breakfast", "lunch", "dinner", "snack"] as const).map((k) => {
            const items = summary?.meals?.[k] ?? [];
            const label =
              k === "breakfast"
                ? "Café da manhã"
                : k === "lunch"
                  ? "Almoço"
                  : k === "dinner"
                    ? "Jantar"
                    : "Lanche";
            return (
              <Card key={k} variant="glass">
                <CardHeader>
                  <CardTitle className="text-base font-medium flex items-center justify-between">
                    <span>{label}</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      {loading ? "—" : `${items.length} itens`}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {loading ? (
                    <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
                  ) : items.length === 0 ? (
                    <div className="text-sm text-muted-foreground">Sem registros</div>
                  ) : (
                    items.slice(0, 5).map((it) => (
                      <div
                        key={it.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="min-w-0">
                          <div className="truncate">{it.food?.name ?? "Alimento"}</div>
                          <div className="text-xs text-muted-foreground">
                            {it.amountConsumed} {it.unitConsumed}
                          </div>
                        </div>
                        <div className="tabular-nums text-muted-foreground shrink-0 ml-2">
                          {it.calcCalories} kcal
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
