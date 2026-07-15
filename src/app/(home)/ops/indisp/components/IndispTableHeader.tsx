import clsx from "clsx";
import { datasIguais, startOfDay } from "utils/dateHandler";
import { getColumnVisibilityClass } from "../utils/columnVisibility";

function ThWeek({ dayRef, className }: { dayRef: Date; className?: string }) {
   const diaSemana = dayRef.getDay();
   const isWeekend = diaSemana === 0 || diaSemana === 6;

   return (
      <th
         scope="col"
         className={clsx(
            "px-1 py-2 text-center text-xs uppercase",
            {
               "font-bold text-red-700": isWeekend,
               "font-medium text-gray-600": !isWeekend,
            },
            className
         )}
      >
         {dayRef.toLocaleDateString("pt-BR", { weekday: "short" })}
      </th>
   );
}

function ThMonth({
   dayRef,
   today,
   className,
}: {
   dayRef: Date;
   today: Date;
   className?: string;
}) {
   const dateStr = dayRef.toLocaleDateString("pt-BR", {
      month: "2-digit",
      day: "2-digit",
   });

   const diaSemana = dayRef.getDay();
   const isWeekend = diaSemana === 0 || diaSemana === 6;
   const isToday = datasIguais(dayRef, today);
   const isPast = startOfDay(dayRef) < startOfDay(today);

   return (
      <th
         scope="col"
         className={clsx(
            "px-1 py-2 text-center text-sm font-bold transition-colors",
            {
               "bg-red-100 text-red-800": isWeekend && !isToday,
               "bg-yellow-400 text-gray-900 shadow-md": isToday,
               "bg-gray-300 text-gray-600": isPast && !isToday && !isWeekend,
               "bg-white text-gray-900": !isPast && !isToday && !isWeekend,
            },
            className
         )}
         aria-current={isToday ? "date" : undefined}
         aria-label={`Data: ${dateStr}${isToday ? " (hoje)" : ""}`}
      >
         {dateStr}
      </th>
   );
}

export function IndispTableHeader({
   dates,
   today,
}: {
   dates: Date[];
   today: Date;
}) {
   return (
      <thead className="sticky top-0 z-10 bg-white">
         <tr>
            <th scope="col">
               <span className="sr-only">Tripulante</span>
            </th>
            {dates.map((day, index) => (
               <ThWeek
                  key={index}
                  dayRef={day}
                  className={getColumnVisibilityClass(index)}
               />
            ))}
         </tr>
         <tr>
            <th scope="col">
               <span className="sr-only">Tripulante</span>
            </th>
            {dates.map((day, index) => (
               <ThMonth
                  key={index}
                  dayRef={day}
                  today={today}
                  className={getColumnVisibilityClass(index)}
               />
            ))}
         </tr>
      </thead>
   );
}
