import { useEffect, useMemo, useState, useCallback } from 'react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
} from '@repo/ui'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from 'lucide-react'

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
  const [tempYear, setTempYear] = useState(year)

  useEffect(() => {
    setTempYear(year)
  }, [year])

  const monthLabel = useMemo(() => {
    return new Date(year, month - 1, 1)
      .toLocaleString('pt-BR', { month: 'long', year: 'numeric' })
      .replace(/^./, (s) => s.toUpperCase())
  }, [month, year])

  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) =>
        new Date(0, i, 1)
          .toLocaleString('pt-BR', { month: 'short' })
          .replace('.', '')
          .replace(/^./, (s) => s.toUpperCase())
      ),
    []
  )

  const shiftMonth = useCallback(
    (delta: number) => {
      const next = new Date(year, month - 1 + delta, 1)
      onChange(next.getMonth() + 1, next.getFullYear())
    },
    [month, year, onChange]
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Ignore if focused on input fields to not conflict with typing
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

  const handleSelectMonth = (m: number) => {
    onChange(m + 1, tempYear)
    setOpen(false)
  }

  const yearsAround = useMemo(() => {
    const current = new Date().getFullYear()
    const start = current - 10
    return Array.from({ length: 21 }, (_, i) => start + i)
  }, [])

  const today = () => {
    const now = new Date()
    onChange(now.getMonth() + 1, now.getFullYear())
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Mês anterior"
          onClick={() => shiftMonth(-1)}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary" size="sm" className="h-8 px-3">
              <CalendarIcon className="h-4 w-4 mr-2" />
              <span className="capitalize">{monthLabel}</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Selecionar período</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="Ano anterior"
                  onClick={() => setTempYear((y) => y - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={tempYear}
                  onChange={(e) => setTempYear(Number(e.target.value))}
                  className="w-28 h-8 text-center"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="Próximo ano"
                  onClick={() => setTempYear((y) => y + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Quick year list */}
              <div className="max-h-24 overflow-y-auto custom-scrollbar rounded border p-2">
                <div className="flex flex-wrap gap-2">
                  {yearsAround.map((y) => (
                    <Button
                      key={y}
                      variant={y === tempYear ? 'secondary' : 'ghost'}
                      size="sm"
                      className="h-8"
                      onClick={() => setTempYear(y)}
                    >
                      {y}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {months.map((name, idx) => {
                  const selected = idx + 1 === month && tempYear === year
                  return (
                    <Button
                      key={name}
                      variant={selected ? 'default' : 'outline'}
                      size="sm"
                      className="h-9 capitalize"
                      onClick={() => handleSelectMonth(idx)}
                    >
                      {name}
                    </Button>
                  )
                })}
              </div>

              {withTodayButton && (
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" onClick={today}>
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
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
