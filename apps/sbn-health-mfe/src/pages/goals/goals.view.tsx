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
import {
  Plus,
  RefreshCcw,
  Target,
  History,
  Flame,
  Dumbbell,
  Wheat,
  Droplets,
  Calendar,
} from 'lucide-react'

// Barra de progresso atualizada para aceitar cores dinâmicas
const SimpleProgress = ({
  value,
  colorClass = 'bg-primary',
}: {
  value: number
  colorClass?: string
}) => (
  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
    <div
      className={`h-full ${colorClass} transition-all duration-300`}
      style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
    />
  </div>
)

export function GoalsView({
  data: { current, history },
  state: { loading, isCreateOpen, saving, form, isEditing },
  setters: { setIsCreateOpen },
  actions: { reload, openCreate, submitCreateGoal },
  macros: {
    dailyCalories,
    proteinAsPct,
    carbsAsPct,
    fatAsPct,
    proteinPct,
    carbsPct,
    fatPct,
    totalPct,
    anyPct,
    proteinReg,
    carbsReg,
    fatReg,
    toggleProteinAsPct,
    toggleCarbsAsPct,
    toggleFatAsPct,
    onProteinChange,
    onCarbsChange,
    onFatChange,
  },
}: GoalsModelOutput) {
  const { errors } = form.formState

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Metas
          </h2>
          <p className="text-muted-foreground mt-1">
            Configure seus objetivos nutricionais
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
              className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
            />
          </Button>
          <Button
            onClick={openCreate}
            className="gap-2 h-10"
            disabled={loading}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">
              {isEditing ? 'Editar Meta' : 'Nova Meta'}
            </span>
            <span className="sm:hidden">{isEditing ? 'Editar' : 'Nova'}</span>
          </Button>
        </div>
      </header>

      {/* Grid Principal */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Meta Atual (Destaque) */}
        <div className="lg:col-span-5">
          <Card
            variant="glass"
            className="h-full border-primary/20 bg-primary/5"
          >
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Meta Ativa
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  <div className="h-8 w-1/2 bg-muted animate-pulse rounded" />
                  <div className="h-16 w-full bg-muted animate-pulse rounded" />
                </div>
              ) : !current ? (
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-3 text-muted-foreground">
                  <Target className="h-10 w-10 opacity-20" />
                  <p className="text-sm">Você ainda não definiu uma meta.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openCreate}
                    className="mt-2"
                  >
                    Criar Primeira Meta
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Destaque Calorias */}
                  <div className="flex items-center gap-4 border-b border-primary/10 pb-4">
                    <div className="h-14 w-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                      <Flame className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">
                        Calorias Diárias
                      </p>
                      <div className="text-3xl font-extrabold text-foreground tabular-nums tracking-tight">
                        {current.dailyCalorieGoal}{' '}
                        <span className="text-lg font-medium text-muted-foreground">
                          kcal
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Detalhes Macros e Água */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-500 uppercase">
                        <Dumbbell className="h-3.5 w-3.5" /> Proteína
                      </div>
                      <p className="text-lg font-bold tabular-nums text-foreground">
                        {current.proteinGoalG}g
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-500 uppercase">
                        <Wheat className="h-3.5 w-3.5" /> Carbo
                      </div>
                      <p className="text-lg font-bold tabular-nums text-foreground">
                        {current.carbsGoalG}g
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 uppercase">
                        <Flame className="h-3.5 w-3.5" /> Gordura
                      </div>
                      <p className="text-lg font-bold tabular-nums text-foreground">
                        {current.fatGoalG}g
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-500 uppercase">
                        <Droplets className="h-3.5 w-3.5" /> Água
                      </div>
                      <p className="text-lg font-bold tabular-nums text-foreground">
                        {current.waterGoalMl} ml
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Histórico de Metas */}
        <div className="lg:col-span-7">
          <Card variant="glass" className="h-full flex flex-col">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <History className="h-5 w-5 text-muted-foreground" />
                Histórico
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex-1">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-14 w-full bg-muted animate-pulse rounded-md"
                    />
                  ))}
                </div>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-8 text-center text-muted-foreground">
                  <History className="h-10 w-10 opacity-20 mb-2" />
                  <p className="text-sm">Nenhum histórico encontrado.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map((g) => (
                    <div
                      key={g.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border bg-card/50 hover:bg-muted/30 transition-colors gap-3"
                    >
                      <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium bg-muted/50 w-fit px-2.5 py-1 rounded-md shrink-0">
                        <Calendar className="h-3.5 w-3.5" />
                        {g.activeFrom}
                      </div>

                      <div className="flex flex-wrap items-center sm:justify-end gap-x-4 gap-y-1 text-sm">
                        <div className="font-bold text-foreground flex items-center gap-1.5">
                          <Flame className="h-4 w-4 text-orange-500" />
                          {g.dailyCalorieGoal} kcal
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold">
                          <span className="text-blue-500">
                            {g.proteinGoalG}P
                          </span>
                          <span className="text-muted-foreground/30">•</span>
                          <span className="text-amber-500">
                            {g.carbsGoalG}C
                          </span>
                          <span className="text-muted-foreground/30">•</span>
                          <span className="text-rose-500">{g.fatGoalG}G</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Criação / Edição */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Meta' : 'Nova Meta'}</DialogTitle>
            <DialogDescription>
              Defina suas metas diárias. Você pode informar os macros em gramas
              ou em porcentagem (%).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submitCreateGoal} className="space-y-6 mt-2">
            {/* Bloco 1: Geral */}
            <div className="space-y-4 bg-muted/20 p-4 rounded-lg border border-border/50">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Geral
              </h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="goal-calories"
                    className="text-orange-600 dark:text-orange-400 font-medium"
                  >
                    Calorias (kcal) *
                  </Label>
                  <Input
                    id="goal-calories"
                    {...form.register('dailyCalorieGoal')}
                    inputMode="decimal"
                    placeholder="Ex: 2000"
                    disabled={saving}
                    className={
                      errors.dailyCalorieGoal
                        ? 'border-destructive'
                        : 'border-orange-500/30 focus-visible:ring-orange-500'
                    }
                  />
                  {errors.dailyCalorieGoal && (
                    <span className="text-xs text-destructive">
                      {errors.dailyCalorieGoal.message as string}
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="goal-water"
                    className="text-cyan-600 dark:text-cyan-400 font-medium"
                  >
                    Água (ml)
                  </Label>
                  <Input
                    id="goal-water"
                    {...form.register('waterGoalMl')}
                    inputMode="decimal"
                    placeholder="Ex: 2500"
                    disabled={saving}
                    className="border-cyan-500/30 focus-visible:ring-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Bloco 2: Macronutrientes */}
            <div className="space-y-5 bg-muted/20 p-4 rounded-lg border border-border/50">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Macronutrientes
              </h4>
              <div className="grid gap-5 sm:grid-cols-3">
                {/* Proteína */}
                <div className="space-y-2.5">
                  <div className="space-y-2">
                    <Label
                      htmlFor="goal-protein"
                      className="text-blue-500 font-medium"
                    >
                      Proteína
                    </Label>
                    <div className="flex">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground bg-background border px-1.5 py-0.5 rounded-full">
                        <span
                          className={
                            !proteinAsPct ? 'text-foreground' : 'opacity-50'
                          }
                        >
                          G
                        </span>
                        <Switch
                          checked={proteinAsPct}
                          onCheckedChange={toggleProteinAsPct}
                          disabled={saving}
                          className="scale-75 data-[state=checked]:bg-blue-500"
                        />
                        <span
                          className={
                            proteinAsPct ? 'text-foreground' : 'opacity-50'
                          }
                        >
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                  <Input
                    id="goal-protein"
                    {...proteinReg}
                    inputMode="decimal"
                    type={proteinAsPct ? 'number' : undefined}
                    min={proteinAsPct ? 0 : undefined}
                    max={
                      proteinAsPct
                        ? Math.max(0, 100 - carbsPct - fatPct)
                        : undefined
                    }
                    step={proteinAsPct ? 0.1 : undefined}
                    onChange={onProteinChange}
                    placeholder={proteinAsPct ? '30' : '150'}
                    disabled={saving}
                    className={
                      errors.proteinGoalG
                        ? 'border-destructive'
                        : 'border-blue-500/30'
                    }
                  />
                  {proteinAsPct && (
                    <div className="space-y-1.5 animate-in fade-in">
                      <SimpleProgress
                        value={proteinPct}
                        colorClass="bg-blue-500"
                      />
                      <div className="text-[11px] text-muted-foreground tabular-nums text-right font-medium">
                        ≈{' '}
                        {calcMacroGramsFromPct(dailyCalories, proteinPct, 4) ??
                          '0'}
                        g
                      </div>
                    </div>
                  )}
                </div>

                {/* Carbo */}
                <div className="space-y-2.5">
                  <div className="space-y-2">
                    <Label
                      htmlFor="goal-carbs"
                      className="text-amber-500 font-medium"
                    >
                      Carbo
                    </Label>
                    <div className="flex">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground bg-background border px-1.5 py-0.5 rounded-full">
                        <span
                          className={
                            !carbsAsPct ? 'text-foreground' : 'opacity-50'
                          }
                        >
                          G
                        </span>
                        <Switch
                          checked={carbsAsPct}
                          onCheckedChange={toggleCarbsAsPct}
                          disabled={saving}
                          className="scale-75 data-[state=checked]:bg-amber-500"
                        />
                        <span
                          className={
                            carbsAsPct ? 'text-foreground' : 'opacity-50'
                          }
                        >
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                  <Input
                    id="goal-carbs"
                    {...carbsReg}
                    inputMode="decimal"
                    type={carbsAsPct ? 'number' : undefined}
                    min={carbsAsPct ? 0 : undefined}
                    max={
                      carbsAsPct
                        ? Math.max(0, 100 - proteinPct - fatPct)
                        : undefined
                    }
                    step={carbsAsPct ? 0.1 : undefined}
                    onChange={onCarbsChange}
                    placeholder={carbsAsPct ? '45' : '250'}
                    disabled={saving}
                    className={
                      errors.carbsGoalG
                        ? 'border-destructive'
                        : 'border-amber-500/30'
                    }
                  />
                  {carbsAsPct && (
                    <div className="space-y-1.5 animate-in fade-in">
                      <SimpleProgress
                        value={carbsPct}
                        colorClass="bg-amber-500"
                      />
                      <div className="text-[11px] text-muted-foreground tabular-nums text-right font-medium">
                        ≈{' '}
                        {calcMacroGramsFromPct(dailyCalories, carbsPct, 4) ??
                          '0'}
                        g
                      </div>
                    </div>
                  )}
                </div>

                {/* Gordura */}
                <div className="space-y-2.5">
                  <div className="space-y-2">
                    <Label
                      htmlFor="goal-fat"
                      className="text-rose-500 font-medium"
                    >
                      Gordura
                    </Label>
                    <div className="flex">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground bg-background border px-1.5 py-0.5 rounded-full">
                        <span
                          className={
                            !fatAsPct ? 'text-foreground' : 'opacity-50'
                          }
                        >
                          G
                        </span>
                        <Switch
                          checked={fatAsPct}
                          onCheckedChange={toggleFatAsPct}
                          disabled={saving}
                          className="scale-75 data-[state=checked]:bg-rose-500"
                        />
                        <span
                          className={
                            fatAsPct ? 'text-foreground' : 'opacity-50'
                          }
                        >
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                  <Input
                    id="goal-fat"
                    {...fatReg}
                    inputMode="decimal"
                    type={fatAsPct ? 'number' : undefined}
                    min={fatAsPct ? 0 : undefined}
                    max={
                      fatAsPct
                        ? Math.max(0, 100 - proteinPct - carbsPct)
                        : undefined
                    }
                    step={fatAsPct ? 0.1 : undefined}
                    onChange={onFatChange}
                    placeholder={fatAsPct ? '25' : '65'}
                    disabled={saving}
                    className={
                      errors.fatGoalG
                        ? 'border-destructive'
                        : 'border-rose-500/30'
                    }
                  />
                  {fatAsPct && (
                    <div className="space-y-1.5 animate-in fade-in">
                      <SimpleProgress value={fatPct} colorClass="bg-rose-500" />
                      <div className="text-[11px] text-muted-foreground tabular-nums text-right font-medium">
                        ≈{' '}
                        {calcMacroGramsFromPct(dailyCalories, fatPct, 9) ?? '0'}
                        g
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Barra de Total Geral (%) */}
              {anyPct && (
                <div className="pt-2 animate-in fade-in">
                  <div
                    className={`p-3 rounded-lg border ${totalPct === 100 ? 'bg-emerald-500/10 border-emerald-500/30' : totalPct > 100 ? 'bg-destructive/10 border-destructive/30' : 'bg-background'}`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold tabular-nums mb-2">
                      <span className="text-muted-foreground uppercase tracking-wider">
                        Total Macros
                      </span>
                      <span
                        className={
                          totalPct === 100
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : totalPct > 100
                              ? 'text-destructive'
                              : 'text-foreground'
                        }
                      >
                        {Math.min(Math.max(totalPct, 0), 100)}%
                      </span>
                    </div>
                    <SimpleProgress
                      value={totalPct}
                      colorClass={
                        totalPct > 100
                          ? 'bg-destructive'
                          : totalPct === 100
                            ? 'bg-emerald-500'
                            : 'bg-primary'
                      }
                    />
                    {totalPct !== 100 && (
                      <p className="text-[10px] text-muted-foreground mt-1.5 text-right">
                        A soma das porcentagens deve ser exatos 100%.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Ações */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t mt-6">
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
                disabled={saving || (anyPct && totalPct !== 100)}
                className="min-w-[120px]"
              >
                {saving ? 'Salvando...' : 'Salvar Meta'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
