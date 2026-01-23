'use client'

import { useNavigate } from 'react-router-dom'
import { Button } from '@repo/ui'
import { useAuth } from '../auth/AuthProvider'
import { useTheme } from '../theme/ThemeProvider'
import {
  Menu,
  X,
  Home,
  DollarSign,
  Heart,
  LogOut,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

interface HeaderProps {
  title?: string
  subtitle?: string
}

export function Header({ title = 'SBN Shell', subtitle }: HeaderProps) {
  const { user, logout } = useAuth()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [themeMenuOpen, setThemeMenuOpen] = useState(false)
  const themeMenuRef = useRef<HTMLDivElement>(null)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const getUserInitials = () => {
    if (!user?.email) return 'U'
    return user.email.charAt(0).toUpperCase()
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        themeMenuRef.current &&
        !themeMenuRef.current.contains(event.target as Node)
      ) {
        setThemeMenuOpen(false)
      }
    }

    if (themeMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [themeMenuOpen])

  const getThemeIcon = () => {
    if (theme === 'system') return <Monitor className="h-4 w-4" />
    return resolvedTheme === 'dark' ? (
      <Moon className="h-4 w-4" />
    ) : (
      <Sun className="h-4 w-4" />
    )
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-lg font-bold">S</span>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {title}
              </div>
              {subtitle && (
                <h1 className="text-sm font-semibold text-foreground sm:text-base">
                  {subtitle}
                </h1>
              )}
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Main navigation"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              <span className="sm:inline">Home</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/finance')}
              className="gap-2"
            >
              <DollarSign className="h-4 w-4" />
              <span className="sm:inline">Financeiro</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/wishlist')}
              className="gap-2"
            >
              <Heart className="h-4 w-4" />
              <span className="sm:inline">Lista de Desejos</span>
            </Button>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            {/* Theme Toggle */}
            <div className="relative" ref={themeMenuRef}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                className="h-9 w-9"
                aria-label="Alterar tema"
              >
                {getThemeIcon()}
              </Button>
              {themeMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-40 rounded-lg border border-border bg-popover p-1 shadow-lg">
                  <button
                    onClick={() => {
                      setTheme('light')
                      setThemeMenuOpen(false)
                    }}
                    className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                      theme === 'light'
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <Sun className="h-4 w-4" />
                    Claro
                  </button>
                  <button
                    onClick={() => {
                      setTheme('dark')
                      setThemeMenuOpen(false)
                    }}
                    className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                      theme === 'dark'
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <Moon className="h-4 w-4" />
                    Escuro
                  </button>
                  <button
                    onClick={() => {
                      setTheme('system')
                      setThemeMenuOpen(false)
                    }}
                    className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                      theme === 'system'
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <Monitor className="h-4 w-4" />
                    Sistema
                  </button>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-1.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {getUserInitials()}
              </div>
              <div className="hidden flex-col lg:flex">
                <span className="text-xs text-muted-foreground">
                  Logado como
                </span>
                <span className="text-sm font-medium text-foreground">
                  {user?.email}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden lg:inline">Sair</span>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden sm:flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const nextTheme =
                  theme === 'light'
                    ? 'dark'
                    : theme === 'dark'
                      ? 'system'
                      : 'light'
                setTheme(nextTheme)
              }}
              className="h-9 w-9"
              aria-label="Alterar tema"
            >
              {getThemeIcon()}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              className="h-9 w-9"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-border pb-4 md:hidden">
            <nav
              className="flex flex-col gap-1 py-4"
              aria-label="Mobile navigation"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigate('/dashboard')
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigate('/wishlist')
                  setMobileMenuOpen(false)
                }}
                className="justify-start gap-2"
              >
                <Heart className="h-4 w-4" />
                Lista de Desejos
              </Button>
            </nav>

            <div className="border-t border-border pt-4">
              <div className="mb-3 flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {getUserInitials()}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-xs text-muted-foreground">
                    Logado como
                  </span>
                  <span className="truncate text-sm font-medium text-foreground">
                    {user?.email}
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start gap-2"
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
