import { CATEGORY_STYLE } from "./constants";

export function FlightCategoryBadge({ cat }: { cat: string }) {
   const s = CATEGORY_STYLE[cat] ?? CATEGORY_STYLE.VFR;
   return (
      <span
         className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${s.bg} ${s.text}`}
      >
         <span className={`h-2 w-2 rounded-full ${s.dot}`} />
         {s.label}
      </span>
   );
}
