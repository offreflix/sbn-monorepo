import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'
import { useAuth } from '../auth/AuthProvider'

interface HeaderProps {
  title?: string
  subtitle?: string
}

export function Header({ title = 'SBN Shell', subtitle }: HeaderProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="flex items-center justify-between border-b border-border bg-white/90 px-6 py-4 backdrop-blur sticky top-0 z-40">
      <div>
        <div className="text-sm uppercase tracking-wide text-muted-foreground">{title}</div>
        {subtitle && <h1 className="text-lg font-semibold text-foreground">{subtitle}</h1>}
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
  )
}

