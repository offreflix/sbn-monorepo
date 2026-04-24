import { Button, Card, CardContent, CardHeader, CardTitle } from "@repo/ui";
import {
  RefreshCcw,
  Flame,
  Dumbbell,
  Wheat,
  Droplets,
  Coffee,
  Sun,
  Moon,
  Apple,
  Utensils,
} from "lucide-react";
import { formatNumber } from "../../lib/utils";
import type { SummaryModelOutput } from "./summary.model";

// Proteção adicionada: garante que o valor não seja NaN caso a meta seja 0
const SimpleProgress = ({
  value,
  colorClass,
}: {
  value: number;
  colorClass: string;
}) => {
  const safeValue = isNaN(value) ? 0 : Math.min(Math.max(value, 0), 100);
  return (
    <div className="h-2 w-full bg-secondary/60 rounded-full overflow-hidden">
      <div
        className={`h-full ${colorClass} transition-all duration-500`}
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
};

// Utilitários para os ícones e rótulos das refeições
const mealConfig = {
  breakfast: {
    label: "Café da manhã",
    icon: <Coffee className="h-4 w-4 text-orange-500" />,
  },
  lunch: { label: "Almoço", icon: <Sun className="h-4 w-4 text-yellow-500" /> },
  dinner: {
    label: "Jantar",
    icon: <Moon className="h-4 w-4 text-indigo-500" />,
  },
  snack: {
    label: "Lanche",
    icon: <Apple className="h-4 w-4 text-green-500" />,
  },
} as const;

export function SummaryView({
  data: { summary },
  state: { loading },
  actions: { reload },
}: SummaryModelOutput) {
  const goal = summary?.goal ?? null;
  const consumed = summary?.consumed ?? null;
  const water = summary?.water ?? null;

  // Cálculos de porcentagem
  const caloriesPct =
    goal && consumed ? (consumed.calories / goal.dailyCalorieGoal) * 100 : 0;
  const proteinPct =
    goal && consumed ? (consumed.protein / goal.proteinGoalG) * 100 : 0;
  const carbsPct =
    goal && consumed ? (consumed.carbs / goal.carbsGoalG) * 100 : 0;
  const fatPct = goal && consumed ? (consumed.fat / goal.fatGoalG) * 100 : 0;
  const waterPct = water?.goalMl ? (water.totalMl / water.goalMl) * 100 : 0;

  // Componente auxiliar para os Skeletons de texto
  const renderValue = (val: React.ReactNode, skeletonWidth = "w-24") => {
    if (loading)
      return (
        <div
          className={`h-6 ${skeletonWidth} bg-muted animate-pulse rounded`}
        />
      );
    return val;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header com o Botão de Refresh Integrado */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Resumo
          </h2>
          <p className="text-muted-foreground mt-1">
            Consumo, água e refeições do dia
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => reload()}
          disabled={loading}
          className="h-10 w-10 shrink-0"
          title="Atualizar dados"
        >
          <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </header>

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Calorias */}
        <Card variant="glass" className="border-orange-500/10">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                <Flame className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">
                  Calorias
                </p>
                <div className="text-2xl font-bold text-foreground">
                  {renderValue(
                    `${formatNumber(consumed?.calories ?? 0)} kcal`,
                    "w-28",
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {renderValue(
                    `Meta: ${goal ? formatNumber(goal.dailyCalorieGoal) : "—"} kcal`,
                    "w-24",
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <SimpleProgress value={caloriesPct} colorClass="bg-orange-500" />
            </div>
          </CardContent>
        </Card>

        {/* Proteínas */}
        <Card variant="glass" className="border-blue-500/10">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                <Dumbbell className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">
                  Proteína
                </p>
                <div className="text-2xl font-bold text-foreground">
                  {renderValue(
                    `${formatNumber(Math.round(consumed?.protein ?? 0))} g`,
                    "w-20",
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {renderValue(
                    `Meta: ${goal ? goal.proteinGoalG : "—"} g`,
                    "w-16",
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <SimpleProgress value={proteinPct} colorClass="bg-blue-500" />
            </div>
          </CardContent>
        </Card>

        {/* Carbs e Gorduras */}
        <Card variant="glass" className="border-amber-500/10">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                <Wheat className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">
                  Carbs / Gordura
                </p>
                <div className="text-lg font-bold text-foreground leading-tight">
                  {renderValue(
                    `${formatNumber(Math.round(consumed?.carbs ?? 0))}g / ${formatNumber(Math.round(consumed?.fat ?? 0))}g`,
                    "w-24",
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {renderValue(
                    `Meta: ${goal ? `${goal.carbsGoalG}g / ${goal.fatGoalG}g` : "—"}`,
                    "w-28",
                  )}
                </div>
              </div>
            </div>
            {/* Barras separadas com pequenos labels para não confundir o usuário */}
            <div className="mt-3.5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-muted-foreground w-3 text-center">
                  C
                </span>
                <SimpleProgress value={carbsPct} colorClass="bg-yellow-400" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-muted-foreground w-3 text-center">
                  G
                </span>
                <SimpleProgress value={fatPct} colorClass="bg-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Água */}
        <Card variant="glass" className="border-cyan-500/10">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 shrink-0">
                <Droplets className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">
                  Água
                </p>
                <div className="text-2xl font-bold text-foreground">
                  {renderValue(
                    `${formatNumber(water?.totalMl ?? 0)} ml`,
                    "w-24",
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {renderValue(
                    `Meta: ${water?.goalMl ? formatNumber(water.goalMl) : "—"} ml`,
                    "w-20",
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <SimpleProgress value={waterPct} colorClass="bg-cyan-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Refeições Recentes */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold">Refeições do dia</h3>
        <div className="grid gap-6 lg:grid-cols-2">
          {(["breakfast", "lunch", "dinner", "snack"] as const).map((key) => {
            const items = summary?.meals?.[key] ?? [];
            const { label, icon } = mealConfig[key];

            return (
              <Card key={key} variant="glass" className="flex flex-col">
                <CardHeader className="pb-3 border-b bg-muted/20">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    {icon}
                    <span>{label}</span>
                    <span className="ml-auto text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {loading
                        ? "—"
                        : `${items.length} ${items.length === 1 ? "item" : "itens"}`}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 flex-1">
                  {loading ? (
                    <div className="space-y-3">
                      <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
                      <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
                    </div>
                  ) : items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-4 text-center space-y-2 text-muted-foreground">
                      <Utensils className="h-6 w-6 opacity-20" />
                      <span className="text-sm">Sem registros</span>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {items.slice(0, 5).map((it) => (
                        <div
                          key={it.id}
                          className="flex items-center justify-between p-2.5 rounded-md border bg-card/50 hover:bg-muted/30 transition-colors"
                        >
                          <div className="min-w-0 flex-1 pr-3">
                            <p className="truncate text-sm font-medium text-foreground">
                              {it.food?.name ?? "Alimento"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {it.amountConsumed} {it.unitConsumed}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-2 py-1 rounded text-xs font-semibold shrink-0">
                            <Flame className="h-3 w-3" />
                            {it.calcCalories} kcal
                          </div>
                        </div>
                      ))}
                      {items.length > 5 && (
                        <p className="text-xs text-center text-muted-foreground pt-2">
                          + {items.length - 5} itens não exibidos
                        </p>
                      )}
                    </div>
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
