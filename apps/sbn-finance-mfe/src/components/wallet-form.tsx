import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { financeApi } from "../api/finance";
import {
  walletSchema,
  type WalletFormData,
} from "../pages/dashboard/dashboard.schema";
import type { CreateWalletRequest } from "../types/wallet.type";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui";
import {
  Input,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@repo/ui";
import { toast } from "sonner";
import { useState } from "react";

interface WalletFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function WalletForm({ onSuccess, onCancel }: WalletFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<WalletFormData>({
    resolver: zodResolver(walletSchema),
    defaultValues: {
      currency: "BRL",
      type: "Conta Corrente",
    },
  });

  const onSubmit = async (data: WalletFormData) => {
    try {
      setSubmitting(true);
      const payload: CreateWalletRequest = {
        name: data.name,
        type: data.type,
        currency: data.currency || "BRL",
        invoiceClosingDay: data.invoiceClosingDay
          ? parseInt(data.invoiceClosingDay)
          : undefined,
        invoiceDueDay: data.invoiceDueDay
          ? parseInt(data.invoiceDueDay)
          : undefined,
        limit: data.limit ? parseFloat(data.limit) : undefined,
      };

      await financeApi.wallets.create(payload);
      toast.success("Carteira criada com sucesso!");
      form.reset();
      onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao criar carteira",
      );
    } finally {
      setSubmitting(false);
    }
  };

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
                    <Input
                      placeholder="Ex: Nubank, Banco do Brasil"
                      {...field}
                    />
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Conta Corrente">
                        Conta Corrente
                      </SelectItem>
                      <SelectItem value="Poupança">Poupança</SelectItem>
                      <SelectItem value="Investimento">Investimento</SelectItem>
                      <SelectItem value="Cartão de Crédito">
                        Cartão de Crédito
                      </SelectItem>
                      <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage>
                    {form.formState.errors.type?.message}
                  </FormMessage>
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
                    <Input
                      placeholder="BRL"
                      {...field}
                      value={field.value || "BRL"}
                    />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.currency?.message}
                  </FormMessage>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                name="invoiceClosingDay"
                form={form}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia de Fechamento (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="31"
                        placeholder="Ex: 10"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.invoiceClosingDay?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />

              <FormField
                name="invoiceDueDay"
                form={form}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia de Vencimento (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="31"
                        placeholder="Ex: 15"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.invoiceDueDay?.message}
                    </FormMessage>
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
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.limit?.message}
                  </FormMessage>
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
                {submitting ? "Salvando..." : "Criar Carteira"}
              </Button>
            </div>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
