import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { financeApi } from '../api/finance'
import type { Wallet, Category, CreateTransactionRequest } from '../types/finance'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '../ui/form'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'

const transactionSchema = z.object({
  wallet_id: z.string().min(1, 'Selecione uma carteira'),
  category_id: z.string().min(1, 'Selecione uma categoria'),
  amount: z.string().min(1, 'Valor é obrigatório').refine((val) => {
    const num = parseFloat(val)
    return !isNaN(num) && num > 0
  }, 'Valor deve ser um número positivo'),
  date: z.string().min(1, 'Data é obrigatória'),
  description: z.string().optional(),
  type: z.enum(['Receita', 'Despesa']),
  status: z.enum(['Pendente', 'Pago', 'Cancelado']).optional(),
  is_paid: z.boolean().optional(),
})

type TransactionFormData = z.infer<typeof transactionSchema>

interface TransactionFormProps {
  wallets: Wallet[]
  categories: Category[]
  onSuccess: () => void
  onCancel: () => void
}

export function TransactionForm({ wallets, categories, onSuccess, onCancel }: TransactionFormProps) {
  const [submitting, setSubmitting] = useState(false)
  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'Despesa',
      status: 'Pendente',
      is_paid: false,
      date: new Date().toISOString().split('T')[0],
    },
  })

  const selectedType = form.watch('type')
  const filteredCategories = categories.filter((cat) => cat.type === selectedType)

  const onSubmit = async (data: TransactionFormData) => {
    try {
      setSubmitting(true)
      const payload: CreateTransactionRequest = {
        wallet_id: data.wallet_id,
        category_id: data.category_id,
        amount: data.amount,
        date: new Date(data.date).toISOString(),
        description: data.description,
        type: data.type,
        status: data.status || 'Pendente',
        is_paid: data.is_paid || false,
        currency: 'BRL',
      }

      await financeApi.transactions.create(payload)
      toast.success('Transação criada com sucesso!')
      form.reset()
      onSuccess()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao criar transação')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova Transação</CardTitle>
      </CardHeader>
      <CardContent>
        <Form form={form} onSubmit={onSubmit}>
          <div className="space-y-4">
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
              name="wallet_id"
              form={form}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Carteira</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="flex h-10 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm"
                    >
                      <option value="">Selecione uma carteira</option>
                      {wallets.map((wallet) => (
                        <option key={wallet.id} value={wallet.id}>
                          {wallet.name} ({wallet.type})
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage>{form.formState.errors.wallet_id?.message}</FormMessage>
                </FormItem>
              )}
            />

            <FormField
              name="category_id"
              form={form}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="flex h-10 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm"
                      disabled={filteredCategories.length === 0}
                    >
                      <option value="">Selecione uma categoria</option>
                      {filteredCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.icon || ''} {category.name}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage>{form.formState.errors.category_id?.message}</FormMessage>
                </FormItem>
              )}
            />

            <FormField
              name="amount"
              form={form}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage>{form.formState.errors.amount?.message}</FormMessage>
                </FormItem>
              )}
            />

            <FormField
              name="date"
              form={form}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage>{form.formState.errors.date?.message}</FormMessage>
                </FormItem>
              )}
            />

            <FormField
              name="description"
              form={form}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Compra no supermercado" {...field} />
                  </FormControl>
                  <FormMessage>{form.formState.errors.description?.message}</FormMessage>
                </FormItem>
              )}
            />

            <FormField
              name="is_paid"
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
                  <FormLabel className="!mt-0">Marcar como pago</FormLabel>
                </FormItem>
              )}
            />

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Salvando...' : 'Criar Transação'}
              </Button>
            </div>
          </div>
        </Form>
      </CardContent>
    </Card>
  )
}

