import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui'
import { formatCurrency } from '../lib/utils'
import type { DashboardYearOverview } from '../types/finance'

export function AnnualCalendar({
  year,
  data,
}: {
  year: number
  data: DashboardYearOverview
}) {
  const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 12 }, (_, idx) => {
        const month = idx + 1
        const monthDate = new Date(year, idx, 1)
        const start = startOfWeek(startOfMonth(monthDate))
        const end = endOfWeek(endOfMonth(monthDate))
        const days = eachDayOfInterval({ start, end })
        const monthAgg = data.months.find((m) => m.month === month)
        const dayMap =
          monthAgg?.days?.reduce<
            Record<number, { income: number; expense: number; balance: number }>
          >((acc, d) => {
            acc[d.day] = {
              income: d.income,
              expense: d.expense,
              balance: d.balance,
            }
            return acc
          }, {}) || {}
        const title = monthDate
          .toLocaleString('pt-BR', { month: 'long' })
          .replace(/^./, (s) => s.toUpperCase())

        return (
          <Card key={month} variant="glass" className="border">
            <CardHeader className="py-3">
              <CardTitle className="text-base font-semibold flex items-center justify-between">
                <span className="capitalize">{title}</span>
                {monthAgg && (
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded ${
                      monthAgg.balance >= 0
                        ? 'bg-primary/10 text-primary'
                        : 'bg-rose-500/10 text-rose-600'
                    }`}
                    title={`Receitas: ${formatCurrency(monthAgg.income)} • Despesas: ${formatCurrency(monthAgg.expense)} • Saldo: ${formatCurrency(monthAgg.balance)}`}
                  >
                    {formatCurrency(monthAgg.balance)}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-7 gap-1">
                {weekDays.map((d) => (
                  <div
                    key={d}
                    className="text-center text-[10px] text-muted-foreground"
                  >
                    {d}
                  </div>
                ))}
                {days.map((day, index) => {
                  const inMonth = isSameMonth(day, monthDate)
                  const dNum = Number(format(day, 'd'))
                  const agg = inMonth ? dayMap[dNum] : undefined
                  const colIndex = index % 7
                  const rowIndex = Math.floor(index / 7)
                  const totalRows = Math.ceil(days.length / 7)
                  const isRightSide = colIndex > 3
                  const isBottomHalf = rowIndex >= totalRows - 2

                  const baseCellClass =
                    'relative group h-10 text-[10px] px-1 py-0.5 flex flex-col items-center justify-center rounded border'
                  const toneClass = !inMonth
                    ? 'bg-muted/10 text-muted-foreground/70 border-transparent'
                    : !agg
                      ? 'bg-card/50 border-border/40'
                      : agg.balance > 0
                        ? 'bg-emerald-500/15 border-emerald-500/40'
                        : agg.balance < 0
                          ? 'bg-rose-500/15 border-rose-500/40'
                          : 'bg-primary/10 border-primary/30'

                  return (
                    <div
                      key={format(day, 'yyyy-MM-dd')}
                      className={`${baseCellClass} ${toneClass}`}
                    >
                      <div className="leading-none">{format(day, 'd')}</div>

                      {agg && (
                        <div
                          className={`pointer-events-none hidden group-hover:block absolute z-50 w-56 p-3 bg-popover text-popover-foreground rounded-md border shadow-xl text-xs
                          ${isRightSide ? 'right-0' : 'left-0'}
                          ${isBottomHalf ? 'bottom-full mb-2' : 'top-full mt-2'}`}
                        >
                          <div className="font-semibold mb-2 border-b pb-1">
                            {format(day, 'dd/MM/yyyy')}
                          </div>
                          <div className="space-y-1">
                            {agg.income > 0 && (
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                  Receitas
                                </span>
                                <span className="text-emerald-500 font-medium">
                                  +{formatCurrency(agg.income)}
                                </span>
                              </div>
                            )}
                            {agg.expense > 0 && (
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                  Despesas
                                </span>
                                <span className="text-rose-500 font-medium">
                                  -{formatCurrency(agg.expense)}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center justify-between pt-1 border-t mt-1">
                              <span className="text-muted-foreground">
                                Saldo
                              </span>
                              <span
                                className={
                                  agg.balance >= 0
                                    ? 'text-primary font-semibold'
                                    : 'text-rose-500 font-semibold'
                                }
                              >
                                {formatCurrency(agg.balance)}
                              </span>
                            </div>
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
      })}
    </div>
  )
}
