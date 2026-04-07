import { useLandingModel } from "./landing.model";
import { LandingView } from "./landing.view";
import type { LandingProps } from "./landing.type";

export function LandingPage(props: LandingProps) {
  const model = useLandingModel(props);
  return <LandingView {...model} />;
}

export default LandingPage;
