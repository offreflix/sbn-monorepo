import { useSettingsModel } from "./settings.model";
import { SettingsView } from "./settings.view";
import type { SettingsProps } from "./settings.type";

export function SettingsPage(props: SettingsProps) {
  const model = useSettingsModel(props);
  return <SettingsView {...model} />;
}

export default SettingsPage;
