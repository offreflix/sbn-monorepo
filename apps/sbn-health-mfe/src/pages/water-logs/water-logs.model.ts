import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { healthApi } from "../../api/health";
import type { WaterLogsProps } from "./water-logs.type";
import type { WaterLog } from "../../api/health";

const createWaterLogSchema = z.object({
  volumeMl: z
    .string()
    .min(1, "Obrigatório")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Deve ser maior que 0"),
});

type CreateWaterLogForm = z.infer<typeof createWaterLogSchema>;

export function useWaterLogsModel({ selectedDate }: WaterLogsProps) {
  const [entries, setEntries] = useState<WaterLog[]>([]);
  const [totalMl, setTotalMl] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const form = useForm<CreateWaterLogForm>({
    resolver: zodResolver(createWaterLogSchema),
    defaultValues: { volumeMl: "" },
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await healthApi.waterLogs.list(selectedDate);
      setEntries(data.entries);
      setTotalMl(data.totalMl);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao carregar água");
      setEntries([]);
      setTotalMl(0);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    form.reset({ volumeMl: "" });
    setIsCreateOpen(true);
  };

  const submitCreateWaterLog = form.handleSubmit(async (values) => {
    try {
      setSaving(true);
      await healthApi.waterLogs.create({
        volumeMl: Number(values.volumeMl),
        loggedDate: selectedDate,
      });
      toast.success("Registro adicionado");
      setIsCreateOpen(false);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  });

  const deleteWaterLog = async (id: string) => {
    try {
      setDeletingId(id);
      await healthApi.waterLogs.delete(id);
      toast.success("Registro removido");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao remover");
    } finally {
      setDeletingId(null);
    }
  };

  return {
    data: { entries, totalMl },
    state: { loading, isCreateOpen, saving, deletingId, form },
    setters: { setIsCreateOpen },
    actions: { reload: load, openCreate, submitCreateWaterLog, deleteWaterLog },
  };
}

export type WaterLogsModelOutput = ReturnType<typeof useWaterLogsModel>;
