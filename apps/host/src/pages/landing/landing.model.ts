import {
  BarChart3,
  Calendar,
  CreditCard,
  LayoutDashboard,
  PiggyBank,
  Shield,
  Target,
  Wallet,
  Layers,
  Database,
  FileText,
  Bot,
  ArrowRightLeft,
} from "lucide-react";
import type { LandingProps, Feature, Stat } from "./landing.type";

const features: Feature[] = [
  {
    icon: BarChart3,
    title: "Dashboard Analítico",
    description:
      "Visão consolidada de receitas, despesas e saldo líquido com gráficos interativos de alta performance.",
  },
  {
    icon: FileText,
    title: "Importação Inteligente",
    description:
      "Suporte nativo para arquivos Nubank em formatos CSV, OFX e PDF com categorização automática.",
  },
  {
    icon: PiggyBank,
    title: "Projeções de Liquidez",
    description:
      "Simule seu saldo futuro considerando faturas de cartão, contas fixas e liquidez imediata.",
  },
  {
    icon: CreditCard,
    title: "Gestão de Cartões",
    description:
      "Controle inteligente de faturas, datas de fechamento e parcelamentos complexos.",
  },
  {
    icon: Bot,
    title: "IA Ready (MCP)",
    description:
      "Servidor MCP integrado para consultar e gerenciar seus dados financeiros via assistentes de IA.",
  },
  {
    icon: Target,
    title: "Wishlist & Metas",
    description:
      "Priorize seus desejos de consumo e acompanhe o progresso financeiro para cada conquista.",
  },
  {
    icon: Calendar,
    title: "Recorrências Avançadas",
    description:
      "Gerencie assinaturas e contas fixas com regras de recorrência (mensal, semanal) automáticas.",
  },
  {
    icon: Shield,
    title: "Arquitetura Robusta",
    description:
      "Autenticação JWT, sessões em Redis e microserviços isolados para máxima segurança.",
  },
  {
    icon: Layers,
    title: "Micro-frontends",
    description:
      "Interface modular construída com React 19, Rsbuild e Module Federation para agilidade.",
  },
];

const stats: Stat[] = [
  {
    label: "Multiconta",
    icon: Wallet,
    description: "Gestão de múltiplas carteiras e bancos",
  },
  {
    label: "Orquestração",
    icon: ArrowRightLeft,
    description: "API Gateway unificado (Orchestrator)",
  },
  {
    label: "Categorias",
    icon: LayoutDashboard,
    description: "Classificação flexível por tipo",
  },
  {
    label: "Stack Moderna",
    icon: Database,
    description: "NestJS, Prisma e PostgreSQL",
  },
];

export function useLandingModel(_props: LandingProps) {
  return {
    data: {
      features,
      stats,
    },
  };
}

export type LandingModelOutput = ReturnType<typeof useLandingModel>;
