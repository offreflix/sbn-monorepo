import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { healthApi } from "../../api/health";
import type { SummaryProps } from "./summary.type";
import type { SummaryResponse } from "../../api/health";

export function useSummaryModel({ selectedDate }: SummaryProps) {
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await healthApi.summary.get(selectedDate);
      setSummary(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao carregar resumo";
      toast.error(message);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    data: {
      summary,
    },
    state: {
      loading,
    },
    actions: {
      reload: load,
    },
  };
}

export type SummaryModelOutput = ReturnType<typeof useSummaryModel>;

