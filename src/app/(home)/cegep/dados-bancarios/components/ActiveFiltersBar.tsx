import { Badge } from "flowbite-react";
import { HiX } from "react-icons/hi";

interface ActiveFiltersBarProps {
   search: string;
   onClearSearch: () => void;
}

export function ActiveFiltersBar({
   search,
   onClearSearch,
}: ActiveFiltersBarProps) {
   if (!search) return null;

   return (
      <div className="flex flex-wrap items-center gap-2">
         <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Filtros ativos:
         </span>
         <Badge color="primary">
            <div className="flex items-center gap-1.5">
               <span>Busca: {search}</span>
               <button
                  type="button"
                  onClick={onClearSearch}
                  aria-label="Limpar busca"
                  className="hover:bg-primary-200 -my-2 grid size-[26px] place-items-center rounded-full pointer-coarse:size-[44px]"
               >
                  <HiX className="h-3 w-3" />
               </button>
            </div>
         </Badge>
      </div>
   );
}
