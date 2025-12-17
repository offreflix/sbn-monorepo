import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { Textarea } from '../ui/textarea'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { financeApi } from '../api/finance'
import type {
  Wallet,
  Category,
  CreateTransactionRequest,
} from '../types/finance'
import { toast } from 'sonner'

const transactionSchema = z.object({
  wallet_id: z.string().min(1, 'Selecione uma carteira'),
  category_id: z.string().min(1, 'Selecione uma categoria'),
  amount: z
    .string()
    .min(1, 'Valor é obrigatório')
    .refine((val) => {
      const num = parseFloat(val)
      return !isNaN(num) && num > 0
    }, 'Valor deve ser um número positivo'),
  date: z.string().min(1, 'Data é obrigatória'),
  description: z.string().optional(),
  type: z.enum(['Receita', 'Despesa']),
  status: z.enum(['Pendente', 'Pago', 'Cancelado']).optional(),
  is_paid: z.boolean().optional(),
  installment_number: z.string().optional(),
  total_installments: z.string().optional(),
})

type TransactionFormData = z.infer<typeof transactionSchema>

interface CreateTransactionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  wallets: Wallet[]
  categories: Category[]
  onSuccess: () => void
}

export function CreateTransactionModal({
  open,
  onOpenChange,
  wallets,
  categories,
  onSuccess,
}: CreateTransactionModalProps) {
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
  const filteredCategories = categories.filter(
    (cat) => cat.type === selectedType
  )
  const hasInstallments =
    form.watch('installment_number') && form.watch('total_installments')

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
        installment_number: data.installment_number
          ? parseInt(data.installment_number)
          : undefined,
        total_installments: data.total_installments
          ? parseInt(data.total_installments)
          : undefined,
      }

      await financeApi.transactions.create(payload)
      toast.success('Transação criada com sucesso!')
      form.reset()
      onSuccess()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao criar transação'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Nova Transação</DialogTitle>
          <DialogDescription>
            Registre uma nova receita ou despesa.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Tipo de Transação</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={selectedType === 'Receita' ? 'default' : 'outline'}
                onClick={() => form.setValue('type', 'Receita')}
                className="w-full"
              >
                Receita
              </Button>
              <Button
                type="button"
                variant={selectedType === 'Despesa' ? 'default' : 'outline'}
                onClick={() => form.setValue('type', 'Despesa')}
                className="w-full"
              >
                Despesa
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              {...form.register('description')}
              placeholder="Ex: Almoço no restaurante"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...form.register('amount')}
              />
              {form.formState.errors.amount && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.amount.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input id="date" type="date" {...form.register('date')} />
              {form.formState.errors.date && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.date.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="wallet_id">Carteira</Label>
            <Select
              value={form.watch('wallet_id')}
              onValueChange={(value) => form.setValue('wallet_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a carteira" />
              </SelectTrigger>
              <SelectContent>
                {wallets.map((wallet) => (
                  <SelectItem key={wallet.id} value={wallet.id}>
                    {wallet.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.wallet_id && (
              <p className="text-sm text-destructive">
                {form.formState.errors.wallet_id.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category_id">Categoria</Label>
            <Select
              value={form.watch('category_id')}
              onValueChange={(value) => form.setValue('category_id', value)}
              disabled={filteredCategories.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <span>{category.icon || '💰'}</span>
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.category_id && (
              <p className="text-sm text-destructive">
                {form.formState.errors.category_id.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="has_installments">Parcelar</Label>
            <Switch
              id="has_installments"
              checked={!!hasInstallments}
              onCheckedChange={(checked) => {
                if (!checked) {
                  form.setValue('installment_number', undefined)
                  form.setValue('total_installments', undefined)
                } else {
                  form.setValue('installment_number', '1')
                  form.setValue('total_installments', '1')
                }
              }}
            />
          </div>

          {hasInstallments && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="installment_number">Parcela Atual</Label>
                <Input
                  id="installment_number"
                  type="number"
                  min="1"
                  placeholder="1"
                  {...form.register('installment_number')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="total_installments">Total de Parcelas</Label>
                <Input
                  id="total_installments"
                  type="number"
                  min="1"
                  placeholder="12"
                  {...form.register('total_installments')}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <Label htmlFor="is_paid">Já foi pago?</Label>
            <Switch
              id="is_paid"
              checked={form.watch('is_paid') || false}
              onCheckedChange={(checked) => form.setValue('is_paid', checked)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Salvando...' : 'Criar Transação'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
