import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { healthApi } from "../../api/health";
import type { GoalsProps } from "./goals.type";
import type { HealthGoal } from "../../api/health";

const createGoalSchema = z.object({
  dailyCalorieGoal: z
    .string()
    .min(1, "Obrigatório")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Deve ser maior que 0"),
  proteinGoalG: z
    .string()
    .min(1, "Obrigatório")
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, "Inválido"),
  carbsGoalG: z
    .string()
    .min(1, "Obrigatório")
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, "Inválido"),
  fatGoalG: z
    .string()
    .min(1, "Obrigatório")
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, "Inválido"),
  waterGoalMl: z
    .string()
    .optional()
    .refine((v) => !v || (!isNaN(Number(v)) && Number(v) >= 0), "Inválido"),
});

type CreateGoalForm = z.infer<typeof createGoalSchema>;

export function useGoalsModel(_props: GoalsProps) {
  void _props;
  const [current, setCurrent] = useState<HealthGoal | null>(null);
  const [history, setHistory] = useState<HealthGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const form = useForm<CreateGoalForm>({
    resolver: zodResolver(createGoalSchema),
    defaultValues: {
      dailyCalorieGoal: "",
      proteinGoalG: "",
      carbsGoalG: "",
      fatGoalG: "",
      waterGoalMl: "",
    },
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [cur, list] = await Promise.allSettled([
        healthApi.goals.current(),
        healthApi.goals.list(),
      ]);
      if (cur.status === "fulfilled") setCurrent(cur.value);
      else setCurrent(null);
      if (list.status === "fulfilled") setHistory(list.value);
      else setHistory([]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao carregar metas");
      setCurrent(null);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    form.reset({
      dailyCalorieGoal: "",
      proteinGoalG: "",
      carbsGoalG: "",
      fatGoalG: "",
      waterGoalMl: "",
    });
    setIsCreateOpen(true);
  };

  const submitCreateGoal = form.handleSubmit(async (values) => {
    try {
      setSaving(true);
      await healthApi.goals.create({
        dailyCalorieGoal: Number(values.dailyCalorieGoal),
        proteinGoalG: Number(values.proteinGoalG),
        carbsGoalG: Number(values.carbsGoalG),
        fatGoalG: Number(values.fatGoalG),
        waterGoalMl: values.waterGoalMl ? Number(values.waterGoalMl) : undefined,
      });
      toast.success("Meta criada");
      setIsCreateOpen(false);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  });

  return {
    data: { current, history },
    state: { loading, isCreateOpen, saving, form },
    setters: { setIsCreateOpen },
    actions: { reload: load, openCreate, submitCreateGoal },
  };
}

export type GoalsModelOutput = ReturnType<typeof useGoalsModel>;
