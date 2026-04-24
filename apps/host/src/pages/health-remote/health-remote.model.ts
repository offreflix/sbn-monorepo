import { lazy } from "react";
import type { HealthRemoteProps } from "./health-remote.type";

const RemoteHealth = lazy(() => import("sbn_health_mfe/App"));

export function useHealthRemoteModel(_props: HealthRemoteProps) {
  return {
    data: {
      RemoteHealth,
    },
  };
}

export type HealthRemoteModelOutput = ReturnType<typeof useHealthRemoteModel>;
