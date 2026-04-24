import { useHealthRemoteModel } from "./health-remote.model";
import { HealthRemoteView } from "./health-remote.view";
import type { HealthRemoteProps } from "./health-remote.type";

export function HealthRemotePage(props: HealthRemoteProps) {
  const model = useHealthRemoteModel(props);
  return <HealthRemoteView {...model} />;
}

export default HealthRemotePage;
