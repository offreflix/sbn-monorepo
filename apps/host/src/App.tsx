import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider, useAuth } from './auth/AuthProvider'
import { ThemeProvider } from './theme/ThemeProvider'
import { DashboardPage } from './pages/Dashboard'
import { FinanceRemotePage } from './pages/FinanceRemote'
import { LandingPage } from './pages/Landing'
import { LoginPage } from './pages/Login'
import { RegisterPage } from './pages/Register'
import { SettingsPage } from './pages/Settings'

const LoadingScreen = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="text-sm text-muted-foreground">Carregando sessão...</div>
  </div>
)

const AuthLayout = () => {
  const { user, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (user) return <Navigate to="/dashboard" replace />

  return <Outlet />
}

const AppLayout = () => {
  const { user, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />

  return <Outlet />
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/" element={<LandingPage />} />
            </Route>

            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/finance/*" element={<FinanceRemotePage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster richColors closeButton />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
