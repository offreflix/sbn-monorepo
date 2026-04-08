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
import { Plus, RefreshCcw, Trash2 } from "lucide-react";

export function MeasurementsView({
  data: { items },
  state: { loading, isCreateOpen, saving, deletingId, form },
  setters: { setIsCreateOpen },
  actions: { reload, openCreate, submitCreateMeasurement, deleteMeasurement },
}: MeasurementsModelOutput) {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Medidas</h2>
          <p className="text-muted-foreground">Peso diário</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={openCreate} className="gap-2" disabled={loading}>
            <Plus className="h-4 w-4" />
            Registrar
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => reload()}
            className="h-9 w-9"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card variant="glass">
        <CardHeader>
          <CardTitle>Registros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
          ) : items.length === 0 ? (
            <div className="text-sm text-muted-foreground">Sem registros</div>
          ) : (
            items.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between text-sm"
              >
                <div className="text-muted-foreground">{m.measuredAt}</div>
                <div className="flex items-center gap-2">
                  <div className="tabular-nums font-medium">
                    {m.weightKg ? `${m.weightKg} kg` : "—"}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    onClick={() => deleteMeasurement(m.id)}
                    disabled={deletingId === m.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar medida</DialogTitle>
            <DialogDescription>
              Informe seu peso para o dia selecionado.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submitCreateMeasurement} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="weight-kg">Peso (kg)</Label>
              <Input
                id="weight-kg"
                {...form.register("weightKg")}
                inputMode="decimal"
                placeholder="70.5"
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsCreateOpen(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
