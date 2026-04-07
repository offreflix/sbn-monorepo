import { useDashboardModel } from "./dashboard.model";
import { DashboardView } from "./dashboard.view";
import type { DashboardProps } from "./dashboard.type";

export function DashboardPage(props: DashboardProps) {
  const model = useDashboardModel(props);
  return <DashboardView {...model} />;
}

export default DashboardPage;
