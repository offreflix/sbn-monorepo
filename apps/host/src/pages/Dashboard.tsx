import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { useAuth } from '../auth/AuthProvider'

export const DashboardPage = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between border-b border-border bg-white/90 px-6 py-4 backdrop-blur">
        <div>
          <div className="text-sm uppercase tracking-wide text-muted-foreground">SBN Shell</div>
          <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground">
            Logado como <span className="font-medium text-foreground">{user?.email}</span>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Sair
          </Button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Financeiro</CardTitle>
            <CardDescription>
              Este shell carregará o microfrontend de finanças (remote) quando navegarmos para a
              rota correspondente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Por enquanto, este é um placeholder. Use o menu para navegar ou avance com a integração
              do remote de finanças.
            </p>
            <Button onClick={() => navigate('/dashboard')}>Recarregar</Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

