import type { DashboardProps } from "./dashboard.type";
import { useDashboardModel } from "./dashboard.model";
import { DashboardView } from "./dashboard.view";

export function Dashboard(props: DashboardProps) {
  const model = useDashboardModel(props);
  return <DashboardView {...model} />;
}

export default Dashboard;
