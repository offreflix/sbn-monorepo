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
import type { WaterLogsModelOutput } from "./water-logs.model";
import { Plus, RefreshCcw, Trash2 } from "lucide-react";
import { formatNumber } from "../../lib/utils";

export function WaterLogsView({
  data: { entries, totalMl },
  state: { loading, isCreateOpen, saving, deletingId, form },
  setters: { setIsCreateOpen },
  actions: { reload, openCreate, submitCreateWaterLog, deleteWaterLog },
}: WaterLogsModelOutput) {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Água</h2>
          <p className="text-muted-foreground">Registros do dia</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={openCreate} className="gap-2" disabled={loading}>
            <Plus className="h-4 w-4" />
            Adicionar
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

      <div className="grid gap-4 lg:grid-cols-2">
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Total do dia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">
              {loading ? (
                <div className="h-6 w-24 bg-muted animate-pulse rounded" />
              ) : (
                `${formatNumber(totalMl)} ml`
              )}
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardHeader>
            <CardTitle>Entradas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
            ) : entries.length === 0 ? (
              <div className="text-sm text-muted-foreground">Sem registros</div>
            ) : (
              entries.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="text-muted-foreground">{e.loggedDate}</div>
                  <div className="flex items-center gap-2">
                    <div className="tabular-nums font-medium">
                      {formatNumber(e.volumeMl)} ml
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => deleteWaterLog(e.id)}
                      disabled={deletingId === e.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar água</DialogTitle>
            <DialogDescription>
              Registre o volume de água consumido.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submitCreateWaterLog} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="water-volume">Volume (ml)</Label>
              <Input
                id="water-volume"
                {...form.register("volumeMl")}
                inputMode="decimal"
                placeholder="250"
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
