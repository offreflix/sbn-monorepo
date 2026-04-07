import type { ApiKey } from "../../api/apiKeys";

export interface SettingsProps {}

export interface SettingsState {
  isDialogOpen: boolean;
  createdRawKey: string | null;
  formName: string;
  formExpiresAt: string;
  loading: boolean;
}
