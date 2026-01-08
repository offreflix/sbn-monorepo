import { useState } from 'react'
import { Card, Button } from '@repo/ui'
import { Plus } from 'lucide-react'
import { CreateCategoryModal } from './CreateCategoryModal'
import type { Category } from '../types/finance'

interface CategoryGridProps {
  categories: Category[]
  onRefresh: () => void
}

export function CategoryGrid({ categories, onRefresh }: CategoryGridProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex justify-end sticky top-0 backdrop-blur z-10 py-2">
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          size="sm"
          className="gap-2 rounded-full"
        >
          <Plus className="h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {categories.length === 0 ? (
          <p className="col-span-full text-center text-muted-foreground py-8">
            Nenhuma categoria encontrada
          </p>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              className="group flex flex-col items-center justify-center p-4 rounded-2xl border border-dashed hover:border-solid border-border bg-card/50 hover:bg-card hover:shadow-md transition-all cursor-pointer gap-3 aspect-square"
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl transition-transform group-hover:scale-110"
                style={{
                  backgroundColor: `${category.color || '#3b82f6'}20`,
                }}
              >
                {category.icon || '🏷️'}
              </div>
              <div className="text-center">
                <p className="font-medium text-sm text-foreground truncate max-w-[100px]">
                  {category.name}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                  {category.type}
                </p>
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
