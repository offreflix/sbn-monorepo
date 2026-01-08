import { useMemo } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { Transaction } from '../types/finance'

interface IncomeExpenseChartProps {
  transactions: Transaction[]
  year: number
  month: number
}

export function IncomeExpenseChart({
  transactions,
  year,
  month,
}: IncomeExpenseChartProps) {
  const data = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === 'Receita')
      .reduce((acc, t) => acc + parseFloat(t.amount), 0)

    const expense = transactions
      .filter((t) => t.type === 'Despesa')
      .reduce((acc, t) => acc + parseFloat(t.amount), 0)

    return [
      { name: 'Receitas', value: income, color: '#10b981' }, // emerald-500
      { name: 'Despesas', value: expense, color: '#ef4444' }, // red-500
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
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'currentColor', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'currentColor', fontSize: 12 }}
                tickFormatter={(value) =>
                  new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    notation: 'compact',
                  }).format(value)
                }
              />
              <Tooltip
                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                contentStyle={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                }}
                formatter={(value: number) =>
                  new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(value)
                }
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={60}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
