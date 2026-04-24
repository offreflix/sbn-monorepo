import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { healthApi } from "../../api/health";
import type { MeasurementsProps } from "./measurements.type";
import type { Measurement } from "../../api/health";

const createMeasurementSchema = z.object({
  weightKg: z
    .string()
    .min(1, "Obrigatório")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Deve ser maior que 0"),
});

type CreateMeasurementForm = z.infer<typeof createMeasurementSchema>;

export function useMeasurementsModel({ selectedDate }: MeasurementsProps) {
  const [items, setItems] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const form = useForm<CreateMeasurementForm>({
    resolver: zodResolver(createMeasurementSchema),
    defaultValues: { weightKg: "" },
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const list = await healthApi.measurements.list(
        selectedDate,
        selectedDate,
      );
      setItems(list);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao carregar medidas");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    form.reset({ weightKg: "" });
    setIsCreateOpen(true);
  };

  const submitCreateMeasurement = form.handleSubmit(async (values) => {
    try {
      setSaving(true);
      await healthApi.measurements.create({
        weightKg: Number(values.weightKg),
        measuredAt: selectedDate,
      });
      toast.success("Medida registrada");
      setIsCreateOpen(false);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  });

  const deleteMeasurement = async (id: string) => {
    try {
      setDeletingId(id);
      await healthApi.measurements.delete(id);
      toast.success("Medida removida");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao remover");
    } finally {
      setDeletingId(null);
    }
  };

  return {
    data: { items },
    state: { loading, isCreateOpen, saving, deletingId, form },
    setters: { setIsCreateOpen },
    actions: {
      reload: load,
      openCreate,
      submitCreateMeasurement,
      deleteMeasurement,
    },
  };
}

export type MeasurementsModelOutput = ReturnType<typeof useMeasurementsModel>;
