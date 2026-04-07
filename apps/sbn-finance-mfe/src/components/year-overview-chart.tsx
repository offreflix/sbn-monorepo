import {
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

export interface YearOverviewPoint {
  name: string;
  income: number;
  expense: number;
}

export function YearOverviewChart({
  data,
  className,
  config = {
    income: { label: "Receitas", color: "#059669" },
    expense: { label: "Despesas", color: "#e11d48" },
  },
}: {
  data: YearOverviewPoint[];
  className?: string;
  config?: ChartConfig;
}) {
  return (
    <ChartContainer
      config={config}
      className={
        className || "w-full h-[280px] rounded-md border bg-card/50 p-2"
      }
    >
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar
          dataKey="income"
          fill={config["income"]?.color || "#059669"}
          radius={4}
        />
        <Bar
          dataKey="expense"
          fill={config["expense"]?.color || "#e11d48"}
          radius={4}
        />
      </BarChart>
    </ChartContainer>
  );
}
