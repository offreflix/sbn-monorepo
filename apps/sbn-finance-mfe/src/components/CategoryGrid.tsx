import { useState } from 'react'
import { Button } from '@repo/ui'
import { Plus, TrendingUp, TrendingDown } from 'lucide-react'
import { CreateCategoryModal } from './CreateCategoryModal'
import type { Category } from '../types/finance'

interface CategoryGridProps {
  categories: Category[]
  onRefresh: () => void
}

export function CategoryGrid({ categories, onRefresh }: CategoryGridProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'Receita' | 'Despesa'>('all')

  const filteredCategories =
    filter === 'all'
      ? categories
      : categories.filter((c) => c.type === filter)

  const incomeCount = categories.filter((c) => c.type === 'Receita').length
  const expenseCount = categories.filter((c) => c.type === 'Despesa').length

  return (
    <div className="space-y-6">
      {/* Header with filter and add button */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Button
            variant={filter === 'all' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Todas ({categories.length})
          </Button>
          <Button
            variant={filter === 'Receita' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('Receita')}
            className="gap-2"
          >
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            Receitas ({incomeCount})
          </Button>
          <Button
            variant={filter === 'Despesa' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('Despesa')}
            className="gap-2"
          >
            <TrendingDown className="h-4 w-4 text-red-400" />
            Despesas ({expenseCount})
          </Button>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          size="sm"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredCategories.length === 0 ? (
          <div className="col-span-full glass-dark rounded-xl p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto mb-4">
              <Plus className="h-6 w-6" />
            </div>
            <h4 className="font-medium text-foreground mb-1">
              Nenhuma categoria encontrada
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              {filter === 'all'
                ? 'Crie sua primeira categoria para organizar suas finanças'
                : `Nenhuma categoria de ${filter.toLowerCase()} encontrada`}
            </p>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Criar Categoria
            </Button>
          </div>
        ) : (
          filteredCategories.map((category) => (
            <div
              key={category.id}
              className="glass-dark rounded-xl p-4 hover:border-white/15 transition-all duration-300 cursor-pointer group"
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-xl text-2xl transition-transform group-hover:scale-110"
                  style={{
                    backgroundColor: `${category.color || '#3b82f6'}20`,
                  }}
                >
                  {category.icon || '🏷️'}
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground truncate max-w-[120px]">
                    {category.name}
                  </p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    {category.type === 'Receita' ? (
                      <TrendingUp className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-400" />
                    )}
                    <span
                      className={`text-xs ${
                        category.type === 'Receita'
                          ? 'text-emerald-400'
                          : 'text-red-400'
                      }`}
                    >
                      {category.type}
                    </span>
                  </div>
                  {category.isDefault && (
                    <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full mt-1 inline-block">
                      Padrão
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <CreateCategoryModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={() => {
          setIsCreateModalOpen(false)
          onRefresh()
        }}
      />
    </div>
  )
}
