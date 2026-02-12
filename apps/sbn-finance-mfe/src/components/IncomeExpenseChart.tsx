import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "@repo/ui";
import type { ChartConfig } from "@repo/ui";
import type { Transaction } from "../types/finance";
import { TrendingUp, TrendingDown } from "lucide-react";

interface IncomeExpenseChartProps {
  transactions: Transaction[];
  year: number;
  month: number;
}

const chartConfig: ChartConfig = {
  receitas: {
    label: "Receitas",
    color: "#059669", // emerald-600
  },
  despesas: {
    label: "Despesas",
    color: "#e11d48", // rose-600
  },
};

export function IncomeExpenseChart({
  transactions,
  year,
  month,
}: IncomeExpenseChartProps) {
  const data = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "Receita")
      .reduce((acc, t) => acc + parseFloat(String(t.amount)), 0);

    const expense = transactions
      .filter((t) => t.type === "Despesa")
      .reduce((acc, t) => acc + parseFloat(String(t.amount)), 0);

    return [
      { type: "receitas", value: income, fill: chartConfig.receitas.color },
      { type: "despesas", value: expense, fill: chartConfig.despesas.color },
    ];
  }, [transactions]);

  const monthName = new Date(year, month - 1).toLocaleString("pt-BR", {
    month: "long",
  });

  // Calculate percentage delta (dummy logic for visual, ideally would compare to last month)
  const incomeVal = data[0].value;
  const expenseVal = data[1].value;
  const savingRate =
    incomeVal > 0 ? ((incomeVal - expenseVal) / incomeVal) * 100 : 0;

  return (
    <Card className="w-full border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0 pb-4 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-semibold">
            Fluxo de Caixa
          </CardTitle>
          <p className="text-sm text-muted-foreground capitalize">
            {monthName} {year}
          </p>
        </div>
        {incomeVal > 0 && (
          <div
            className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full ${savingRate >= 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"}`}
          >
            {savingRate >= 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {Math.abs(savingRate).toFixed(1)}%{" "}
            {savingRate >= 0 ? "economia" : "deficit"}
          </div>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <ChartContainer config={chartConfig} className="h-[240px] w-full">
          <BarChart
            data={data}
            accessibilityLayer
            layout="vertical"
            margin={{
              top: 0,
              right: 20,
              left: 0,
              bottom: 0,
            }}
            barSize={32}
          >
            <CartesianGrid
              horizontal={false}
              strokeDasharray="3 3"
              opacity={0.2}
            />
            <XAxis type="number" hide />
            <YAxis
              dataKey="type"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) =>
                (chartConfig[value as keyof typeof chartConfig]
                  ?.label as string) || value
              }
              className="text-sm font-medium fill-muted-foreground/80"
            />
            <ChartTooltip
              cursor={{ fill: "transparent" }}
              content={
                <ChartTooltipContent
                  indicator="line"
                  nameKey="type"
                  hideLabel
                  formatter={(value) =>
                    new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(Number(value))
                  }
                />
              }
            />
            <Bar
              dataKey="value"
              radius={[0, 6, 6, 0]}
              background={{
                fill: "var(--muted)",
                radius: [0, 6, 6, 0],
                opacity: 0.2,
              }}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
