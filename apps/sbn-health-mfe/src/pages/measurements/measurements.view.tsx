import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from "@repo/ui";
import type { MeasurementsModelOutput } from "./measurements.model";
import { Plus, RefreshCcw, Trash2, Scale, CalendarDays } from "lucide-react";

export function MeasurementsView({
  data: { items },
  state: { loading, isCreateOpen, saving, deletingId, form },
  setters: { setIsCreateOpen },
  actions: { reload, openCreate, submitCreateMeasurement, deleteMeasurement },
}: MeasurementsModelOutput) {
  const { errors } = form.formState;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Medidas
          </h2>
          <p className="text-muted-foreground mt-1">
            Acompanhe seu peso corporal
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => reload()}
            disabled={loading}
            className="h-10 w-10 shrink-0"
            title="Atualizar dados"
          >
            <RefreshCcw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
          </Button>
          <Button
            onClick={openCreate}
            className="gap-2 h-10"
            disabled={loading}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Registrar Peso</span>
            <span className="sm:hidden">Registrar</span>
          </Button>
        </div>
      </header>

      {/* Histórico */}
      <Card variant="glass" className="overflow-hidden">
        <CardHeader className="bg-muted/20 border-b pb-4">
          <CardTitle className="text-base flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              <span>Histórico de Registros</span>
            </div>
            <span className="text-xs font-normal text-muted-foreground bg-background border px-2 py-0.5 rounded-full">
              {loading
                ? "—"
                : `${items.length} ${items.length === 1 ? "registro" : "registros"}`}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="divide-y p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center pt-2">
                  <div className="h-5 bg-muted animate-pulse rounded w-32" />
                  <div className="h-6 bg-muted animate-pulse rounded w-16" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3 text-muted-foreground">
              <Scale className="h-12 w-12 opacity-20 text-primary" />
              <p className="text-sm">Nenhum registro de peso encontrado.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={openCreate}
                className="mt-2"
              >
                Fazer o primeiro registro
              </Button>
            </div>
          ) : (
            <div className="divide-y p-2">
              {items.map((m) => (
                <div
                  key={m.id}
                  className="group flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary shrink-0">
                      <CalendarDays className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {m.measuredAt}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="tabular-nums font-bold text-lg text-foreground">
                      {m.weightKg ? (
                        <>
                          {m.weightKg}{" "}
                          <span className="text-sm text-muted-foreground font-medium">
                            kg
                          </span>
                        </>
                      ) : (
                        "—"
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all focus:opacity-100 sm:opacity-100"
                      onClick={() => deleteMeasurement(m.id)}
                      disabled={deletingId === m.id}
                      title="Excluir medida"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Criação */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              Registrar Peso
            </DialogTitle>
            <DialogDescription>
              Informe seu peso corporal para a data selecionada.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submitCreateMeasurement} className="space-y-6 mt-2">
            <div className="space-y-2 bg-muted/20 p-5 rounded-xl border border-border/50">
              <Label
                htmlFor="weight-kg"
                className="text-sm font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Peso Atual
              </Label>
              <div className="relative mt-2">
                <Input
                  id="weight-kg"
                  {...form.register("weightKg")}
                  inputMode="decimal"
                  placeholder="Ex: 70.5"
                  disabled={saving}
                  className={`pl-4 pr-12 text-xl font-medium h-14 ${errors.weightKg ? "border-destructive focus-visible:ring-destructive" : "border-primary/30 focus-visible:ring-primary"}`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                  kg
                </span>
              </div>
              {errors.weightKg && (
                <span className="text-xs text-destructive mt-1 inline-block">
                  {errors.weightKg.message as string}
                </span>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                type="button"
                onClick={() => setIsCreateOpen(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving} className="min-w-[120px]">
                {saving ? "Salvando..." : "Salvar Registro"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
