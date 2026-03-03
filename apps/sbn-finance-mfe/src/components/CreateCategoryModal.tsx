import { useState, useEffect } from "react";
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
} from "@repo/ui";
import { Input, Label } from "@repo/ui";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { financeApi } from "../api/finance";
import type { CreateCategoryRequest, Category } from "../types/finance";
import { toast } from "sonner";

const EMOJI_OPTIONS = [
  "🍔",
  "🚗",
  "🏥",
  "🎮",
  "💰",
  "💼",
  "🏠",
  "✈️",
  "📚",
  "💳",
  "🎬",
  "🛒",
];
const COLOR_OPTIONS = [
  { name: "Vermelho", value: "#ef4444" },
  { name: "Laranja", value: "#f59e0b" },
  { name: "Amarelo", value: "#eab308" },
  { name: "Verde", value: "#10b981" },
  { name: "Azul", value: "#3b82f6" },
  { name: "Roxo", value: "#8b5cf6" },
  { name: "Rosa", value: "#ec4899" },
  { name: "Cinza", value: "#6b7280" },
];

const categorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  type: z.enum(["Receita", "Despesa"]),
  icon: z.string().optional(),
  color: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CreateCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialData?: Category;
}

export function CreateCategoryModal({
  open,
  onOpenChange,
  onSuccess,
  initialData,
}: CreateCategoryModalProps) {
  const isEditing = !!initialData;
  const [submitting, setSubmitting] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState("🍔");
  const [selectedColor, setSelectedColor] = useState("#ef4444");

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      type: "Despesa",
    },
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          name: initialData.name,
          type: initialData.type,
        });
        setSelectedEmoji(initialData.icon || "🍔");
        setSelectedColor(initialData.color || "#ef4444");
      } else {
        form.reset({ type: "Despesa" });
        setSelectedEmoji("🍔");
        setSelectedColor("#ef4444");
      }
    }
  }, [open, initialData]);

  const onSubmit = async (data: CategoryFormData) => {
    try {
      setSubmitting(true);
      const payload: CreateCategoryRequest = {
        name: data.name,
        type: data.type,
        icon: selectedEmoji,
        color: selectedColor,
      };

      if (isEditing) {
        await financeApi.categories.update(initialData.id, payload);
        toast.success("Categoria atualizada com sucesso!");
      } else {
        await financeApi.categories.create(payload);
        toast.success("Categoria criada com sucesso!");
      }
      form.reset();
      setSelectedEmoji("🍔");
      setSelectedColor("#ef4444");
      onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : isEditing
            ? "Erro ao atualizar categoria"
            : "Erro ao criar categoria",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Categoria" : "Criar Nova Categoria"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações da categoria."
              : "Adicione uma nova categoria para organizar suas transações."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Categoria</Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="Ex: Alimentação"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select
              value={form.watch("type")}
              onValueChange={(value) =>
                form.setValue("type", value as "Receita" | "Despesa")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Receita">Receita</SelectItem>
                <SelectItem value="Despesa">Despesa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Ícone</Label>
            <div className="grid grid-cols-6 gap-2">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`h-12 w-12 rounded-lg border-2 text-2xl transition-all hover:scale-110 ${
                    selectedEmoji === emoji
                      ? "border-primary bg-primary/10"
                      : "border-border"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="grid grid-cols-4 gap-2">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={`h-12 rounded-lg border-2 transition-all hover:scale-105 ${
                    selectedColor === color.value
                      ? "border-foreground ring-2 ring-offset-2"
                      : "border-border"
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
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
                ? "Salvando..."
                : isEditing
                  ? "Salvar Alterações"
                  : "Criar Categoria"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
