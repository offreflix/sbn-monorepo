import { useState } from 'react'
import { Card, Badge, Button } from '@repo/ui'
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
      <div className="flex justify-end">
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          size="sm"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.length === 0 ? (
          <p className="col-span-full text-center text-muted-foreground py-8">
            Nenhuma categoria encontrada
          </p>
        ) : (
          categories.map((category) => (
            <Card
              key={category.id}
              className="p-6 hover:shadow-lg transition-all hover:scale-105 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                    style={{
                      backgroundColor: `${category.color || '#3b82f6'}20`,
                    }}
                  >
                    {category.icon || '💰'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {category.name}
                    </h3>
                    <Badge
                      variant={
                        category.type === 'Receita' ? 'default' : 'secondary'
                      }
                      className="mt-1"
                    >
                      {category.type}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
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
