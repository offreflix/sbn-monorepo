export type CategoryType = "Receita" | "Despesa";

export interface Category {
  id: string;
  userId?: string | null;
  name: string;
  type: CategoryType;
  icon?: string | null;
  color?: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateCategoryRequest {
  name: string;
  type: CategoryType;
  icon?: string;
  color?: string;
  isDefault?: boolean;
}

export interface UpdateCategoryRequest {
  name?: string;
  type?: CategoryType;
  icon?: string;
  color?: string;
}

export interface CategoriesProps {
  categories: Category[];
  onRefresh: () => void;
}
