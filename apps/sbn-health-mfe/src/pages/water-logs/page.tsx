import type { WaterLogsProps } from "./water-logs.type";
import { useWaterLogsModel } from "./water-logs.model";
import { WaterLogsView } from "./water-logs.view";

export function WaterLogsPage(props: WaterLogsProps) {
  const model = useWaterLogsModel(props);
  return <WaterLogsView {...model} />;
}

export default WaterLogsPage;
