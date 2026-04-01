import { useState, useEffect, useCallback } from "react";
import {
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import "./index.css";
import { financeApi } from "./api/finance";
import type {
  Transaction,
  Wallet,
  Category,
} from "./types/finance";
import { TransactionList } from "./components/TransactionList";
import { Dashboard } from "./pages/dashboard/page";
import { CategoryGrid } from "./components/CategoryGrid";
import { CalendarView } from "./components/CalendarView";
import { Button } from "@repo/ui";
import {
  LayoutDashboard,
  RefreshCcw,
  Receipt,
  Tags,
  Calendar,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { MonthYearSelector } from "./components/MonthYearSelector";

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // Parallel Fetch
      const [txs, wls, cats] = await Promise.all([
        financeApi.transactions.list(selectedMonth, selectedYear),
        financeApi.wallets.list(),
        financeApi.categories.list(),
      ]);

      setTransactions(txs);
      setWallets(wls);
      setCategories(cats);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTransactionSuccess = () => {
    loadData();
  };

  const isTabActive = (path: string) => {
    // If path is empty (Dashboard), check if we are at root or just /finance
    if (path === "") {
      const isSubRoute =
        location.pathname.endsWith("/transactions") ||
        location.pathname.endsWith("/categories") ||
        location.pathname.endsWith("/calendar");
      return !isSubRoute;
    }
    return location.pathname.endsWith(path);
  };

  const handleNavigate = (path: string) => {
    // If we are navigating to the same path, do nothing
    const currentPath = location.pathname;
    const segments = currentPath.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1];

    // Define known routes (excluding root)
    const knownRoutes = ["transactions", "categories", "calendar"];

    // Determine if we are currently in a sub-route
    const isCurrentlyInSubRoute = knownRoutes.includes(lastSegment);

    if (path === ".") {
      // Target: Root (Dashboard)
      if (isCurrentlyInSubRoute) {
        // Go up one level to root
        navigate("..", { relative: "path", replace: true });
      }
    } else {
      // Target: Sub-route (e.g., 'calendar')
      if (isCurrentlyInSubRoute) {
        if (lastSegment !== path) {
          // Replace sibling: go up and then to new path
          navigate(`../${path}`, { relative: "path", replace: true });
        }
      } else {
        // From root, append path
        navigate(path, { replace: true });
      }
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="w-full min-h-screen bg-background text-foreground">
        {/* Header Section */}
        <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold tracking-tight">Finanças</h1>
              <div className="h-6 w-px bg-border hidden sm:block" />

              {/* View Switcher - Simple Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant={isTabActive("") ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => handleNavigate(".")}
                  className="gap-2"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
                <Button
                  variant={isTabActive("transactions") ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => handleNavigate("transactions")}
                  className="gap-2"
                >
                  <Receipt className="h-4 w-4" />
                  Transações
                </Button>
                <Button
                  variant={isTabActive("categories") ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => handleNavigate("categories")}
                  className="gap-2"
                >
                  <Tags className="h-4 w-4" />
                  Categorias
                </Button>
                <Button
                  variant={isTabActive("calendar") ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => handleNavigate("calendar")}
                  className="gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Calendário
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <MonthYearSelector
                month={selectedMonth}
                year={selectedYear}
                onChange={(m, y) => {
                  setSelectedMonth(m);
                  setSelectedYear(y);
                }}
              />

              <Button
                variant="ghost"
                size="icon"
                onClick={() => loadData()}
                className="h-8 w-8"
              >
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 space-y-8">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route
                index
                element={
                  <Dashboard
                    wallets={wallets}
                    allCategories={categories}
                    transactions={transactions}
                    globalLoading={loading}
                    onRefresh={handleTransactionSuccess}
                    selectedMonth={selectedMonth}
                    selectedYear={selectedYear}
                  />
                }
              />
              <Route
                path="transactions"
                element={
                  <TransactionList
                    transactions={transactions}
                    wallets={wallets}
                    categories={categories}
                    onRefresh={handleTransactionSuccess}
                  />
                }
              />
              <Route
                path="categories"
                element={
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-3xl font-bold tracking-tight">
                        Categorias
                      </h2>
                      <p className="text-muted-foreground">
                        Gerencie suas categorias de receitas e despesas
                      </p>
                    </div>
                    <CategoryGrid
                      categories={categories}
                      onRefresh={handleTransactionSuccess}
                    />
                  </div>
                }
              />
              <Route
                path="calendar"
                element={
                  <CalendarView
                    transactions={transactions}
                    currentMonth={selectedMonth}
                    currentYear={selectedYear}
                  />
                }
              />
              {/* Fallback to dashboard */}
              <Route path="*" element={<Navigate to="." replace />} />
            </Routes>
          </div>
        </main>
      </div>

      <div
        className="hidden md:flex lg:flex xl:flex"
        style={{ display: "none" }}
      />
    </>
  );
};

export default App;
