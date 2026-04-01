import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./auth/AuthProvider";
import { ThemeProvider } from "./theme/ThemeProvider";
import { DashboardPage } from "./pages/Dashboard";
import { FinanceRemotePage } from "./pages/FinanceRemote";
import { WishlistPage } from "./pages/Wishlist";
import { LoginPage } from "./pages/Login";
import { RegisterPage } from "./pages/Register";
import { SettingsPage } from "./pages/Settings";

const WishlistDetailPage = lazy(() =>
  import("./pages/WishlistDetail").then((m) => ({ default: m.WishlistDetailPage }))
);

const Protected = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm text-muted-foreground">
          Carregando sessão...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/dashboard"
              element={
                <Protected>
                  <DashboardPage />
                </Protected>
              }
            />
            <Route
              path="/finance/*"
              element={
                <Protected>
                  <FinanceRemotePage />
                </Protected>
              }
            />
            <Route
              path="/wishlist"
              element={
                <Protected>
                  <WishlistPage />
                </Protected>
              }
            />
            <Route
              path="/wishlist/:id"
              element={
                <Protected>
                  <Suspense
                    fallback={
                      <div className="flex min-h-screen items-center justify-center">
                        <div className="text-sm text-muted-foreground">
                          Carregando...
                        </div>
                      </div>
                    }
                  >
                    <WishlistDetailPage />
                  </Suspense>
                </Protected>
              }
            />
            <Route
              path="/settings"
              element={
                <Protected>
                  <SettingsPage />
                </Protected>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster richColors closeButton />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
