import { useCallback, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function todayIsoDate() {
  return new Date().toISOString().split("T")[0];
}

export function useAppModel() {
  const location = useLocation();
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState(() => {
    const stored = localStorage.getItem("health-selected-date");
    return stored || todayIsoDate();
  });

  const setDate = useCallback((date: string) => {
    setSelectedDate(date);
    localStorage.setItem("health-selected-date", date);
  }, []);

  const selectedMonth = useMemo(() => {
    const [, m] = selectedDate.split("-");
    return parseInt(m, 10);
  }, [selectedDate]);

  const selectedYear = useMemo(() => {
    const [y] = selectedDate.split("-");
    return parseInt(y, 10);
  }, [selectedDate]);

  const setSelectedMonthYear = useCallback(
    (month: number, year: number) => {
      const now = new Date();
      const isCurrentMonth =
        month === now.getMonth() + 1 && year === now.getFullYear();
      const date = isCurrentMonth
        ? now.toISOString().split("T")[0]
        : `${year}-${String(month).padStart(2, "0")}-01`;
      setDate(date);
    },
    [setDate],
  );

  const knownRoutes = useMemo(
    () => [
      "summary",
      "foods",
      "meal-logs",
      "water-logs",
      "measurements",
      "goals",
    ],
    [],
  );

  const isTabActive = useCallback(
    (path: string) => {
      if (path === "") {
        const segments = location.pathname.split("/").filter(Boolean);
        const last = segments[segments.length - 1] ?? "";
        return !knownRoutes.includes(last);
      }
      return location.pathname.endsWith(path);
    },
    [knownRoutes, location.pathname],
  );

  const handleNavigate = useCallback(
    (path: string) => {
      const currentPath = location.pathname;
      const segments = currentPath.split("/").filter(Boolean);
      const lastSegment = segments[segments.length - 1];
      const isCurrentlyInSubRoute = knownRoutes.includes(lastSegment);

      if (path === ".") {
        if (isCurrentlyInSubRoute) {
          navigate("..", { relative: "path", replace: true });
        }
        return;
      }

      if (isCurrentlyInSubRoute) {
        if (lastSegment !== path) {
          navigate(`../${path}`, { relative: "path", replace: true });
        }
        return;
      }

      navigate(path, { replace: true });
    },
    [knownRoutes, location.pathname, navigate],
  );

  return {
    state: {
      selectedDate,
      selectedMonth,
      selectedYear,
    },
    setters: {
      setSelectedDate: setDate,
      setSelectedMonthYear,
    },
    actions: {
      isTabActive,
      handleNavigate,
    },
  };
}

export type AppModelOutput = ReturnType<typeof useAppModel>;
