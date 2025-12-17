import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { financeApi } from '../api/finance'
import type { CreateWalletRequest } from '../types/finance'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '../ui/form'
import { toast } from 'sonner'
import { useState } from 'react'

const walletSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.string().min(1, 'Tipo é obrigatório'),
  currency: z.string().optional(),
  invoice_closing_day: z.string().optional(),
  invoice_due_day: z.string().optional(),
  limit: z.string().optional(),
})

type WalletFormData = z.infer<typeof walletSchema>

interface WalletFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function WalletForm({ onSuccess, onCancel }: WalletFormProps) {
  const [submitting, setSubmitting] = useState(false)
  const form = useForm<WalletFormData>({
    resolver: zodResolver(walletSchema),
    defaultValues: {
      currency: 'BRL',
      type: 'Conta Corrente',
    },
  })

  const onSubmit = async (data: WalletFormData) => {
    try {
      setSubmitting(true)
      const payload: CreateWalletRequest = {
        name: data.name,
        type: data.type,
        currency: data.currency || 'BRL',
        invoice_closing_day: data.invoice_closing_day
          ? parseInt(data.invoice_closing_day)
          : undefined,
        invoice_due_day: data.invoice_due_day ? parseInt(data.invoice_due_day) : undefined,
        limit: data.limit || undefined,
      }

      await financeApi.wallets.create(payload)
      toast.success('Carteira criada com sucesso!')
      form.reset()
      onSuccess()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao criar carteira')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova Carteira</CardTitle>
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
                    <Input placeholder="Ex: Nubank, Banco do Brasil" {...field} />
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
                      <option value="Conta Corrente">Conta Corrente</option>
                      <option value="Poupança">Poupança</option>
                      <option value="Investimento">Investimento</option>
                      <option value="Cartão de Crédito">Cartão de Crédito</option>
                      <option value="Dinheiro">Dinheiro</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </FormControl>
                  <FormMessage>{form.formState.errors.type?.message}</FormMessage>
                </FormItem>
              )}
            />

            <FormField
              name="currency"
              form={form}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Moeda</FormLabel>
                  <FormControl>
                    <Input placeholder="BRL" {...field} />
                  </FormControl>
                  <FormMessage>{form.formState.errors.currency?.message}</FormMessage>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                name="invoice_closing_day"
                form={form}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia de Fechamento (opcional)</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="31" placeholder="Ex: 10" {...field} />
                    </FormControl>
                    <FormMessage>{form.formState.errors.invoice_closing_day?.message}</FormMessage>
                  </FormItem>
                )}
              />

              <FormField
                name="invoice_due_day"
                form={form}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia de Vencimento (opcional)</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="31" placeholder="Ex: 15" {...field} />
                    </FormControl>
                    <FormMessage>{form.formState.errors.invoice_due_day?.message}</FormMessage>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              name="limit"
              form={form}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Limite (opcional)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage>{form.formState.errors.limit?.message}</FormMessage>
                </FormItem>
              )}
            />

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Salvando...' : 'Criar Carteira'}
              </Button>
            </div>
          </div>
        </Form>
      </CardContent>
    </Card>
  )
}

