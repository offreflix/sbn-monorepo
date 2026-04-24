import type { MealLogsProps } from "./meal-logs.type";
import { useMealLogsModel } from "./meal-logs.model";
import { MealLogsView } from "./meal-logs.view";

export function MealLogsPage(props: MealLogsProps) {
  const model = useMealLogsModel(props);
  return <MealLogsView {...model} />;
}

export default MealLogsPage;
