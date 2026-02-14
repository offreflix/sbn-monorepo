import { useMemo } from 'react'
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  startOfWeek,
  endOfWeek,
} from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui'
import { formatCurrency } from '../lib/utils'
import type { Transaction } from '../types/finance'

interface CalendarViewProps {
  transactions: Transaction[]
  currentMonth: number // 1-12
  currentYear: number
}

export function CalendarView({
  transactions,
  currentMonth,
  currentYear,
}: CalendarViewProps) {
  const monthDate = useMemo(
    () => new Date(currentYear, currentMonth - 1, 1),
    [currentMonth, currentYear]
  )

  const daysInMonth = useMemo(() => {
    const start = startOfWeek(startOfMonth(monthDate))
    const end = endOfWeek(endOfMonth(monthDate))
    return eachDayOfInterval({ start, end })
  }, [monthDate])

  const dailyData = useMemo(() => {
    const data = new Map<
      string,
      {
        income: number
        expense: number
        balance: number
        transactions: Transaction[]
      }
    >()

    transactions.forEach((tx) => {
      const dateKey = format(new Date(tx.date), 'yyyy-MM-dd')
      const current = data.get(dateKey) || {
        income: 0,
        expense: 0,
        balance: 0,
        transactions: [],
      }

      const amount = Number(tx.amount)
      if (tx.type === 'Receita') {
        current.income += amount
        current.balance += amount
      } else {
        current.expense += amount
        current.balance -= amount
      }
      current.transactions.push(tx)

      data.set(dateKey, current)
    })

    return data
  }, [transactions])

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  return (
    <Card variant="glass" className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-medium">
          Calendário Financeiro
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 min-w-[800px]">
          {/* Header */}
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-muted-foreground py-2 bg-muted/30 rounded-t-md"
            >
              {day}
            </div>
          ))}

          {/* Days */}
          {daysInMonth.map((day, index) => {
            const dateKey = format(day, 'yyyy-MM-dd')
            const data = dailyData.get(dateKey)
            const isCurrentMonth = isSameMonth(day, monthDate)
            const isToday = isSameDay(day, new Date())

            const colIndex = index % 7
            const rowIndex = Math.floor(index / 7)
            const totalRows = Math.ceil(daysInMonth.length / 7)
            const isRightSide = colIndex > 3
            const isBottomHalf = rowIndex >= totalRows - 2 // Flip for last 2 rows

            return (
              <div
                key={dateKey}
                className={`
                  relative group
                  min-h-[100px] p-2 border rounded-md flex flex-col justify-between transition-colors
                  ${
                    isCurrentMonth
                      ? 'bg-card/50 hover:bg-card/80'
                      : 'bg-muted/10 text-muted-foreground opacity-50'
                  }
                  ${isToday ? 'border-primary ring-1 ring-primary' : 'border-border/50'}
                `}
              >
                <div className="flex justify-between items-start">
                  <span
                    className={`text-sm font-medium ${
                      isToday
                        ? 'bg-primary text-primary-foreground w-6 h-6 flex items-center justify-center rounded-full'
                        : ''
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                  {data && (
                    <div className="text-[10px] text-right space-y-0.5">
                      {data.income > 0 && (
                        <div className="text-emerald-400 font-medium">
                          +{formatCurrency(data.income)}
                        </div>
                      )}
                      {data.expense > 0 && (
                        <div className="text-red-400 font-medium">
                          -{formatCurrency(data.expense)}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {data && (data.income > 0 || data.expense > 0) && (
                  <div
                    className={`text-xs font-bold text-right mt-1 pt-1 border-t border-border/30 ${
                      data.balance >= 0 ? 'text-primary' : 'text-red-400'
                    }`}
                  >
                    {formatCurrency(data.balance)}
                  </div>
                )}

                {/* Hover Tooltip */}
                {data && data.transactions.length > 0 && (
                  <div
                    className={`
                      hidden group-hover:block absolute z-50 w-64 p-3
                      bg-popover text-popover-foreground rounded-md border shadow-xl
                      ${isRightSide ? 'right-0' : 'left-0'}
                      ${isBottomHalf ? 'bottom-full mb-2' : 'top-full mt-2'}
                    `}
                  >
                    <div className="text-xs font-semibold mb-2 pb-2 border-b">
                      Transações do dia
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                      {data.transactions.map((tx) => (
                        <div
                          key={tx.id}
                          className="flex justify-between items-center text-xs gap-2"
                        >
                          <span
                            className="truncate flex-1"
                            title={tx.description || ''}
                          >
                            {tx.description || 'Sem descrição'}
                          </span>
                          <span
                            className={`whitespace-nowrap ${
                              tx.type === 'Receita'
                                ? 'text-emerald-400'
                                : 'text-red-400'
                            }`}
                          >
                            {formatCurrency(tx.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
