import { useEffect, useMemo, useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  startOfWeek,
  endOfWeek,
  addDays,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui";
import { formatCurrency } from "../lib/utils";
import type { Transaction } from "../pages/transactions/transactions.type";
import type { DashboardYearOverview } from "../pages/dashboard/dashboard.type";
import { financeApi } from "../api/finance";
import { YearOverviewChart } from "./YearOverviewChart";
import { AnnualCalendar } from "./AnnualCalendar";

interface CalendarViewProps {
  transactions: Transaction[];
  currentMonth: number; // 1-12
  currentYear: number;
}

export function CalendarView({
  transactions,
  currentMonth,
  currentYear,
}: CalendarViewProps) {
  const [view, setView] = useState<
    "day" | "week" | "month" | "agenda" | "4days" | "year"
  >(() => {
    const saved = localStorage.getItem("calendar-view");
    const valid = ["day", "week", "month", "agenda", "4days", "year"];
    return (valid.includes(saved ?? "") ? saved : "month") as
      | "day"
      | "week"
      | "month"
      | "agenda"
      | "4days"
      | "year";
  });

  const monthDate = useMemo(
    () => new Date(currentYear, currentMonth - 1, 1),
    [currentMonth, currentYear],
  );

  const daysInMonth = useMemo(() => {
    const start = startOfWeek(startOfMonth(monthDate));
    const end = endOfWeek(endOfMonth(monthDate));
    return eachDayOfInterval({ start, end });
  }, [monthDate]);

  const dailyData = useMemo(() => {
    const data = new Map<
      string,
      {
        income: number;
        expense: number;
        balance: number;
        transactions: Transaction[];
      }
    >();

    transactions.forEach((tx) => {
      const dateKey = format(new Date(tx.date), "yyyy-MM-dd");
      const current = data.get(dateKey) || {
        income: 0,
        expense: 0,
        balance: 0,
        transactions: [],
      };

      const amount = Number(tx.amount);
      if (tx.type === "Receita") {
        current.income += amount;
        current.balance += amount;
      } else {
        current.expense += amount;
        current.balance -= amount;
      }
      current.transactions.push(tx);

      data.set(dateKey, current);
    });

    return data;
  }, [transactions]);

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const selectedDay = useMemo(() => {
    const today = new Date();
    if (
      today.getFullYear() === currentYear &&
      today.getMonth() + 1 === currentMonth
    ) {
      return today;
    }
    return new Date(currentYear, currentMonth - 1, 1);
  }, [currentYear, currentMonth]);

  const weekRange = useMemo(() => {
    const start = startOfWeek(selectedDay);
    const end = addDays(start, 6);
    return eachDayOfInterval({ start, end });
  }, [selectedDay]);

  const fourDays = useMemo(
    () =>
      eachDayOfInterval({ start: selectedDay, end: addDays(selectedDay, 3) }),
    [selectedDay],
  );

  // Year overview state and fetch
  const [yearData, setYearData] = useState<DashboardYearOverview | null>(null);
  const [yearLoading, setYearLoading] = useState(false);

  useEffect(() => {
    if (view === "year") {
      setYearLoading(true);
      financeApi.dashboard
        .year(currentYear)
        .then((res) => setYearData(res))
        .finally(() => setYearLoading(false));
    } else {
      setYearData(null);
      setYearLoading(false);
    }
  }, [view, currentYear]);

  return (
    <Card variant="glass" className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">
            Calendário Financeiro
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select
              value={view}
              onValueChange={(v: any) => {
                setView(v);
                localStorage.setItem("calendar-view", v);
              }}
            >
              <SelectTrigger className="w-[160px] h-8 text-xs">
                <SelectValue placeholder="Visão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Dia</SelectItem>
                <SelectItem value="week">Semana</SelectItem>
                <SelectItem value="month">Mês</SelectItem>
                <SelectItem value="year">Ano</SelectItem>
                <SelectItem value="agenda">Programação</SelectItem>
                <SelectItem value="4days">4 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 flex flex-col">
        {view === "year" && (
          <div className="space-y-4">
            {yearLoading && (
              <div className="text-sm text-muted-foreground">
                Carregando visão anual…
              </div>
            )}
            {!yearLoading && yearData && (
              <>
                <YearOverviewChart
                  data={yearData.months.map((m) => ({
                    name: new Date(currentYear, m.month - 1, 1)
                      .toLocaleString("pt-BR", { month: "short" })
                      .replace(".", "")
                      .replace(/^./, (s) => s.toUpperCase()),
                    income: m.income,
                    expense: m.expense,
                  }))}
                />
                <div className="flex items-center gap-4 text-sm">
                  <div className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-600">
                    Receitas: {formatCurrency(yearData.totals.income)}
                  </div>
                  <div className="px-2 py-1 rounded bg-rose-500/10 text-rose-600">
                    Despesas: {formatCurrency(yearData.totals.expense)}
                  </div>
                  <div
                    className={`px-2 py-1 rounded ${
                      yearData.totals.balance >= 0
                        ? "bg-primary/10 text-primary"
                        : "bg-rose-500/10 text-rose-600"
                    }`}
                  >
                    Saldo: {formatCurrency(yearData.totals.balance)}
                  </div>
                </div>
                <AnnualCalendar year={currentYear} data={yearData} />
              </>
            )}
          </div>
        )}

        {view === "month" && (
          <div className="overflow-x-auto p-px">
            <div className="grid grid-cols-7 gap-1 min-w-[560px]">
              {/* Header */}
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-muted-foreground py-2 bg-muted/30 rounded-t-md"
                >
                  {day}
                </div>
              ))}

              {/* Days */}
              {daysInMonth.map((day, index) => {
                const dateKey = format(day, "yyyy-MM-dd");
                const data = dailyData.get(dateKey);
                const isCurrentMonth = isSameMonth(day, monthDate);
                const isToday = isSameDay(day, new Date());

                const colIndex = index % 7;
                const rowIndex = Math.floor(index / 7);
                const totalRows = Math.ceil(daysInMonth.length / 7);
                const isRightSide = colIndex > 3;
                const isBottomHalf = rowIndex >= totalRows - 2; // Flip for last 2 rows

                return (
                  <div
                    key={dateKey}
                    className={`
                  relative group
                  min-h-[70px] sm:min-h-[100px] p-1 sm:p-2 border rounded-md flex flex-col justify-between transition-colors
                  ${
                    isCurrentMonth
                      ? "bg-card/50 hover:bg-card/80"
                      : "bg-muted/10 text-muted-foreground opacity-50"
                  }
                  ${isToday ? "border-primary ring-1 ring-primary" : "border-border/50"}
                `}
                  >
                    <div className="flex justify-between items-start">
                      <span
                        className={`text-sm font-medium ${
                          isToday
                            ? "bg-primary text-primary-foreground w-6 h-6 flex items-center justify-center rounded-full"
                            : ""
                        }`}
                      >
                        {format(day, "d")}
                      </span>
                      {data && (
                        <div className="text-[10px] text-right space-y-0.5">
                          {data.income > 0 && (
                            <div className="text-emerald-400 font-medium">
                              +{formatCurrency(data.income)}
                            </div>
                          )}
                          {data.expense > 0 && (
                            <div className="text-red-400 font-medium">
                              -{formatCurrency(data.expense)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {data && (data.income > 0 || data.expense > 0) && (
                      <div
                        className={`text-xs font-bold text-right mt-1 pt-1 border-t border-border/30 ${
                          data.balance >= 0 ? "text-primary" : "text-red-400"
                        }`}
                      >
                        {formatCurrency(data.balance)}
                      </div>
                    )}

                    {/* Hover Tooltip */}
                    {data && data.transactions.length > 0 && (
                      <div
                        className={`
                      hidden group-hover:block absolute z-50 w-64 p-3
                      bg-popover text-popover-foreground rounded-md border shadow-xl
                      ${isRightSide ? "right-0" : "left-0"}
                      ${isBottomHalf ? "bottom-full mb-2" : "top-full mt-2"}
                    `}
                      >
                        <div className="text-xs font-semibold mb-2 pb-2 border-b">
                          Transações do dia
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                          {data.transactions.map((tx) => (
                            <div
                              key={tx.id}
                              className="flex justify-between items-center text-xs gap-2"
                            >
                              <span
                                className="truncate flex-1"
                                title={tx.description || ""}
                              >
                                {tx.description || "Sem descrição"}
                              </span>
                              <span
                                className={`whitespace-nowrap ${
                                  tx.type === "Receita"
                                    ? "text-emerald-400"
                                    : "text-red-400"
                                }`}
                              >
                                {formatCurrency(tx.amount)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {view === "week" && (
          <div className="overflow-x-auto flex-1 min-h-0 p-px">
            <div className="grid grid-cols-7 grid-rows-[auto_1fr] gap-1 min-w-[560px] h-full">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-muted-foreground py-2 bg-muted/30 rounded-t-md"
                >
                  {day}
                </div>
              ))}
              {weekRange.map((day, index) => {
                const dateKey = format(day, "yyyy-MM-dd");
                const data = dailyData.get(dateKey);
                const isToday = isSameDay(day, new Date());
                const isRightSide = index % 7 > 3;
                const isBottomHalf = false;
                return (
                  <div
                    key={dateKey}
                    className={`
                    relative group
                    min-h-[100px] sm:min-h-[140px] p-1 sm:p-2 border rounded-md flex flex-col justify-between transition-colors
                    bg-card/60 hover:bg-card
                    ${isToday ? "border-primary ring-1 ring-primary" : "border-border/50"}
                  `}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-medium">
                        {format(day, "EEE d", { locale: ptBR })}
                      </span>
                      {data && (
                        <div className="text-[10px] text-right space-y-0.5">
                          {data.income > 0 && (
                            <div className="text-emerald-400 font-medium">
                              +{formatCurrency(data.income)}
                            </div>
                          )}
                          {data.expense > 0 && (
                            <div className="text-red-400 font-medium">
                              -{formatCurrency(data.expense)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {data && data.transactions.length > 0 && (
                      <div className="space-y-1 mt-2 max-h-32 overflow-y-auto custom-scrollbar">
                        {data.transactions.slice(0, 5).map((tx) => (
                          <div
                            key={tx.id}
                            className="flex justify-between items-center text-xs gap-2"
                          >
                            <span
                              className="truncate flex-1"
                              title={tx.description || ""}
                            >
                              {tx.description || "Sem descrição"}
                            </span>
                            <span
                              className={`whitespace-nowrap ${
                                tx.type === "Receita"
                                  ? "text-emerald-400"
                                  : "text-red-400"
                              }`}
                            >
                              {formatCurrency(tx.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Tooltip reuse */}
                    {data && data.transactions.length > 0 && (
                      <div
                        className={`
                        hidden group-hover:block absolute z-50 w-64 p-3
                        bg-popover text-popover-foreground rounded-md border shadow-xl
                        ${isRightSide ? "right-0" : "left-0"}
                        ${isBottomHalf ? "bottom-full mb-2" : "top-full mt-2"}
                      `}
                      >
                        <div className="text-xs font-semibold mb-2 pb-2 border-b">
                          Transações do dia
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                          {data.transactions.map((tx) => (
                            <div
                              key={tx.id}
                              className="flex justify-between items-center text-xs gap-2"
                            >
                              <span
                                className="truncate flex-1"
                                title={tx.description || ""}
                              >
                                {tx.description || "Sem descrição"}
                              </span>
                              <span
                                className={`whitespace-nowrap ${
                                  tx.type === "Receita"
                                    ? "text-emerald-400"
                                    : "text-red-400"
                                }`}
                              >
                                {formatCurrency(tx.amount)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {view === "4days" && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {fourDays.map((day) => {
              const dateKey = format(day, "yyyy-MM-dd");
              const data = dailyData.get(dateKey);
              return (
                <div key={dateKey} className="p-3 border rounded-md bg-card/60">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">
                      {format(day, "EEE d", { locale: ptBR })}
                    </span>
                    {data && (
                      <span
                        className={`text-xs font-bold ${
                          (data.balance || 0) >= 0
                            ? "text-primary"
                            : "text-red-400"
                        }`}
                      >
                        {formatCurrency(data.balance || 0)}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
                    {data?.transactions?.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex justify-between items-center text-xs gap-2"
                      >
                        <span className="truncate flex-1">
                          {tx.description || "Sem descrição"}
                        </span>
                        <span
                          className={`whitespace-nowrap ${
                            tx.type === "Receita"
                              ? "text-emerald-400"
                              : "text-red-400"
                          }`}
                        >
                          {formatCurrency(tx.amount)}
                        </span>
                      </div>
                    ))}
                    {!data && (
                      <div className="text-xs text-muted-foreground">
                        Sem transações
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {view === "day" && (
          <div className="space-y-3">
            <div className="text-sm font-medium">
              {format(selectedDay, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </div>
            <div className="space-y-2">
              {(
                dailyData.get(format(selectedDay, "yyyy-MM-dd"))
                  ?.transactions || []
              ).map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-2 rounded-md border"
                >
                  <span className="text-sm truncate">
                    {tx.description || "Sem descrição"}
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      tx.type === "Receita"
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {formatCurrency(tx.amount)}
                  </span>
                </div>
              ))}
              {(
                dailyData.get(format(selectedDay, "yyyy-MM-dd"))
                  ?.transactions || []
              ).length === 0 && (
                <div className="text-sm text-muted-foreground">
                  Sem transações neste dia
                </div>
              )}
            </div>
          </div>
        )}

        {view === "agenda" && (
          <div className="space-y-4">
            {daysInMonth.map((day) => {
              const dateKey = format(day, "yyyy-MM-dd");
              const data = dailyData.get(dateKey);
              if (!data || data.transactions.length === 0) return null;
              return (
                <div key={dateKey} className="border rounded-md p-3 bg-card/60">
                  <div className="text-xs font-semibold mb-2">
                    {format(day, "EEE, d 'de' MMMM", { locale: ptBR })}
                  </div>
                  <div className="space-y-2">
                    {data.transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="truncate">
                          {tx.description || "Sem descrição"}
                        </span>
                        <span
                          className={`whitespace-nowrap ${
                            tx.type === "Receita"
                              ? "text-emerald-400"
                              : "text-red-400"
                          }`}
                        >
                          {formatCurrency(tx.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {transactions.length === 0 && (
              <div className="text-sm text-muted-foreground">
                Sem transações neste período
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
