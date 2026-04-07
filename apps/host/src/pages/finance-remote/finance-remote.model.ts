import { lazy } from "react";
import type { FinanceRemoteProps } from "./finance-remote.type";

const RemoteFinance = lazy(() => import("sbn_finance_mfe/App"));

export function useFinanceRemoteModel(_props: FinanceRemoteProps) {
  return {
    data: {
      RemoteFinance,
    },
  };
}

export type FinanceRemoteModelOutput = ReturnType<typeof useFinanceRemoteModel>;
