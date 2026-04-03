import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { financeApi } from "../api/finance";
import { transactionFormSchema, type TransactionFormData } from "../pages/transactions/transactions.schema";
import type { Wallet } from "../types/wallet.type";
import type { Category } from "../pages/categories/categories.type";
import type { CreateTransactionRequest } from "../pages/transactions/transactions.type";
import { Button } from "@repo/ui";
import {
  Input,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@repo/ui";
import { toast } from "sonner";
import { useState } from "react";


interface TransactionFormProps {
  wallets: Wallet[];
  categories: Category[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function TransactionForm({
  wallets,
  categories,
  onSuccess,
  onCancel,
}: TransactionFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      type: "Despesa",
      status: "Pendente",
      isPaid: false,
      installments: "1",
      date: new Date().toLocaleDateString("sv"), // 'sv' locale formats as YYYY-MM-DD
    },
  });

  const selectedType = form.watch("type");
  const filteredCategories = categories.filter(
    (cat) => cat.type === selectedType,
  );

  const onSubmit = async (data: TransactionFormData) => {
    try {
      setSubmitting(true);

      // Create date at 12:00 local time to prevent timezone shifts when converting to UTC
      const [year, month, day] = data.date.split("-").map(Number);
      const date = new Date(year, month - 1, day, 12, 0, 0);

      const payload: CreateTransactionRequest = {
        walletId: data.walletId,
        categoryId: data.categoryId,
        amount: data.amount,
        date: date.toISOString(),
        description: data.description,
        type: data.type,
        status: data.status || "Pendente",
        isPaid: data.isPaid || false,
        installments: parseInt(data.installments),
        currency: "BRL",
      };

      await financeApi.transactions.create(payload);
      toast.success("Transação criada com sucesso!");
      form.reset();
      onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao criar transação",
      );
    } finally {
      setSubmitting(false);
    }
  };

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
                  <FormMessage>
                    {form.formState.errors.type?.message}
                  </FormMessage>
                </FormItem>
              )}
            />

            <FormField
              name="walletId"
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
                  <FormMessage>
                    {form.formState.errors.walletId?.message}
                  </FormMessage>
                </FormItem>
              )}
            />

            <FormField
              name="categoryId"
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
                          {category.icon || ""} {category.name}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.categoryId?.message}
                  </FormMessage>
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
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.amount?.message}
                  </FormMessage>
                </FormItem>
              )}
            />

            <FormField
              name="installments"
              form={form}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parcelas</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" placeholder="1" {...field} />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.installments?.message}
                  </FormMessage>
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
                  <FormMessage>
                    {form.formState.errors.date?.message}
                  </FormMessage>
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
                    <Input
                      placeholder="Ex: Compra no supermercado"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.description?.message}
                  </FormMessage>
                </FormItem>
              )}
            />

            <FormField
              name="isPaid"
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
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Salvando..." : "Criar Transação"}
              </Button>
            </div>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
