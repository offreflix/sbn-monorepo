import { Routes, Route, Navigate } from "react-router-dom";
import { Button, MonthYearSelector } from "@repo/ui";
import {
  LayoutDashboard,
  RefreshCcw,
  Receipt,
  Tags,
  Calendar,
  Heart,
  Repeat,
} from "lucide-react";
import { Toaster } from "sonner";
import { Dashboard } from "./pages/dashboard/page";
import { TransactionList } from "./pages/transactions/page";
import { CategoryGrid } from "./pages/categories/page";
import { CalendarView } from "./pages/calendar/page";
import { WishlistPage } from "./pages/wishlist/page";
import { WishlistDetailPage } from "./pages/wishlist-detail/page";
import { RecurrencesPage } from "./pages/recurrences/page";
import type { AppModelOutput } from "./app.model";

export function AppView({
  data: { transactions, wallets, categories },
  state: { loading, selectedMonth, selectedYear },
  setters: { setSelectedMonth, setSelectedYear },
  actions: { loadData, handleTransactionSuccess, isTabActive, handleNavigate },
}: AppModelOutput) {
  return (
    <>
      <Toaster position="top-right" />
      <div className="w-full min-h-screen bg-background text-foreground">
        <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold tracking-tight">Finanças</h1>
              <div className="h-6 w-px bg-border hidden sm:block" />

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
                <Button
                  variant={isTabActive("wishlist") ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => handleNavigate("wishlist")}
                  className="gap-2"
                >
                  <Heart className="h-4 w-4" />
                  Wishlist
                </Button>
                <Button
                  variant={isTabActive("recurrences") ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => handleNavigate("recurrences")}
                  className="gap-2"
                >
                  <Repeat className="h-4 w-4" />
                  Recorrências
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
              <Route path="wishlist" element={<WishlistPage />} />
              <Route path="wishlist/:id" element={<WishlistDetailPage />} />
              <Route path="recurrences" element={<RecurrencesPage />} />
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
}
