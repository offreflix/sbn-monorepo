import type { GoalsProps } from "./goals.type";
import { useGoalsModel } from "./goals.model";
import { GoalsView } from "./goals.view";

export function GoalsPage(props: GoalsProps) {
  const model = useGoalsModel(props);
  return <GoalsView {...model} />;
}

export default GoalsPage;
