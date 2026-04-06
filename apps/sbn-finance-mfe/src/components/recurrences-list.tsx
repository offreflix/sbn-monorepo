import { Trash2, TrendingDown, TrendingUp } from 'lucide-react'
import type { Recurrence } from '../pages/recurrences/recurrences.type'
import { Button } from '@repo/ui'

const FREQUENCY_LABEL: Record<string, string> = {
  MONTHLY: 'Mensal',
  WEEKLY: 'Semanal',
}

export function RecurrenceList({
  recurrences,
  setDeletingId,
}: {
  recurrences: Recurrence[]
  setDeletingId?: (id: string) => void
}) {
  return (
    <div className="space-y-3">
      {recurrences.map((recurrence) => (
        <div
          key={recurrence.id}
          className="glass-dark rounded-xl p-4 flex items-center justify-between gap-4 group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                recurrence.type === 'Receita'
                  ? 'bg-emerald-500/20'
                  : 'bg-red-500/20'
              }`}
            >
              {recurrence.type === 'Receita' ? (
                <TrendingUp className="h-5 w-5 text-emerald-400" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-400" />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm text-foreground truncate">
                {recurrence.description || 'Sem descrição'}
              </p>
              <p className="text-xs text-muted-foreground">
                {FREQUENCY_LABEL[recurrence.frequency] ?? recurrence.frequency}
                {' · '}
                Desde{' '}
                {new Date(recurrence.startDate).toLocaleDateString('pt-BR')}
                {!recurrence.active && (
                  <span className="ml-2 text-yellow-500">Inativa</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <span
              className={`text-sm font-semibold ${
                recurrence.type === 'Receita'
                  ? 'text-emerald-400'
                  : 'text-red-400'
              }`}
            >
              {recurrence.type === 'Despesa' ? '- ' : '+ '}
              R${' '}
              {Number(recurrence.amount).toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
              })}
            </span>
            {setDeletingId && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setDeletingId(recurrence.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
