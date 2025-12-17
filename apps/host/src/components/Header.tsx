'use client'

import { useNavigate } from 'react-router-dom'
import { Button } from '@repo/ui'
import { useAuth } from '../auth/AuthProvider'
import { Menu, X, Home, DollarSign, LogOut } from 'lucide-react'
import { useState } from 'react'

interface HeaderProps {
  title?: string
  subtitle?: string
}

export function Header({ title = 'SBN Shell', subtitle }: HeaderProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const getUserInitials = () => {
    if (!user?.email) return 'U'
    return user.email.charAt(0).toUpperCase()
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {title}
              </div>
              {subtitle && (
                <h1 className="text-base font-bold text-foreground sm:text-lg">
                  {subtitle}
                </h1>
              )}
            </div>
          </div>

          <nav
            className="hidden items-center gap-2 md:flex"
            aria-label="Main navigation"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              Home
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/finance')}
              className="gap-2"
            >
              <DollarSign className="h-4 w-4" />
              Financeiro
            </Button>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-1.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {getUserInitials()}
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">
                  Logado como
                </span>
                <span className="text-sm font-medium text-foreground">
                  {user?.email}
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2 bg-transparent"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-border pb-4 md:hidden">
            <nav
              className="flex flex-col gap-2 py-4"
              aria-label="Mobile navigation"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigate('/')
                  setMobileMenuOpen(false)
                }}
                className="justify-start gap-2"
              >
                <Home className="h-4 w-4" />
                Home
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigate('/finance')
                  setMobileMenuOpen(false)
                }}
                className="justify-start gap-2"
              >
                <DollarSign className="h-4 w-4" />
                Financeiro
              </Button>
            </nav>

            <div className="border-t border-border pt-4">
              <div className="mb-3 flex items-center gap-2 rounded-lg border border-border bg-muted/50 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {getUserInitials()}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">
                    Logado como
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {user?.email}
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start gap-2 bg-transparent"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
