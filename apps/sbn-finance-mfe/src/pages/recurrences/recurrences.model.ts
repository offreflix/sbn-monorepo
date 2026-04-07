import { useState, useEffect } from "react";
import { toast } from "sonner";
import { financeApi } from "../../api/finance";
import type { Recurrence } from "./recurrences.type";

export function useRecurrencesModel() {
  const [recurrences, setRecurrences] = useState<Recurrence[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadRecurrences = async () => {
    try {
      setLoading(true);
      const data = await financeApi.recurrences.list();
      setRecurrences(data);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao carregar recorrências",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecurrences();
  }, []);

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      setIsDeleting(true);
      await financeApi.recurrences.delete(deletingId);
      toast.success("Recorrência excluída com sucesso!");
      setDeletingId(null);
      await loadRecurrences();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao excluir recorrência",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    data: { recurrences },
    state: { loading, deletingId, isDeleting },
    setters: { setDeletingId },
    actions: { handleDelete, loadRecurrences },
  };
}

export type RecurrencesModelOutput = ReturnType<typeof useRecurrencesModel>;
