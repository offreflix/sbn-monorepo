import { Suspense } from "react";
import { Header } from "../../components/Header";
import type { HealthRemoteModelOutput } from "./health-remote.model";

export function HealthRemoteView({
  data: { RemoteHealth },
}: HealthRemoteModelOutput) {
  return (
    <div className="min-h-screen bg-background">
      <Header subtitle="Saúde" />
      <main className="w-full">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="rounded-md border border-border p-4 text-sm text-muted-foreground">
                Carregando remote de saúde...
              </div>
            </div>
          }
        >
          <RemoteHealth />
        </Suspense>
      </main>
    </div>
  );
}
