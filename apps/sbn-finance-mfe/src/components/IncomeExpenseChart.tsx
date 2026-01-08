import { useMemo } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from '@repo/ui'
import type { ChartConfig } from '@repo/ui'
import type { Transaction } from '../types/finance'

interface IncomeExpenseChartProps {
  transactions: Transaction[]
  year: number
  month: number
}

const chartConfig: ChartConfig = {
  receitas: {
    label: 'Receitas',
    color: 'hsl(var(--chart-1, 142 70% 45%))',
  },
  despesas: {
    label: 'Despesas',
    color: 'hsl(var(--chart-2, 0 84% 60%))',
  },
}

export function IncomeExpenseChart({
  transactions,
  year,
  month,
}: IncomeExpenseChartProps) {
  const data = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === 'Receita')
      .reduce((acc, t) => acc + parseFloat(String(t.amount)), 0)

    const expense = transactions
      .filter((t) => t.type === 'Despesa')
      .reduce((acc, t) => acc + parseFloat(String(t.amount)), 0)

    return [
      { type: 'receitas', value: income, fill: 'var(--color-receitas)' },
      { type: 'despesas', value: expense, fill: 'var(--color-despesas)' },
    ]
  }, [transactions])

  const monthName = new Date(year, month - 1).toLocaleString('pt-BR', {
    month: 'long',
  })

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Visão Geral</CardTitle>
        <CardDescription>
          Comparativo de receitas e despesas em {monthName} de {year}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="h-[300px] w-full [&>div]:aspect-auto!"
        >
          <BarChart
            data={data}
            accessibilityLayer
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="type"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) =>
                (chartConfig[value as keyof typeof chartConfig]
                  ?.label as string) || value
              }
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tickFormatter={(value) =>
                new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                  notation: 'compact',
                }).format(value)
              }
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  nameKey="type"
                  formatter={(value) =>
                    new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(Number(value))
                  }
                />
              }
            />
            <Bar dataKey="value" radius={8} barSize={60} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
