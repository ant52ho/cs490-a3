import { CalendarSettings } from "@/components/settings/calendar-settings";
import { getCalendarEvents } from "@/lib/services/data-service";

export default async function CalendarPage() {
  const events = await getCalendarEvents();
  return <CalendarSettings events={events} />;
}
