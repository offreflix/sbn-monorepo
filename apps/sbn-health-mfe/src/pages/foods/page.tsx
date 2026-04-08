import type { FoodsProps } from "./foods.type";
import { useFoodsModel } from "./foods.model";
import { FoodsView } from "./foods.view";

export function FoodsPage(props: FoodsProps) {
  const model = useFoodsModel(props);
  return <FoodsView {...model} />;
}

export default FoodsPage;

