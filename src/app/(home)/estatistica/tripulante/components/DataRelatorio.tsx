import { isoDateToString, formatDateFull } from "@/../utils/dateHandler";

export function DataRelatorio({ data }: { data: string | null }) {
   if (!data) return "—";

   return (
      <time dateTime={data}>
         <span className="sm:hidden">{isoDateToString(data)}</span>
         <span className="hidden sm:inline">{formatDateFull(data)}</span>
      </time>
   );
}
