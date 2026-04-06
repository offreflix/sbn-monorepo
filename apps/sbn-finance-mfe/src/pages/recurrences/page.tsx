import { useRecurrencesModel } from "./recurrences.model";
import { RecurrencesView } from "./recurrences.view";

export function RecurrencesPage() {
  const model = useRecurrencesModel();
  return <RecurrencesView {...model} />;
}

export default RecurrencesPage;
