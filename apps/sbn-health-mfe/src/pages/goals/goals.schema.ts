import { z } from "zod";

export const createGoalSchema = z
  .object({
    dailyCalorieGoal: z
      .string()
      .min(1, "Obrigatório")
      .refine(
        (v) => !isNaN(Number(v)) && Number(v) > 0,
        "Deve ser maior que 0",
      ),

    proteinAsPct: z.boolean().optional(),
    proteinGoalG: z
      .string()
      .min(1, "Obrigatório")
      .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, "Inválido"),

    carbsAsPct: z.boolean().optional(),
    carbsGoalG: z
      .string()
      .min(1, "Obrigatório")
      .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, "Inválido"),

    fatAsPct: z.boolean().optional(),
    fatGoalG: z
      .string()
      .min(1, "Obrigatório")
      .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, "Inválido"),

    waterGoalMl: z
      .string()
      .optional()
      .refine((v) => !v || (!isNaN(Number(v)) && Number(v) >= 0), "Inválido"),
  })
  .superRefine((values, ctx) => {
    const validatePct = (
      enabled: boolean | undefined,
      field: "proteinGoalG" | "carbsGoalG" | "fatGoalG",
      label: string,
    ) => {
      if (!enabled) return;
      const n = Number(values[field]);
      if (n < 0 || n > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [field],
          message: `${label}: deve ser entre 0 e 100`,
        });
      }
    };

    validatePct(values.proteinAsPct, "proteinGoalG", "Proteína (%)");
    validatePct(values.carbsAsPct, "carbsGoalG", "Carbo (%)");
    validatePct(values.fatAsPct, "fatGoalG", "Gordura (%)");

    const num = (field: "proteinGoalG" | "carbsGoalG" | "fatGoalG") => {
      const n = Number(values[field]);
      return Number.isFinite(n) ? n : 0;
    };

    const pctSum =
      (values.proteinAsPct ? num("proteinGoalG") : 0) +
      (values.carbsAsPct ? num("carbsGoalG") : 0) +
      (values.fatAsPct ? num("fatGoalG") : 0);

    if (pctSum > 100) {
      const firstEnabledField: "proteinGoalG" | "carbsGoalG" | "fatGoalG" =
        values.proteinAsPct
          ? "proteinGoalG"
          : values.carbsAsPct
            ? "carbsGoalG"
            : "fatGoalG";
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [firstEnabledField],
        message: "Soma das porcentagens deve ser no máximo 100",
      });
    }
  });
