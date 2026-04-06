import {
  Button,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@repo/ui'
import { RefreshCcw, Repeat } from 'lucide-react'
import type { RecurrencesModelOutput } from './recurrences.model'
import { RecurrenceList } from '../../components/recurrences-list'

export function RecurrencesView({
  data: { recurrences },
  state: { loading, deletingId, isDeleting },
  setters: { setDeletingId },
  actions: { handleDelete, loadRecurrences },
}: RecurrencesModelOutput) {
  const deletingRecurrence = recurrences.find((r) => r.id === deletingId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Recorrências</h2>
          <p className="text-muted-foreground">
            Transações recorrentes cadastradas
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => loadRecurrences()}
          className="h-8 w-8"
        >
          <RefreshCcw className="h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Carregando...
        </div>
      ) : recurrences.length === 0 ? (
        <div className="glass-dark rounded-xl p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto mb-4">
            <Repeat className="h-6 w-6" />
          </div>
          <h4 className="font-medium text-foreground mb-1">
            Nenhuma recorrência cadastrada
          </h4>
          <p className="text-sm text-muted-foreground">
            Crie uma transação marcando "É recorrente?" para registrar aqui.
          </p>
        </div>
      ) : (
        <RecurrenceList
          recurrences={recurrences}
          setDeletingId={setDeletingId}
        />
      )}

      <AlertDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Recorrência</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a recorrência{' '}
              <strong>
                {deletingRecurrence?.description || 'sem descrição'}
              </strong>
              ? As transações já criadas não serão afetadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
