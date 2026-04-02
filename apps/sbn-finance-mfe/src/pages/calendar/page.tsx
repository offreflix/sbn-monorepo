import type { CalendarProps } from "./calendar.type";
import { useCalendarModel } from "./calendar.model";
import { CalendarView as ViewComponent } from "./calendar.view";

export function CalendarView(props: CalendarProps) {
  const model = useCalendarModel(props);
  return <ViewComponent {...model} />;
}

export default CalendarView;
