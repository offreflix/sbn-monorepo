import type { Category } from "../../types/finance";

export interface CategoriesProps {
  categories: Category[];
  onRefresh: () => void;
}
