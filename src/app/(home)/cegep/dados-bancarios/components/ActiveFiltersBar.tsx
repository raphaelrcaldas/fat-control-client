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
         <Badge color="failure">
            <div className="flex items-center gap-1.5">
               <span>Busca: {search}</span>
               <button
                  type="button"
                  onClick={onClearSearch}
                  className="rounded-full p-0.5 hover:bg-red-200"
               >
                  <HiX className="h-3 w-3" />
               </button>
            </div>
         </Badge>
      </div>
   );
}
