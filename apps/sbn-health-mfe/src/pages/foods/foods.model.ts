import { useCallback, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { healthApi } from "../../api/health";
import type { FoodsProps } from "./foods.type";
import type { Food } from "../../api/health";
import { createFoodSchema, type CreateFoodFormValues } from "./foods.schema";

const createFoodDefaultValues: CreateFoodFormValues = {
  name: "",
  brand: "",
  servingSizeValue: "100",
  servingSizeUnit: "g",
  caloriesPerServing: "0",
  proteinPerServing: "",
  carbsPerServing: "",
  fatPerServing: "",
};

export function useFoodsModel(_props: FoodsProps) {
  void _props;
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const form = useForm<CreateFoodFormValues>({
    resolver: zodResolver(createFoodSchema),
    defaultValues: createFoodDefaultValues,
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const list = await healthApi.foods.list(search || undefined);
      setFoods(list);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao carregar alimentos";
      toast.error(msg);
      setFoods([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const id = setTimeout(load, 300);
    return () => clearTimeout(id);
  }, [load]);

  const openCreate = () => {
    form.reset(createFoodDefaultValues);
    setIsCreateOpen(true);
  };

  const onCreateOpenChange = (open: boolean) => {
    setIsCreateOpen(open);
    if (!open) form.reset(createFoodDefaultValues);
  };

  const submitCreateFood = form.handleSubmit(
    async (values) => {
      const parseOptional = (v: string | undefined) => {
        if (!v) return undefined;
        return Number(v);
      };

      try {
        setSaving(true);
        await healthApi.foods.create({
          name: values.name.trim(),
          brand: values.brand?.trim() || undefined,
          servingSizeValue: Number(values.servingSizeValue),
          servingSizeUnit: values.servingSizeUnit.trim(),
          caloriesPerServing: Number(values.caloriesPerServing),
          proteinPerServing: parseOptional(values.proteinPerServing),
          carbsPerServing: parseOptional(values.carbsPerServing),
          fatPerServing: parseOptional(values.fatPerServing),
        });
        toast.success("Alimento criado");
        setIsCreateOpen(false);
        form.reset(createFoodDefaultValues);
        await load();
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Erro ao criar alimento";
        toast.error(msg);
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

  return {
    data: { foods },
    state: {
      loading,
      search,
      isCreateOpen,
      saving,
      form,
    },
    setters: {
      setSearch,
      setIsCreateOpen: onCreateOpenChange,
    },
    actions: { reload: load, openCreate, submitCreateFood },
  };
}

export type FoodsModelOutput = ReturnType<typeof useFoodsModel>;
