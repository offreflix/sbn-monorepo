import { Navigate, Route, Routes } from 'react-router-dom'
import { Button, Input } from '@repo/ui'
import { Toaster } from 'sonner'
import {
  Activity,
  Droplets,
  Ruler,
  Target,
  Utensils,
  NotebookPen,
  RefreshCcw,
} from 'lucide-react'
import type { AppModelOutput } from './app.model'
import { SummaryPage } from './pages/summary/page'
import { FoodsPage } from './pages/foods/page'
import { MealLogsPage } from './pages/meal-logs/page'
import { WaterLogsPage } from './pages/water-logs/page'
import { MeasurementsPage } from './pages/measurements/page'
import { GoalsPage } from './pages/goals/page'

export function AppView({
  state: { selectedDate },
  setters: { setSelectedDate },
  actions: { isTabActive, handleNavigate },
}: AppModelOutput) {
  return (
    <>
      <Toaster position="top-right" />
      <div className="w-full min-h-screen bg-background text-foreground">
        <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold tracking-tight">Saúde</h1>
              <div className="h-6 w-px bg-border hidden sm:block" />

              <div className="flex items-center gap-2">
                <Button
                  variant={isTabActive('') ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => handleNavigate('.')}
                  className="gap-2"
                >
                  <Activity className="h-4 w-4" />
                  Resumo
                </Button>
                <Button
                  variant={isTabActive('foods') ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => handleNavigate('foods')}
                  className="gap-2"
                >
                  <Utensils className="h-4 w-4" />
                  Alimentos
                </Button>
                <Button
                  variant={isTabActive('meal-logs') ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => handleNavigate('meal-logs')}
                  className="gap-2"
                >
                  <NotebookPen className="h-4 w-4" />
                  Refeições
                </Button>
                <Button
                  variant={isTabActive('water-logs') ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => handleNavigate('water-logs')}
                  className="gap-2"
                >
                  <Droplets className="h-4 w-4" />
                  Água
                </Button>
                <Button
                  variant={isTabActive('measurements') ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => handleNavigate('measurements')}
                  className="gap-2"
                >
                  <Ruler className="h-4 w-4" />
                  Medidas
                </Button>
                <Button
                  variant={isTabActive('goals') ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => handleNavigate('goals')}
                  className="gap-2"
                >
                  <Target className="h-4 w-4" />
                  Metas
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-9 w-[160px]"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setSelectedDate(new Date().toISOString().split('T')[0])
                }
                className="h-8 w-8"
                title="Ir para hoje"
              >
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 space-y-8">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route
                index
                element={<SummaryPage selectedDate={selectedDate} />}
              />
              <Route path="foods" element={<FoodsPage />} />
              <Route
                path="meal-logs"
                element={<MealLogsPage selectedDate={selectedDate} />}
              />
              <Route
                path="water-logs"
                element={<WaterLogsPage selectedDate={selectedDate} />}
              />
              <Route
                path="measurements"
                element={<MeasurementsPage selectedDate={selectedDate} />}
              />
              <Route
                path="goals"
                element={<GoalsPage selectedDate={selectedDate} />}
              />
              <Route path="*" element={<Navigate to="." replace />} />
            </Routes>
          </div>
        </main>
      </div>

      <div
        className="hidden md:flex lg:flex xl:flex"
        style={{ display: 'none' }}
      />
    </>
  )
}
