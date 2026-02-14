import { eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, startOfMonth, startOfWeek } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui";
import { formatCurrency } from "../lib/utils";
import type { DashboardYearOverview } from "../types/finance";

export function AnnualCalendar({
  year,
  data,
}: {
  year: number;
  data: DashboardYearOverview;
}) {
  const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 12 }, (_, idx) => {
        const month = idx + 1;
        const monthDate = new Date(year, idx, 1);
        const start = startOfWeek(startOfMonth(monthDate));
        const end = endOfWeek(endOfMonth(monthDate));
        const days = eachDayOfInterval({ start, end });
        const monthAgg = data.months.find((m) => m.month === month);
        const title = monthDate
          .toLocaleString("pt-BR", { month: "long" })
          .replace(/^./, (s) => s.toUpperCase());

        return (
          <Card key={month} variant="glass" className="border">
            <CardHeader className="py-3">
              <CardTitle className="text-base font-semibold flex items-center justify-between">
                <span className="capitalize">{title}</span>
                {monthAgg && (
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded ${
                      monthAgg.balance >= 0 ? "bg-primary/10 text-primary" : "bg-rose-500/10 text-rose-600"
                    }`}
                    title={`Receitas: ${formatCurrency(monthAgg.income)} • Despesas: ${formatCurrency(monthAgg.expense)} • Saldo: ${formatCurrency(monthAgg.balance)}`}
                  >
                    {formatCurrency(monthAgg.balance)}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-7 gap-1">
                {weekDays.map((d) => (
                  <div key={d} className="text-center text-[10px] text-muted-foreground">{d}</div>
                ))}
                {days.map((day) => {
                  const inMonth = isSameMonth(day, monthDate);
                  return (
                    <div
                      key={format(day, "yyyy-MM-dd")}
                      className={`h-6 text-[10px] flex items-center justify-center rounded ${
                        inMonth ? "bg-card/50" : "bg-muted/10 text-muted-foreground/70"
                      }`}
                      title={format(day, "dd/MM/yyyy")}
                    >
                      {format(day, "d")}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

