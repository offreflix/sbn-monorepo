import type { MeasurementsProps } from "./measurements.type";
import { useMeasurementsModel } from "./measurements.model";
import { MeasurementsView } from "./measurements.view";

export function MeasurementsPage(props: MeasurementsProps) {
  const model = useMeasurementsModel(props);
  return <MeasurementsView {...model} />;
}

export default MeasurementsPage;
