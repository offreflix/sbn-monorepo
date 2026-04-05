import { Link } from 'react-router-dom'
import { Button } from '@repo/ui'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui'
import {
  BarChart3,
  Calendar,
  ChevronRight,
  CreditCard,
  LayoutDashboard,
  PiggyBank,
  Shield,
  Target,
  TrendingUp,
  Wallet,
  Zap,
  FileText,
  Bot,
  Layers,
  Database,
  ArrowRightLeft,
} from 'lucide-react'

const features = [
  {
    icon: BarChart3,
    title: 'Dashboard Analítico',
    description:
      'Visão consolidada de receitas, despesas e saldo líquido com gráficos interativos de alta performance.',
  },
  {
    icon: FileText,
    title: 'Importação Inteligente',
    description:
      'Suporte nativo para arquivos Nubank em formatos CSV, OFX e PDF com categorização automática.',
  },
  {
    icon: PiggyBank,
    title: 'Projeções de Liquidez',
    description:
      'Simule seu saldo futuro considerando faturas de cartão, contas fixas e liquidez imediata.',
  },
  {
    icon: CreditCard,
    title: 'Gestão de Cartões',
    description:
      'Controle inteligente de faturas, datas de fechamento e parcelamentos complexos.',
  },
  {
    icon: Bot,
    title: 'IA Ready (MCP)',
    description:
      'Servidor MCP integrado para consultar e gerenciar seus dados financeiros via assistentes de IA.',
  },
  {
    icon: Target,
    title: 'Wishlist & Metas',
    description:
      'Priorize seus desejos de consumo e acompanhe o progresso financeiro para cada conquista.',
  },
  {
    icon: Calendar,
    title: 'Recorrências Avançadas',
    description:
      'Gerencie assinaturas e contas fixas com regras de recorrência (mensal, semanal) automáticas.',
  },
  {
    icon: Shield,
    title: 'Arquitetura Robusta',
    description:
      'Autenticação JWT, sessões em Redis e microserviços isolados para máxima segurança.',
  },
  {
    icon: Layers,
    title: 'Micro-frontends',
    description:
      'Interface modular construída com React 19, Rsbuild e Module Federation para agilidade.',
  },
]

const stats = [
  {
    label: 'Multiconta',
    icon: Wallet,
    description: 'Gestão de múltiplas carteiras e bancos',
  },
  {
    label: 'Orquestração',
    icon: ArrowRightLeft,
    description: 'API Gateway unificado (Orchestrator)',
  },
  {
    label: 'Categorias',
    icon: LayoutDashboard,
    description: 'Classificação flexível por tipo',
  },
  {
    label: 'Stack Moderna',
    icon: Database,
    description: 'NestJS, Prisma e PostgreSQL',
  },
]

export const LandingPage = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Background gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-32 top-1/4 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative">
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <TrendingUp size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight">
                SBN <span className="text-primary">Finance</span>
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-6 mr-6">
              <a
                href="#features"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Funcionalidades
              </a>
              <a
                href="#tech"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Tecnologia
              </a>
            </nav>
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Entrar
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="shadow-md">
                  Começar agora <ChevronRight size={16} />
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="mx-auto max-w-5xl px-4 pb-24 pt-20 text-center sm:pt-32">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
            <Zap size={12} fill="currentColor" />
            OPEN-SOURCE FINANCE ECOSYSTEM
          </div>
          <h1 className="mb-6 text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
            Sua vida financeira,{' '}
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              orquestrada.
            </span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Uma plataforma completa construída com arquitetura de microserviços.
            Importe dados do Nubank, projete seu saldo futuro e gerencie metas
            com auxílio de IA.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/register" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="h-12 w-full px-8 text-base sm:w-auto"
              >
                Criar conta gratuita <ChevronRight size={18} className="ml-1" />
              </Button>
            </Link>
            <a
              href="https://github.com/offreflix/sbn-monorepo"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto"
            >
              <Button
                size="lg"
                variant="outline"
                className="h-12 w-full px-8 text-base sm:w-auto"
              >
                Ver no GitHub
              </Button>
            </a>
          </div>
        </section>

        {/* Stats/Quick Info */}
        <section className="mx-auto max-w-6xl px-4 pb-24">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/30 p-6 backdrop-blur-sm transition-all hover:bg-card/50"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <stat.icon size={20} />
                </div>
                <h3 className="text-base font-bold">{stat.label}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="mx-auto max-w-6xl px-4 pb-24">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Recursos de nível Enterprise
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Do back-end escalável à interface modular, cada detalhe foi
              pensado para o seu controle.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="group border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5"
              >
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <feature.icon size={24} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed text-muted-foreground/80">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Tech Section */}
        <section id="tech" className="bg-secondary/20 py-24">
          <div className="mx-auto max-w-5xl px-4 text-center">
            <h2 className="mb-12 text-2xl font-bold uppercase tracking-widest text-muted-foreground/60">
              Powered By
            </h2>
            <div className="flex flex-wrap justify-center gap-8 opacity-70 grayscale transition-all hover:grayscale-0">
              <span className="text-xl font-bold">NestJS 10</span>
              <span className="text-xl font-bold">React 19</span>
              <span className="text-xl font-bold">Prisma ORM</span>
              <span className="text-xl font-bold">Redis</span>
              <span className="text-xl font-bold">Tailwind CSS 4</span>
              <span className="text-xl font-bold">Turborepo</span>
              <span className="text-xl font-bold">Python MCP</span>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-4xl px-4 py-24 text-center">
          <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-primary/5 p-12 shadow-2xl">
            <div className="relative z-10">
              <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
                Pronto para assumir o controle?
              </h2>
              <p className="mx-auto mb-8 max-w-lg text-muted-foreground">
                Junte-se à nova geração de gestão financeira pessoal baseada em
                dados reais e automação inteligente.
              </p>
              <Link to="/register">
                <Button
                  size="lg"
                  className="h-14 px-10 text-lg shadow-xl shadow-primary/20"
                >
                  Criar minha conta <ChevronRight className="ml-2" />
                </Button>
              </Link>
            </div>
            {/* Decorative orb */}
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/50 py-12">
          <div className="mx-auto max-w-6xl px-4 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-primary" />
              <span className="font-bold">SBN Finance</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 SBN Monorepo. Desenvolvido com microservices architecture.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link to="/login" className="hover:text-primary">
                Login
              </Link>
              <Link to="/register" className="hover:text-primary">
                Register
              </Link>
              <a href="#" className="hover:text-primary">
                Privacidade
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
