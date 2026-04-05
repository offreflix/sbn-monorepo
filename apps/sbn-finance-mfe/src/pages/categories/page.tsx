import type { CategoriesProps } from "./categories.type";
import { useCategoriesModel } from "./categories.model";
import { CategoriesView } from "./categories.view";

export function CategoryGrid(props: CategoriesProps) {
  const model = useCategoriesModel(props);
  return <CategoriesView {...model} />;
}

export default CategoryGrid;
