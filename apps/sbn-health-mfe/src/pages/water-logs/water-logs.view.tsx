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
import { Plus, RefreshCcw, Trash2, Droplets, GlassWater } from "lucide-react";
import { formatNumber } from "../../lib/utils";

export function WaterLogsView({
  data: { entries, totalMl },
  state: { loading, isCreateOpen, saving, deletingId, form },
  setters: { setIsCreateOpen },
  actions: { reload, openCreate, submitCreateWaterLog, deleteWaterLog },
}: WaterLogsModelOutput) {
  const { errors } = form.formState;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Água
          </h2>
          <p className="text-muted-foreground mt-1">
            Acompanhe sua hidratação diária
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
            <span className="hidden sm:inline">Adicionar Água</span>
            <span className="sm:hidden">Adicionar</span>
          </Button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Card do Total (Destaque) */}
        <div className="lg:col-span-5">
          <Card
            variant="glass"
            className="bg-cyan-500/5 border-cyan-500/20 h-full flex flex-col justify-center"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Droplets className="h-4 w-4" />
                Volume Consumido
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-12 w-32 bg-muted animate-pulse rounded-lg" />
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold tabular-nums text-foreground tracking-tight">
                    {formatNumber(totalMl)}
                  </span>
                  <span className="text-lg font-medium text-muted-foreground">
                    ml
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Card do Histórico (Entradas) */}
        <div className="lg:col-span-7">
          <Card variant="glass" className="h-full flex flex-col">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="text-base font-medium flex items-center justify-between">
                <span>Histórico do dia</span>
                <span className="text-xs font-normal text-muted-foreground bg-background px-2 py-0.5 rounded-full border">
                  {loading
                    ? "—"
                    : `${entries.length} ${entries.length === 1 ? "registro" : "registros"}`}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex-1">
              {loading ? (
                <div className="space-y-3">
                  <div className="h-12 w-full bg-muted animate-pulse rounded-md" />
                  <div className="h-12 w-full bg-muted animate-pulse rounded-md" />
                </div>
              ) : entries.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-8 text-center space-y-3 text-muted-foreground">
                  <Droplets className="h-10 w-10 opacity-20 text-cyan-500" />
                  <p className="text-sm">Você ainda não bebeu água hoje.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {entries.map((e) => (
                    <div
                      key={e.id}
                      className="group flex items-center justify-between p-3 rounded-lg border bg-card/50 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                          <Droplets className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">
                          {e.loggedDate}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="tabular-nums font-bold text-foreground">
                          {formatNumber(e.volumeMl)} ml
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all focus:opacity-100 sm:opacity-100"
                          onClick={() => deleteWaterLog(e.id)}
                          disabled={deletingId === e.id}
                          title="Excluir registro"
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
        </div>
      </div>

      {/* Modal de Adição */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-cyan-500" />
              Registrar Água
            </DialogTitle>
            <DialogDescription>
              Informe o volume consumido ou use um dos atalhos abaixo.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submitCreateWaterLog} className="space-y-6 mt-2">
            <div className="space-y-4">
              {/* Input Principal */}
              <div className="space-y-2">
                <Label
                  htmlFor="water-volume"
                  className="text-foreground font-medium"
                >
                  Volume (ml)
                </Label>
                <div className="relative">
                  <Input
                    id="water-volume"
                    {...form.register("volumeMl")}
                    inputMode="decimal"
                    placeholder="Ex: 250"
                    disabled={saving}
                    className={`pl-4 pr-12 text-lg h-12 ${errors.volumeMl ? "border-destructive" : "border-cyan-500/30 focus-visible:ring-cyan-500"}`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                    ml
                  </span>
                </div>
                {errors.volumeMl && (
                  <span className="text-xs text-destructive">
                    {errors.volumeMl.message as string}
                  </span>
                )}
              </div>

              {/* Atalhos Rápidos (UX Win) */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Atalhos rápidos
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="text-xs h-10 border-cyan-500/20 hover:bg-cyan-500/10 hover:text-cyan-600"
                    onClick={() =>
                      form.setValue("volumeMl", "200", { shouldValidate: true })
                    }
                  >
                    Copo (200)
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="text-xs h-10 border-cyan-500/20 hover:bg-cyan-500/10 hover:text-cyan-600"
                    onClick={() =>
                      form.setValue("volumeMl", "350", { shouldValidate: true })
                    }
                  >
                    Caneca (350)
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="text-xs h-10 border-cyan-500/20 hover:bg-cyan-500/10 hover:text-cyan-600"
                    onClick={() =>
                      form.setValue("volumeMl", "500", { shouldValidate: true })
                    }
                  >
                    Garrafa (500)
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button
                variant="ghost"
                type="button"
                onClick={() => setIsCreateOpen(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="min-w-[120px] bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                {saving ? "Salvando..." : "Registrar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
