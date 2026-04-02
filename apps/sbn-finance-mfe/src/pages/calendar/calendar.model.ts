import { useEffect, useMemo, useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  startOfWeek,
  endOfWeek,
  addDays,
} from "date-fns";
import type { DashboardYearOverview } from "../dashboard/dashboard.type";
import { financeApi } from "../../api/finance";
import type { CalendarProps, CalendarMode } from "./calendar.type";
import type { Transaction } from "../transactions/transactions.type";

export function useCalendarModel({
  transactions,
  currentMonth,
  currentYear,
}: CalendarProps) {
  const [view, setView] = useState<CalendarMode>(() => {
    const saved = localStorage.getItem("calendar-view");
    const valid = ["day", "week", "month", "agenda", "4days", "year"];
    return (valid.includes(saved ?? "") ? saved : "month") as CalendarMode;
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

  const handleSetView = (v: string) => {
    setView(v as CalendarMode);
    localStorage.setItem("calendar-view", v);
  };

  return {
    data: {
      transactions,
      currentMonth,
      currentYear,
      monthDate,
      daysInMonth,
      dailyData,
      selectedDay,
      weekRange,
      fourDays,
      yearData,
    },
    state: {
      view,
      yearLoading,
    },
    setters: {
      handleSetView,
    },
  };
}

export type CalendarModelOutput = ReturnType<typeof useCalendarModel>;
