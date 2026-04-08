import type { SummaryProps } from "./summary.type";
import { useSummaryModel } from "./summary.model";
import { SummaryView } from "./summary.view";

export function SummaryPage(props: SummaryProps) {
  const model = useSummaryModel(props);
  return <SummaryView {...model} />;
}

export default SummaryPage;

