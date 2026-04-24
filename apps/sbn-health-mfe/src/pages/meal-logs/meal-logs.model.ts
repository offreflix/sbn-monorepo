import { useCallback, useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { healthApi } from "../../api/health";
import type { MealLogsProps } from "./meal-logs.type";
import type { Food, MealLog, MealType } from "../../api/health";
import {
  createMealLogSchema,
  type CreateMealLogFormValues,
} from "./meal-logs.schema";

const createMealLogDefaultValues: CreateMealLogFormValues = {
  foodId: "",
  mealType: "lunch",
  quantity: "1",
  servingMode: "serving",
};

export function useMealLogsModel({ selectedDate }: MealLogsProps) {
  const [logs, setLogs] = useState<{
    breakfast: MealLog[];
    lunch: MealLog[];
    dinner: MealLog[];
    snack: MealLog[];
  }>({ breakfast: [], lunch: [], dinner: [], snack: [] });
  const [loading, setLoading] = useState(true);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [foodSearch, setFoodSearch] = useState("");
  const [foods, setFoods] = useState<Food[]>([]);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const form = useForm<CreateMealLogFormValues>({
    resolver: zodResolver(createMealLogSchema),
    defaultValues: createMealLogDefaultValues,
  });

  const groups: Array<[MealType, string]> = [
    ["breakfast", "Café da manhã"],
    ["lunch", "Almoço"],
    ["dinner", "Jantar"],
    ["snack", "Lanche"],
  ];

  const selectedFoodId = useWatch({ control: form.control, name: "foodId" });
  const quantity = useWatch({ control: form.control, name: "quantity" });
  const servingMode = useWatch({ control: form.control, name: "servingMode" });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await healthApi.mealLogs.list(selectedDate);
      setLogs(data);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Erro ao carregar refeições",
      );
      setLogs({ breakfast: [], lunch: [], dinner: [], snack: [] });
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  const loadFoods = useCallback(async (search?: string) => {
    try {
      const list = await healthApi.foods.list(search);
      setFoods(list);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Erro ao carregar alimentos",
      );
      setFoods([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!isCreateOpen) return;
    const handle = setTimeout(() => {
      loadFoods(foodSearch.trim() || undefined);
    }, 250);
    return () => clearTimeout(handle);
  }, [foodSearch, isCreateOpen, loadFoods]);

  useEffect(() => {
    if (!isCreateOpen) return;
    if (foods.length === 0) return;

    const stillExists = selectedFoodId
      ? foods.some((f) => f.id === selectedFoodId)
      : false;

    if (!selectedFoodId || !stillExists) {
      form.setValue("foodId", foods[0].id, { shouldValidate: true });
    }
  }, [foods, form, isCreateOpen, selectedFoodId]);

  const selectedFood = useMemo(
    () => foods.find((f) => f.id === selectedFoodId) ?? null,
    [foods, selectedFoodId],
  );

  const servingPreview = useMemo(() => {
    if (!selectedFood) return null;
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0) return null;

    const servingSize = Number(selectedFood.servingSizeValue);
    const rawAmount = servingMode === "serving" ? qty * servingSize : qty;
    const ratio = rawAmount / servingSize;

    return {
      amount: rawAmount,
      unit: selectedFood.servingSizeUnit,
      kcal: Math.round(selectedFood.caloriesPerServing * ratio),
      protein:
        selectedFood.proteinPerServing != null
          ? Math.round(Number(selectedFood.proteinPerServing) * ratio * 10) / 10
          : null,
      carbs:
        selectedFood.carbsPerServing != null
          ? Math.round(Number(selectedFood.carbsPerServing) * ratio * 10) / 10
          : null,
      fat:
        selectedFood.fatPerServing != null
          ? Math.round(Number(selectedFood.fatPerServing) * ratio * 10) / 10
          : null,
    };
  }, [selectedFood, quantity, servingMode]);

  const openCreate = async () => {
    form.reset(createMealLogDefaultValues);
    setIsCreateOpen(true);
    if (foods.length === 0) await loadFoods();
  };

  const onCreateOpenChange = (open: boolean) => {
    setIsCreateOpen(open);
    if (!open) {
      setFoodSearch("");
      form.reset(createMealLogDefaultValues);
    }
  };

  const submitCreateMealLog = form.handleSubmit(
    async (values) => {
      try {
        setSaving(true);
        if (!selectedFood) throw new Error("Alimento não encontrado");

        const qty = Number(values.quantity);
        const servingSize = Number(selectedFood.servingSizeValue);
        const amountConsumed =
          values.servingMode === "serving" ? qty * servingSize : qty;

        await healthApi.mealLogs.create({
          foodId: values.foodId,
          mealType: values.mealType as MealType,
          amountConsumed,
          unitConsumed: selectedFood.servingSizeUnit,
          loggedAtDate: selectedDate,
        });
        setIsCreateOpen(false);
        setFoodSearch("");
        form.reset(createMealLogDefaultValues);
        await load();
        toast.success("Refeição adicionada");
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : "Erro ao adicionar refeição",
        );
      } finally {
        setSaving(false);
      }
    },
    (errors) => {
      const first = Object.values(errors)[0];
      const msg =
        first && "message" in first && typeof first.message === "string"
          ? first.message
          : "Dados inválidos";
      toast.error(msg);
    },
  );

  const deleteMealLog = async (id: string) => {
    try {
      setDeletingId(id);
      await healthApi.mealLogs.delete(id);
      await load();
      toast.success("Refeição removida");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao remover refeição");
    } finally {
      setDeletingId(null);
    }
  };

  const groupedTotal = useMemo(() => {
    const all = [
      ...logs.breakfast,
      ...logs.lunch,
      ...logs.dinner,
      ...logs.snack,
    ];
    return {
      count: all.length,
      calories: all.reduce((acc, it) => acc + (it.calcCalories || 0), 0),
      protein:
        Math.round(
          all.reduce((acc, it) => acc + Number(it.calcProtein || 0), 0) * 10,
        ) / 10,
      carbs:
        Math.round(
          all.reduce((acc, it) => acc + Number(it.calcCarbs || 0), 0) * 10,
        ) / 10,
      fat:
        Math.round(
          all.reduce((acc, it) => acc + Number(it.calcFat || 0), 0) * 10,
        ) / 10,
    };
  }, [logs]);

  return {
    data: { logs, foods, selectedFood, servingPreview, groupedTotal, groups },
    state: {
      loading,
      isCreateOpen,
      foodSearch,
      saving,
      deletingId,
      form,
    },
    setters: {
      setIsCreateOpen: onCreateOpenChange,
      setFoodSearch,
    },
    actions: { reload: load, openCreate, submitCreateMealLog, deleteMealLog },
  };
}

export type MealLogsModelOutput = ReturnType<typeof useMealLogsModel>;
