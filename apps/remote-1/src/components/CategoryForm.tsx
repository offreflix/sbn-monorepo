import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { financeApi } from '../api/finance'
import type { CreateCategoryRequest, CategoryType } from '../types/finance'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '../ui/form'
import { toast } from 'sonner'
import { useState } from 'react'

const categorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.enum(['Receita', 'Despesa']),
  icon: z.string().optional(),
  color: z.string().optional(),
  is_default: z.boolean().optional(),
})

type CategoryFormData = z.infer<typeof categorySchema>

interface CategoryFormProps {
  onSuccess: () => void
  onCancel: () => void
}

const commonIcons = ['💰', '🍔', '🚗', '🏠', '💊', '🎮', '📱', '👕', '🎬', '✈️', '🍕', '☕']

export function CategoryForm({ onSuccess, onCancel }: CategoryFormProps) {
  const [submitting, setSubmitting] = useState(false)
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      type: 'Despesa',
      is_default: false,
    },
  })

  const onSubmit = async (data: CategoryFormData) => {
    try {
      setSubmitting(true)
      const payload: CreateCategoryRequest = {
        name: data.name,
        type: data.type,
        icon: data.icon || undefined,
        color: data.color || undefined,
        is_default: data.is_default || false,
      }

      await financeApi.categories.create(payload)
      toast.success('Categoria criada com sucesso!')
      form.reset()
      onSuccess()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao criar categoria')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <Form form={form} onSubmit={onSubmit}>
          <div className="space-y-4">
            <FormField
              name="name"
              form={form}
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Alimentação, Salário" {...field} />
                  </FormControl>
                  <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
              )}
            />

            <FormField
              name="type"
              form={form}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="flex h-10 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm"
                    >
                      <option value="Despesa">Despesa</option>
                      <option value="Receita">Receita</option>
                    </select>
                  </FormControl>
                  <FormMessage>{form.formState.errors.type?.message}</FormMessage>
                </FormItem>
              )}
            />

            <FormField
              name="icon"
              form={form}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ícone (opcional)</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Input placeholder="💰" {...field} />
                      <div className="flex gap-2 flex-wrap">
                        {commonIcons.map((icon) => (
                          <button
                            key={icon}
                            type="button"
                            onClick={() => form.setValue('icon', icon)}
                            className={`text-2xl p-2 rounded border ${
                              field.value === icon
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:bg-muted'
                            }`}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage>{form.formState.errors.icon?.message}</FormMessage>
                </FormItem>
              )}
            />

            <FormField
              name="color"
              form={form}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cor (opcional)</FormLabel>
                  <FormControl>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="color"
                        className="w-16 h-10"
                        {...field}
                        value={field.value || '#3b82f6'}
                      />
                      <Input placeholder="#3b82f6" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage>{form.formState.errors.color?.message}</FormMessage>
                </FormItem>
              )}
            />

            <FormField
              name="is_default"
              form={form}
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="h-4 w-4 rounded border-border"
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">Marcar como categoria padrão</FormLabel>
                </FormItem>
              )}
            />

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Salvando...' : 'Criar Categoria'}
              </Button>
            </div>
          </div>
        </Form>
      </CardContent>
    </Card>
  )
}

