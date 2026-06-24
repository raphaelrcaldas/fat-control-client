import clsx from "clsx";
import { FaMapMarkerAlt } from "react-icons/fa";
import type { RankedCidade } from "./useCitySearch";

export function CityResultRow({
   cidade,
   onSelect,
}: {
   cidade: RankedCidade;
   onSelect: () => void;
}) {
   const destaque = cidade.mais_usada;

   return (
      <button
         type="button"
         onClick={onSelect}
         className={clsx(
            "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
            destaque
               ? "bg-amber-50 hover:bg-amber-100"
               : "bg-white hover:bg-slate-50"
         )}
      >
         <FaMapMarkerAlt
            className={clsx(
               "size-4 shrink-0",
               destaque ? "text-amber-500" : "text-slate-400"
            )}
         />
         <span className="flex-1 font-medium text-slate-800">
            {cidade.nome}
         </span>
         {destaque && cidade.usos != null && (
            <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
               {cidade.usos}× usada
            </span>
         )}
         <span className="rounded bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
            {cidade.uf}
         </span>
      </button>
   );
}
