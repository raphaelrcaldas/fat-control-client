import type { OrdemMissaoList } from "services/routes/om/ordens";
import WeekCalendar from "./WeekCalendar";

interface MissionListPageProps {
   ordens: OrdemMissaoList[];
   isLoading: boolean;
   isFetching: boolean;
   currentWeekStart: Date;
   onNavigateWeek: (direction: number) => void;
}

export default function MissionListPage({
   ordens,
   isLoading,
   isFetching,
   currentWeekStart,
   onNavigateWeek,
}: MissionListPageProps) {
   return (
      <WeekCalendar
         ordens={ordens}
         isLoading={isLoading}
         isFetching={isFetching}
         currentWeekStart={currentWeekStart}
         onNavigateWeek={onNavigateWeek}
      />
   );
}
