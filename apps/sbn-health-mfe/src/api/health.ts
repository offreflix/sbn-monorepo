import { request } from "./client";

export type HealthGoal = {
  id: string;
  userId: string;
  dailyCalorieGoal: number;
  proteinGoalG: number;
  carbsGoalG: number;
  fatGoalG: number;
  waterGoalMl: number;
  activeFrom: string;
  createdAt: string;
  updatedAt: string;
};

export type Food = {
  id: string;
  name: string;
  brand?: string | null;
  servingSizeValue: string;
  servingSizeUnit: string;
  caloriesPerServing: number;
  proteinPerServing?: string | null;
  carbsPerServing?: string | null;
  fatPerServing?: string | null;
  isCustom: boolean;
  userId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type MealLog = {
  id: string;
  userId: string;
  foodId?: string | null;
  mealType: MealType;
  loggedAtDate: string;
  amountConsumed: string;
  unitConsumed: string;
  calcCalories: number;
  calcProtein?: string | null;
  calcCarbs?: string | null;
  calcFat?: string | null;
  createdAt: string;
  food?: Food | null;
};

export type WaterLog = {
  id: string;
  userId: string;
  volumeMl: number;
  loggedDate: string;
  createdAt: string;
};

export type Measurement = {
  id: string;
  userId: string;
  weightKg?: string | null;
  measuredAt: string;
  createdAt: string;
};

export type SummaryResponse = {
  date: string;
  goal: {
    dailyCalorieGoal: number;
    proteinGoalG: number;
    carbsGoalG: number;
    fatGoalG: number;
    waterGoalMl: number;
  } | null;
  consumed: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  water: {
    totalMl: number;
    goalMl: number | null;
  };
  meals: {
    breakfast: MealLog[];
    lunch: MealLog[];
    dinner: MealLog[];
    snack: MealLog[];
  };
};

export type CreateFoodRequest = {
  name: string;
  brand?: string;
  servingSizeValue: number;
  servingSizeUnit: string;
  caloriesPerServing: number;
  proteinPerServing?: number;
  carbsPerServing?: number;
  fatPerServing?: number;
};

export type UpdateFoodRequest = Partial<CreateFoodRequest>;

export type CreateGoalRequest = {
  dailyCalorieGoal: number;
  proteinGoalG: number;
  carbsGoalG: number;
  fatGoalG: number;
  waterGoalMl?: number;
  activeFrom?: string;
};

export type UpdateGoalRequest = Partial<CreateGoalRequest>;

export type CreateMealLogRequest = {
  foodId: string;
  mealType: MealType;
  amountConsumed: number;
  unitConsumed: string;
  loggedAtDate?: string;
};

export type CreateWaterLogRequest = {
  volumeMl: number;
  loggedDate?: string;
};

export type CreateMeasurementRequest = {
  weightKg: number;
  measuredAt?: string;
};

export const healthApi = {
  summary: {
    get: (date?: string) => {
      const params = new URLSearchParams();
      if (date) params.set("date", date);
      const qs = params.toString();
      return request<SummaryResponse>(
        `/api/health/summary${qs ? `?${qs}` : ""}`,
        {
          method: "GET",
        },
      );
    },
  },

  foods: {
    list: (search?: string) => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const qs = params.toString();
      return request<Food[]>(`/api/health/foods${qs ? `?${qs}` : ""}`, {
        method: "GET",
      });
    },
    create: (payload: CreateFoodRequest) =>
      request<Food>("/api/health/foods", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    update: (id: string, payload: UpdateFoodRequest) =>
      request<Food>(`/api/health/foods/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    delete: (id: string) =>
      request<void>(`/api/health/foods/${id}`, { method: "DELETE" }),
  },

  goals: {
    create: (payload: CreateGoalRequest) =>
      request<HealthGoal>("/api/health/goals", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    current: () =>
      request<HealthGoal>("/api/health/goals/current", { method: "GET" }),
    list: () => request<HealthGoal[]>("/api/health/goals", { method: "GET" }),
    update: (id: string, payload: UpdateGoalRequest) =>
      request<HealthGoal>(`/api/health/goals/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    delete: (id: string) =>
      request<void>(`/api/health/goals/${id}`, { method: "DELETE" }),
  },

  mealLogs: {
    create: (payload: CreateMealLogRequest) =>
      request<MealLog>("/api/health/meal-logs", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    list: (date?: string) => {
      const params = new URLSearchParams();
      if (date) params.set("date", date);
      const qs = params.toString();
      return request<{
        breakfast: MealLog[];
        lunch: MealLog[];
        dinner: MealLog[];
        snack: MealLog[];
      }>(`/api/health/meal-logs${qs ? `?${qs}` : ""}`, { method: "GET" });
    },
    delete: (id: string) =>
      request<void>(`/api/health/meal-logs/${id}`, { method: "DELETE" }),
  },

  waterLogs: {
    create: (payload: CreateWaterLogRequest) =>
      request<WaterLog>("/api/health/water-logs", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    list: (date?: string) => {
      const params = new URLSearchParams();
      if (date) params.set("date", date);
      const qs = params.toString();
      return request<{ entries: WaterLog[]; totalMl: number }>(
        `/api/health/water-logs${qs ? `?${qs}` : ""}`,
        { method: "GET" },
      );
    },
    delete: (id: string) =>
      request<void>(`/api/health/water-logs/${id}`, { method: "DELETE" }),
  },

  measurements: {
    create: (payload: CreateMeasurementRequest) =>
      request<Measurement>("/api/health/measurements", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    list: (startDate?: string, endDate?: string) => {
      const params = new URLSearchParams();
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      const qs = params.toString();
      return request<Measurement[]>(
        `/api/health/measurements${qs ? `?${qs}` : ""}`,
        { method: "GET" },
      );
    },
    delete: (id: string) =>
      request<void>(`/api/health/measurements/${id}`, { method: "DELETE" }),
  },
};
