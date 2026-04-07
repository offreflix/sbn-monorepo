import { useNavigate } from "react-router-dom";
import type { DashboardProps } from "./dashboard.type";

export function useDashboardModel(_props: DashboardProps) {
  const navigate = useNavigate();

  return {
    actions: {
      handleReload: () => navigate("/dashboard"),
    },
  };
}

export type DashboardModelOutput = ReturnType<typeof useDashboardModel>;
