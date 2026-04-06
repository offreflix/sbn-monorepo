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
} from "@repo/ui";
import {
  TrendingUp,
  TrendingDown,
  Trash2,
  RefreshCcw,
  Repeat,
} from "lucide-react";
import type { RecurrencesModelOutput } from "./recurrences.model";

const FREQUENCY_LABEL: Record<string, string> = {
  MONTHLY: "Mensal",
  WEEKLY: "Semanal",
};

export function RecurrencesView({
  data: { recurrences },
  state: { loading, deletingId, isDeleting },
  setters: { setDeletingId },
  actions: { handleDelete, loadRecurrences },
}: RecurrencesModelOutput) {
  const deletingRecurrence = recurrences.find((r) => r.id === deletingId);

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
        <div className="space-y-3">
          {recurrences.map((recurrence) => (
            <div
              key={recurrence.id}
              className="glass-dark rounded-xl p-4 flex items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    recurrence.type === "Receita"
                      ? "bg-emerald-500/20"
                      : "bg-red-500/20"
                  }`}
                >
                  {recurrence.type === "Receita" ? (
                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">
                    {recurrence.description || "Sem descrição"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {FREQUENCY_LABEL[recurrence.frequency] ??
                      recurrence.frequency}
                    {" · "}
                    Desde{" "}
                    {new Date(recurrence.startDate).toLocaleDateString("pt-BR")}
                    {!recurrence.active && (
                      <span className="ml-2 text-yellow-500">Inativa</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <span
                  className={`text-sm font-semibold ${
                    recurrence.type === "Receita"
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {recurrence.type === "Despesa" ? "- " : "+ "}
                  R${" "}
                  {Number(recurrence.amount).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setDeletingId(recurrence.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Recorrência</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a recorrência{" "}
              <strong>
                {deletingRecurrence?.description || "sem descrição"}
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
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
