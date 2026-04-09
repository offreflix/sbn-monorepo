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
  Switch,
} from '@repo/ui'
import { calcMacroGramsFromPct, type GoalsModelOutput } from './goals.model'
import { Plus, RefreshCcw } from 'lucide-react'

const SimpleProgress = ({ value }: { value: number }) => (
  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
    <div
      className="h-full bg-primary transition-all duration-300"
      style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
    />
  </div>
)

export function GoalsView({
  data: { current, history },
  state: { loading, isCreateOpen, saving, form },
  setters: { setIsCreateOpen },
  actions: { reload, openCreate, submitCreateGoal },
  macros: {
    dailyCalories,
    proteinAsPct, carbsAsPct, fatAsPct,
    proteinPct, carbsPct, fatPct,
    totalPct, anyPct,
    proteinReg, carbsReg, fatReg,
    toggleProteinAsPct, toggleCarbsAsPct, toggleFatAsPct,
    onProteinChange, onCarbsChange, onFatChange,
  },
}: GoalsModelOutput) {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Metas</h2>
          <p className="text-muted-foreground">Meta ativa e histórico</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={openCreate} className="gap-2" disabled={loading}>
            <Plus className="h-4 w-4" />
            Nova meta
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
          <CardTitle>Meta atual</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
          ) : !current ? (
            <div className="text-sm text-muted-foreground">
              Nenhuma meta ativa
            </div>
          ) : (
            <div className="space-y-1">
              <div className="text-2xl font-bold tabular-nums">
                {current.dailyCalorieGoal} kcal
              </div>
              <div className="text-sm text-muted-foreground">
                Proteína: {current.proteinGoalG}g · Carbs: {current.carbsGoalG}g
                · Gordura: {current.fatGoalG}g
              </div>
              <div className="text-sm text-muted-foreground">
                Água: {current.waterGoalMl} ml
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card variant="glass">
        <CardHeader>
          <CardTitle>Histórico</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
          ) : history.length === 0 ? (
            <div className="text-sm text-muted-foreground">Sem histórico</div>
          ) : (
            history.map((g) => (
              <div
                key={g.id}
                className="flex items-center justify-between text-sm py-1 border-b border-border last:border-0"
              >
                <div className="text-muted-foreground">{g.activeFrom}</div>
                <div className="text-right">
                  <div className="tabular-nums font-medium">
                    {g.dailyCalorieGoal} kcal
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {g.proteinGoalG}P / {g.carbsGoalG}C / {g.fatGoalG}G ·{' '}
                    {g.waterGoalMl} ml
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova meta</DialogTitle>
            <DialogDescription>
              Defina suas metas diárias de calorias, macros e hidratação.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submitCreateGoal} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goal-calories">Calorias (kcal/dia)</Label>
              <Input
                id="goal-calories"
                {...form.register('dailyCalorieGoal')}
                inputMode="decimal"
                placeholder="2000"
                disabled={saving}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="goal-protein">
                    Proteína ({proteinAsPct ? '%' : 'g'})
                  </Label>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span
                      className={!proteinAsPct ? 'text-foreground' : undefined}
                    >
                      g
                    </span>
                    <Switch
                      checked={proteinAsPct}
                      onCheckedChange={toggleProteinAsPct}
                      disabled={saving}
                      aria-label="Alternar proteína entre gramas e porcentagem"
                    />
                    <span
                      className={proteinAsPct ? 'text-foreground' : undefined}
                    >
                      %
                    </span>
                  </div>
                </div>
                <Input
                  id="goal-protein"
                  {...proteinReg}
                  inputMode="decimal"
                  type={proteinAsPct ? 'number' : undefined}
                  min={proteinAsPct ? 0 : undefined}
                  max={proteinAsPct ? Math.max(0, 100 - carbsPct - fatPct) : undefined}
                  step={proteinAsPct ? 0.1 : undefined}
                  onChange={onProteinChange}
                  placeholder={proteinAsPct ? '30' : '150'}
                  disabled={saving}
                />
                {proteinAsPct && (
                  <div className="space-y-1">
                    <SimpleProgress value={proteinPct} />
                    <div className="text-xs text-muted-foreground tabular-nums">
                      ≈{' '}
                      {calcMacroGramsFromPct(dailyCalories, proteinPct, 4) ??
                        '—'}{' '}
                      g
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="goal-carbs">
                    Carbo ({carbsAsPct ? '%' : 'g'})
                  </Label>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span
                      className={!carbsAsPct ? 'text-foreground' : undefined}
                    >
                      g
                    </span>
                    <Switch
                      checked={carbsAsPct}
                      onCheckedChange={toggleCarbsAsPct}
                      disabled={saving}
                      aria-label="Alternar carbo entre gramas e porcentagem"
                    />
                    <span
                      className={carbsAsPct ? 'text-foreground' : undefined}
                    >
                      %
                    </span>
                  </div>
                </div>
                <Input
                  id="goal-carbs"
                  {...carbsReg}
                  inputMode="decimal"
                  type={carbsAsPct ? 'number' : undefined}
                  min={carbsAsPct ? 0 : undefined}
                  max={carbsAsPct ? Math.max(0, 100 - proteinPct - fatPct) : undefined}
                  step={carbsAsPct ? 0.1 : undefined}
                  onChange={onCarbsChange}
                  placeholder={carbsAsPct ? '45' : '250'}
                  disabled={saving}
                />
                {carbsAsPct && (
                  <div className="space-y-1">
                    <SimpleProgress value={carbsPct} />
                    <div className="text-xs text-muted-foreground tabular-nums">
                      ≈{' '}
                      {calcMacroGramsFromPct(dailyCalories, carbsPct, 4) ?? '—'}{' '}
                      g
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="goal-fat">
                    Gordura ({fatAsPct ? '%' : 'g'})
                  </Label>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className={!fatAsPct ? 'text-foreground' : undefined}>
                      g
                    </span>
                    <Switch
                      checked={fatAsPct}
                      onCheckedChange={toggleFatAsPct}
                      disabled={saving}
                      aria-label="Alternar gordura entre gramas e porcentagem"
                    />
                    <span className={fatAsPct ? 'text-foreground' : undefined}>
                      %
                    </span>
                  </div>
                </div>
                <Input
                  id="goal-fat"
                  {...fatReg}
                  inputMode="decimal"
                  type={fatAsPct ? 'number' : undefined}
                  min={fatAsPct ? 0 : undefined}
                  max={fatAsPct ? Math.max(0, 100 - proteinPct - carbsPct) : undefined}
                  step={fatAsPct ? 0.1 : undefined}
                  onChange={onFatChange}
                  placeholder={fatAsPct ? '25' : '65'}
                  disabled={saving}
                />
                {fatAsPct && (
                  <div className="space-y-1">
                    <SimpleProgress value={fatPct} />
                    <div className="text-xs text-muted-foreground tabular-nums">
                      ≈ {calcMacroGramsFromPct(dailyCalories, fatPct, 9) ?? '—'}{' '}
                      g
                    </div>
                  </div>
                )}
              </div>
            </div>

            {anyPct && (
              <div className="space-y-1 rounded-lg border p-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground tabular-nums">
                  <div>Total (%)</div>
                  <div>{Math.min(Math.max(totalPct, 0), 100)}%</div>
                </div>
                <SimpleProgress value={totalPct} />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="goal-water">Água (ml/dia, opcional)</Label>
              <Input
                id="goal-water"
                {...form.register('waterGoalMl')}
                inputMode="decimal"
                placeholder="2000"
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
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
