import { Spinner, TextInput } from "flowbite-react";
import { HiSearch, HiX } from "react-icons/hi";

interface DadosBancariosToolbarProps {
   search: string;
   onSearchChange: (value: string) => void;
   total: number;
   isLoading: boolean;
   isFetching: boolean;
   hasActiveFilters: boolean;
   onClearFilters: () => void;
}

export function DadosBancariosToolbar({
   search,
   onSearchChange,
   total,
   isLoading,
   isFetching,
   hasActiveFilters,
   onClearFilters,
}: DadosBancariosToolbarProps) {
   return (
      <div className="rounded border border-slate-200 bg-white p-4 shadow-sm">
         <div className="relative">
            <HiSearch className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <TextInput
               id="search"
               type="text"
               placeholder="Buscar por nome de guerra ou nome completo..."
               value={search}
               onChange={(e) => onSearchChange(e.target.value)}
               className="pl-10"
            />
         </div>

         <div className="mt-3 flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
               <span className="text-gray-600 dark:text-gray-400">
                  Total:{" "}
                  {isLoading ? (
                     <span className="inline-block h-4 w-6 animate-pulse rounded bg-slate-200 align-middle" />
                  ) : (
                     <strong className="text-gray-900 dark:text-white">
                        {total}
                     </strong>
                  )}
               </span>
               {isFetching && !isLoading && (
                  <Spinner color="primary" size="sm" />
               )}
            </div>
            {hasActiveFilters && (
               <button
                  type="button"
                  onClick={onClearFilters}
                  className="flex items-center gap-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
               >
                  <HiX className="h-4 w-4" />
                  <span>Limpar filtros</span>
               </button>
            )}
         </div>
      </div>
   );
}
