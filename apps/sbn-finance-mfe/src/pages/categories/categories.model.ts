import { useState } from "react";
import { toast } from "sonner";
import { financeApi } from "../../api/finance";
import type { Category } from "./categories.type";
import type { CategoriesProps } from "./categories.type";

export function useCategoriesModel({
  categories,
  onRefresh,
  hasTitle,
}: CategoriesProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [filter, setFilter] = useState<"all" | "Receita" | "Despesa">("all");

  const filteredCategories =
    filter === "all" ? categories : categories.filter((c) => c.type === filter);

  const incomeCount = categories.filter((c) => c.type === "Receita").length;
  const expenseCount = categories.filter((c) => c.type === "Despesa").length;

  const handleDelete = async () => {
    if (!deletingCategory) return;
    try {
      setIsDeleting(true);
      await financeApi.categories.delete(deletingCategory.id);
      toast.success("Categoria excluída com sucesso!");
      setDeletingCategory(null);
      onRefresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao excluir categoria",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    data: {
      categories: filteredCategories,
      totalCount: categories.length,
      incomeCount,
      expenseCount,
    },
    state: {
      isCreateModalOpen,
      editingCategory,
      deletingCategory,
      isDeleting,
      filter,
      hasTitle,
    },
    setters: {
      setIsCreateModalOpen,
      setEditingCategory,
      setDeletingCategory,
      setFilter,
    },
    actions: {
      handleDelete,
      onRefresh,
    },
  };
}

export type CategoriesModelOutput = ReturnType<typeof useCategoriesModel>;
