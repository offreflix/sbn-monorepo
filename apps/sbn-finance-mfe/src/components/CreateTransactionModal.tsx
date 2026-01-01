import { useState, useEffect } from 'react'
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
import { Input, Label, Switch } from '@repo/ui'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { financeApi } from '../api/finance'
import type {
  Wallet,
  Category,
  CreateTransactionRequest,
  Transaction,
} from '../types/finance'
import { toast } from 'sonner'

const transactionSchema = z.object({
  walletId: z.string().min(1, 'Selecione uma carteira'),
  categoryId: z.string().min(1, 'Selecione uma categoria'),
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
  isPaid: z.boolean().optional(),
  installmentNumber: z.string().optional(),
  totalInstallments: z.string().optional(),
})

type TransactionFormData = z.infer<typeof transactionSchema>

interface CreateTransactionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  wallets: Wallet[]
  categories: Category[]
  onSuccess: () => void
  initialData?: Transaction | null
}

export function CreateTransactionModal({
  open,
  onOpenChange,
  wallets,
  categories,
  onSuccess,
  initialData,
}: CreateTransactionModalProps) {
  const [submitting, setSubmitting] = useState(false)
  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'Despesa',
      status: 'Pendente',
      isPaid: false,
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: '',
      walletId: '',
      categoryId: '',
    },
  })

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          walletId: initialData.walletId,
          categoryId: initialData.categoryId,
          amount: initialData.amount.toString(),
          date: new Date(initialData.date).toISOString().split('T')[0],
          description: initialData.description || '',
          type: initialData.type,
          status: initialData.status,
          isPaid: initialData.isPaid,
          installmentNumber: initialData.installmentNumber?.toString(),
          totalInstallments: initialData.totalInstallments?.toString(),
        })
      } else {
        form.reset({
          type: 'Despesa',
          status: 'Pendente',
          isPaid: false,
          date: new Date().toISOString().split('T')[0],
          description: '',
          amount: '',
          walletId: '',
          categoryId: '',
        })
      }
    }
  }, [open, initialData, form])

  const selectedType = form.watch('type')
  const filteredCategories = categories.filter(
    (cat) => cat.type === selectedType,
  )
  const hasInstallments =
    form.watch('installmentNumber') && form.watch('totalInstallments')

  const onSubmit = async (data: TransactionFormData) => {
    try {
      setSubmitting(true)
      const payload: CreateTransactionRequest = {
        walletId: data.walletId,
        categoryId: data.categoryId,
        amount: data.amount,
        date: new Date(data.date).toISOString(),
        description: data.description,
        type: data.type,
        status: data.status || 'Pendente',
        isPaid: data.isPaid || false,
        currency: 'BRL',
        installmentNumber: data.installmentNumber
          ? parseInt(data.installmentNumber)
          : undefined,
        totalInstallments: data.totalInstallments
          ? parseInt(data.totalInstallments)
          : undefined,
      }

      if (initialData) {
        await financeApi.transactions.update(initialData.id, payload)
        toast.success('Transação atualizada com sucesso!')
      } else {
        await financeApi.transactions.create(payload)
        toast.success('Transação criada com sucesso!')
      }

      form.reset()
      onSuccess()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao salvar transação',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Editar Transação' : 'Criar Nova Transação'}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? 'Edite os detalhes da transação.'
              : 'Registre uma nova receita ou despesa.'}
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
            <Label htmlFor="walletId">Carteira</Label>
            <Select
              value={form.watch('walletId')}
              onValueChange={(value) => form.setValue('walletId', value)}
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
            {form.formState.errors.walletId && (
              <p className="text-sm text-destructive">
                {form.formState.errors.walletId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId">Categoria</Label>
            <Select
              value={form.watch('categoryId')}
              onValueChange={(value) => form.setValue('categoryId', value)}
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
            {form.formState.errors.categoryId && (
              <p className="text-sm text-destructive">
                {form.formState.errors.categoryId.message}
              </p>
            )}
            {selectedType === 'Despesa' && filteredCategories.length === 0 && (
              <p className="text-sm text-amber-600 mt-1">
                Nenhuma categoria de despesa encontrada. Crie uma na aba
                Categorias.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="hasInstallments">Parcelar</Label>
            <Switch
              id="hasInstallments"
              checked={!!hasInstallments}
              onCheckedChange={(checked) => {
                if (!checked) {
                  form.setValue('installmentNumber', undefined)
                  form.setValue('totalInstallments', undefined)
                } else {
                  form.setValue('installmentNumber', '1')
                  form.setValue('totalInstallments', '1')
                }
              }}
            />
          </div>

          {hasInstallments && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="installmentNumber">Parcela Atual</Label>
                <Input
                  id="installmentNumber"
                  type="number"
                  min="1"
                  placeholder="1"
                  {...form.register('installmentNumber')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalInstallments">Total de Parcelas</Label>
                <Input
                  id="totalInstallments"
                  type="number"
                  min="1"
                  placeholder="12"
                  {...form.register('totalInstallments')}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <Label htmlFor="isPaid">Já foi pago?</Label>
            <Switch
              id="isPaid"
              checked={form.watch('isPaid') || false}
              onCheckedChange={(checked) => form.setValue('isPaid', checked)}
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
              {submitting
                ? 'Salvando...'
                : initialData
                  ? 'Salvar'
                  : 'Criar Transação'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
