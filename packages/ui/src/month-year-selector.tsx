import { useEffect, useMemo, useState, useCallback } from 'react'
import { Button } from './button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog'
import { Calendar } from './calendar'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from 'lucide-react'
import { ptBR } from 'date-fns/locale'

export function MonthYearSelector({
  month,
  year,
  onChange,
  className,
  withTodayButton = true,
}: {
  month: number // 1-12
  year: number
  onChange: (month: number, year: number) => void
  className?: string
  withTodayButton?: boolean
}) {
  const [open, setOpen] = useState(false)

  const selectedDate = useMemo(
    () => new Date(year, month - 1, 1),
    [month, year],
  )

  const monthLabel = useMemo(() => {
    return new Date(year, month - 1, 1)
      .toLocaleString('pt-BR', { month: 'long', year: 'numeric' })
      .replace(/^./, (s) => s.toUpperCase())
  }, [month, year])

  const shiftMonth = useCallback(
    (delta: number) => {
      const next = new Date(year, month - 1 + delta, 1)
      onChange(next.getMonth() + 1, next.getFullYear())
    },
    [month, year, onChange],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase()
      if (['input', 'textarea', 'select'].includes(activeTag)) return
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        shiftMonth(-1)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        shiftMonth(1)
      } else if (e.key.toLowerCase() === 't') {
        e.preventDefault()
        const now = new Date()
        onChange(now.getMonth() + 1, now.getFullYear())
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [shiftMonth, onChange])

  const handleDaySelect = (date: Date | undefined) => {
    if (!date) return
    onChange(date.getMonth() + 1, date.getFullYear())
    setOpen(false)
  }

  const isCurrentMonthYear = useMemo(() => {
    const now = new Date()
    return month === now.getMonth() + 1 && year === now.getFullYear()
  }, [month, year])

  const goToToday = () => {
    const now = new Date()
    onChange(now.getMonth() + 1, now.getFullYear())
    setOpen(false)
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Mês anterior"
          onClick={() => shiftMonth(-1)}
          className="h-9 w-9 rounded-lg"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-4 gap-2 font-medium rounded-lg"
            >
              <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="capitalize">{monthLabel}</span>
            </Button>
          </DialogTrigger>

          <DialogContent className="w-auto p-0 overflow-hidden" showCloseButton={false}>
            <DialogHeader className="sr-only">
              <DialogTitle>Selecionar período</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col">
              <Calendar
                className="w-full"
                mode="single"
                selected={selectedDate}
                defaultMonth={selectedDate}
                onSelect={handleDaySelect}
                captionLayout="dropdown"
                locale={ptBR}
                startMonth={new Date(new Date().getFullYear() - 10, 0)}
                endMonth={new Date(new Date().getFullYear() + 5, 11)}
              />

              {withTodayButton && (
                <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">
                      ← →
                    </kbd>
                    navegar
                    <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono ml-1">
                      T
                    </kbd>
                    hoje
                  </span>
                  <Button
                    variant={isCurrentMonthYear ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={goToToday}
                    className="h-8 text-xs"
                  >
                    Ir para hoje
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Button
          variant="ghost"
          size="icon"
          aria-label="Próximo mês"
          onClick={() => shiftMonth(1)}
          className="h-9 w-9 rounded-lg"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
