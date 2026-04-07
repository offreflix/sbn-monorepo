import { useFinanceRemoteModel } from "./finance-remote.model";
import { FinanceRemoteView } from "./finance-remote.view";
import type { FinanceRemoteProps } from "./finance-remote.type";

export function FinanceRemotePage(props: FinanceRemoteProps) {
  const model = useFinanceRemoteModel(props);
  return <FinanceRemoteView {...model} />;
}

export default FinanceRemotePage;
