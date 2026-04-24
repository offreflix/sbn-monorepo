import { useCallback, useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { healthApi } from "../../api/health";
import type { GoalsProps } from "./goals.type";
import type { HealthGoal } from "../../api/health";
import { createGoalSchema } from "./goals.schema";
import type { CreateGoalForm } from "./goals.type";

const toNumberOrZero = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const clampPct = (raw: string, max: number): string => {
  if (raw === "") return "";
  const n = Number(raw);
  if (!Number.isFinite(n)) return raw;
  return String(Math.min(Math.max(n, 0), Math.max(0, max)));
};

export const calcMacroGramsFromPct = (
  dailyCalories: number,
  pct: number,
  kcalPerGram: number,
) => {
  if (!Number.isFinite(dailyCalories) || dailyCalories <= 0) return null;
  if (!Number.isFinite(pct) || pct < 0) return null;
  if (!Number.isFinite(kcalPerGram) || kcalPerGram <= 0) return null;
  const grams = (dailyCalories * (pct / 100)) / kcalPerGram;
  if (!Number.isFinite(grams)) return null;
  return Math.round(grams);
};

export function useGoalsModel(_props: GoalsProps) {
  void _props;
  const [current, setCurrent] = useState<HealthGoal | null>(null);
  const [history, setHistory] = useState<HealthGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const defaultValues = {
    dailyCalorieGoal: "",
    proteinAsPct: false,
    proteinGoalG: "",
    carbsAsPct: false,
    carbsGoalG: "",
    fatAsPct: false,
    fatGoalG: "",
    waterGoalMl: "",
  };

  const form = useForm<CreateGoalForm>({
    resolver: zodResolver(createGoalSchema),
    defaultValues,
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
    form.reset(
      current
        ? {
            dailyCalorieGoal: String(current.dailyCalorieGoal),
            proteinAsPct: false,
            proteinGoalG: String(current.proteinGoalG),
            carbsAsPct: false,
            carbsGoalG: String(current.carbsGoalG),
            fatAsPct: false,
            fatGoalG: String(current.fatGoalG),
            waterGoalMl: current.waterGoalMl ? String(current.waterGoalMl) : "",
          }
        : defaultValues,
    );
    setIsCreateOpen(true);
  };

  const submitCreateGoal = form.handleSubmit(async (values) => {
    try {
      setSaving(true);
      const dailyCalories = Number(values.dailyCalorieGoal);

      let proteinGoalG = Number(values.proteinGoalG);
      if (values.proteinAsPct) {
        const computed = calcMacroGramsFromPct(dailyCalories, proteinGoalG, 4);
        if (computed === null) throw new Error("Proteína inválida");
        proteinGoalG = computed;
      }

      let carbsGoalG = Number(values.carbsGoalG);
      if (values.carbsAsPct) {
        const computed = calcMacroGramsFromPct(dailyCalories, carbsGoalG, 4);
        if (computed === null) throw new Error("Carbo inválido");
        carbsGoalG = computed;
      }

      let fatGoalG = Number(values.fatGoalG);
      if (values.fatAsPct) {
        const computed = calcMacroGramsFromPct(dailyCalories, fatGoalG, 9);
        if (computed === null) throw new Error("Gordura inválida");
        fatGoalG = computed;
      }

      const payload = {
        dailyCalorieGoal: dailyCalories,
        proteinGoalG,
        carbsGoalG,
        fatGoalG,
        waterGoalMl: values.waterGoalMl
          ? Number(values.waterGoalMl)
          : undefined,
      };

      if (current) {
        await healthApi.goals.update(current.id, payload);
        toast.success("Meta atualizada");
      } else {
        await healthApi.goals.create(payload);
        toast.success("Meta criada");
      }
      setIsCreateOpen(false);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  });

  const {
    dailyCalorieGoal,
    proteinAsPct,
    carbsAsPct,
    fatAsPct,
    proteinGoalG: proteinValue,
    carbsGoalG: carbsValue,
    fatGoalG: fatValue,
  } = form.watch();

  const dailyCalories = Number(dailyCalorieGoal);

  const proteinPct = proteinAsPct ? toNumberOrZero(proteinValue) : 0;
  const carbsPct = carbsAsPct ? toNumberOrZero(carbsValue) : 0;
  const fatPct = fatAsPct ? toNumberOrZero(fatValue) : 0;
  const totalPct = proteinPct + carbsPct + fatPct;
  const anyPct = proteinAsPct || carbsAsPct || fatAsPct;

  const proteinReg = form.register("proteinGoalG");
  const carbsReg = form.register("carbsGoalG");
  const fatReg = form.register("fatGoalG");

  const setOpts = { shouldDirty: true, shouldValidate: true } as const;

  const toggleProteinAsPct = (checked: boolean) => {
    form.setValue("proteinAsPct", checked, setOpts);
    if (!checked) return;
    const clamped = clampPct(
      String(toNumberOrZero(proteinValue)),
      100 - carbsPct - fatPct,
    );
    if (clamped !== proteinValue)
      form.setValue("proteinGoalG", clamped, setOpts);
  };

  const toggleCarbsAsPct = (checked: boolean) => {
    form.setValue("carbsAsPct", checked, setOpts);
    if (!checked) return;
    const clamped = clampPct(
      String(toNumberOrZero(carbsValue)),
      100 - proteinPct - fatPct,
    );
    if (clamped !== carbsValue) form.setValue("carbsGoalG", clamped, setOpts);
  };

  const toggleFatAsPct = (checked: boolean) => {
    form.setValue("fatAsPct", checked, setOpts);
    if (!checked) return;
    const clamped = clampPct(
      String(toNumberOrZero(fatValue)),
      100 - proteinPct - carbsPct,
    );
    if (clamped !== fatValue) form.setValue("fatGoalG", clamped, setOpts);
  };

  const onProteinChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!proteinAsPct) return proteinReg.onChange(e);
    form.setValue(
      "proteinGoalG",
      clampPct(e.target.value, 100 - carbsPct - fatPct),
      setOpts,
    );
  };

  const onCarbsChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!carbsAsPct) return carbsReg.onChange(e);
    form.setValue(
      "carbsGoalG",
      clampPct(e.target.value, 100 - proteinPct - fatPct),
      setOpts,
    );
  };

  const onFatChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!fatAsPct) return fatReg.onChange(e);
    form.setValue(
      "fatGoalG",
      clampPct(e.target.value, 100 - proteinPct - carbsPct),
      setOpts,
    );
  };

  return {
    data: { current, history },
    state: { loading, isCreateOpen, saving, form, isEditing: current !== null },
    setters: { setIsCreateOpen },
    actions: { reload: load, openCreate, submitCreateGoal },
    macros: {
      dailyCalories,
      proteinAsPct,
      carbsAsPct,
      fatAsPct,
      proteinPct,
      carbsPct,
      fatPct,
      totalPct,
      anyPct,
      proteinReg,
      carbsReg,
      fatReg,
      toggleProteinAsPct,
      toggleCarbsAsPct,
      toggleFatAsPct,
      onProteinChange,
      onCarbsChange,
      onFatChange,
    },
  };
}

export type GoalsModelOutput = ReturnType<typeof useGoalsModel>;
