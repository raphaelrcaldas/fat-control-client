"use client";

import { Badge } from "flowbite-react";
import { HiCalendar, HiUser, HiX } from "react-icons/hi";

interface ActiveFilterTagsProps {
   anoRef: number;
   anoActive: boolean;
   piloto: string;
   pilotoActive: boolean;
   onRemoveAno: () => void;
   onRemovePiloto: () => void;
   onClearAll: () => void;
}

const removeButtonClass =
   "hover:text-primary-900 -my-2 ml-0.5 grid size-[26px] shrink-0 place-items-center rounded";

export function ActiveFilterTags({
   anoRef,
   anoActive,
   piloto,
   pilotoActive,
   onRemoveAno,
   onRemovePiloto,
   onClearAll,
}: ActiveFilterTagsProps) {
   if (!anoActive && !pilotoActive) return null;

   return (
      <div className="hidden shrink-0 flex-wrap items-center gap-2 sm:flex">
         <span className="text-xs font-medium text-gray-600">
            Filtros ativos:
         </span>

         {anoActive && (
            <Badge color="primary">
               <div className="flex items-center gap-1.5">
                  <HiCalendar className="h-3 w-3" />
                  <span>Ano: {anoRef}</span>
                  <button
                     type="button"
                     aria-label="Remover filtro de ano"
                     onClick={onRemoveAno}
                     className={removeButtonClass}
                  >
                     <HiX className="h-3 w-3" />
                  </button>
               </div>
            </Badge>
         )}

         {pilotoActive && (
            <Badge color="primary">
               <div className="flex min-w-0 items-center gap-1.5">
                  <HiUser className="h-3 w-3 shrink-0" />
                  <span className="max-w-64 truncate" title={piloto}>
                     Piloto: {piloto}
                  </span>
                  <button
                     type="button"
                     aria-label="Remover filtro de piloto"
                     onClick={onRemovePiloto}
                     className={removeButtonClass}
                  >
                     <HiX className="h-3 w-3" />
                  </button>
               </div>
            </Badge>
         )}

         <button
            type="button"
            onClick={onClearAll}
            className="-my-2 rounded px-1 py-2 text-xs text-gray-500 underline hover:text-gray-700"
         >
            Limpar todos
         </button>
      </div>
   );
}
