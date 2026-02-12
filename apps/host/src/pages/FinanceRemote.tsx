import React, { Suspense, lazy } from "react";
import { Header } from "../components/Header";

const RemoteFinance = lazy(() => import("sbn_finance_mfe/App"));

export const FinanceRemotePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header subtitle="Finanças" />
      <main className="w-full">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="rounded-md border border-border p-4 text-sm text-muted-foreground">
                Carregando remote de finanças...
              </div>
            </div>
          }
        >
          <RemoteFinance />
        </Suspense>
      </main>
    </div>
  );
};
