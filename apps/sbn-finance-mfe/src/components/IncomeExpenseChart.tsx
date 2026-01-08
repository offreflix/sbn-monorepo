import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@repo/ui'
import type { Transaction } from '../types/finance'
import { useMemo } from 'react'

interface IncomeExpenseChartProps {
  transactions: Transaction[]
  year: number
  month: number
}

const chartConfig = {
  informational: {
    label: 'Financeiro',
  },
  Receita: {
    label: 'Receita',
    color: '#10b981', // Emerald 500
  },
  Despesa: {
    label: 'Despesa',
    color: '#ef4444', // Red 500
  },
} satisfies ChartConfig

export function IncomeExpenseChart({
  transactions,
  year,
  month,
}: IncomeExpenseChartProps) {
  const data = useMemo(() => {
    const daysInMonth = new Date(year, month, 0).getDate()
    // Create base data for all days
    const map = new Map<
      number,
      { day: number; Receita: number; Despesa: number }
    >()

    for (let i = 1; i <= daysInMonth; i++) {
      map.set(i, { day: i, Receita: 0, Despesa: 0 })
    }

    // Accumulate transactions
    transactions.forEach((t) => {
      const tDate = new Date(t.date)
      // Check exact month/year match
      if (tDate.getMonth() + 1 === month && tDate.getFullYear() === year) {
        const day = tDate.getDate()
        const entry = map.get(day)
        if (entry) {
          if (t.type === 'Receita') {
            entry.Receita += Number(t.amount)
          } else {
            entry.Despesa += Number(t.amount)
          }
        }
      }
    })

    return Array.from(map.values())
  }, [transactions, year, month])

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Fluxo Financeiro</CardTitle>
        <CardDescription>
          Receitas e Despesas diárias para {month}/{year}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[300px] w-full"
          style={{ minHeight: '300px', width: '100%' }}
        >
          <AreaChart
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval="preserveStartEnd"
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="Despesa"
              type="natural"
              fill="var(--color-Despesa)"
              fillOpacity={0.4}
              stroke="var(--color-Despesa)"
              stackId="a"
            />
            <Area
              dataKey="Receita"
              type="natural"
              fill="var(--color-Receita)"
              fillOpacity={0.4}
              stroke="var(--color-Receita)"
              stackId="b"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
