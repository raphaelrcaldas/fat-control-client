"use client";

import { memo } from "react";
import { TextInput, Spinner } from "flowbite-react";
import { HiSearch, HiX } from "react-icons/hi";
import { MdFilterList } from "react-icons/md";
import clsx from "clsx";
import { MultiSelect } from "@/components/MultiSelect";
import { postoGradRecords } from "@/constants/militar";
import { FUNCOES_PRINCIPAIS, FUNC_LABELS } from "@/constants/tripulantes/funcoes";
import type { StatusFilter } from "../types";

const PG_OPTIONS = postoGradRecords.map((pg) => ({
   value: pg.short,
   label: pg.mid,
}));

const FUNC_OPTIONS = FUNCOES_PRINCIPAIS.map((f) => ({
   value: f,
   label: FUNC_LABELS[f],
}));

function FilterButton({
   active,
   onClick,
   children,
   dot,
}: {
   active: boolean;
   onClick: () => void;
   children: React.ReactNode;
   dot?: string;
}) {
   return (
      <button
         type="button"
         onClick={onClick}
         className={clsx(
            "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all",
            active
               ? "border-red-800 bg-red-800 text-white"
               : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
         )}
      >
         {dot && <span className={clsx("h-2 w-2 rounded-full", dot)} />}
         {children}
      </button>
   );
}

interface FiltersProps {
   search: string;
   onSearchChange: (value: string) => void;
   filterPG: string[];
   onFilterPGChange: (value: string[]) => void;
   filterFunc: string[];
   onFilterFuncChange: (value: string[]) => void;
   statusFilter: StatusFilter;
   onStatusFilterChange: (value: StatusFilter) => void;
   totalCount: number;
   filteredCount: number;
   isLoading: boolean;
   isFetching: boolean;
   hasActiveFilters: boolean;
   onClearFilters: () => void;
}

const Filters = memo(function Filters({
   search,
   onSearchChange,
   filterPG,
   onFilterPGChange,
   filterFunc,
   onFilterFuncChange,
   statusFilter,
   onStatusFilterChange,
   totalCount,
   filteredCount,
   isLoading,
   isFetching,
   hasActiveFilters,
   onClearFilters,
}: FiltersProps) {
   return (
      <>
         <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:flex-wrap">
            <div className="min-w-0 flex-1">
               <TextInput
                  icon={HiSearch}
                  placeholder="Buscar por nome de guerra..."
                  value={search}
                  onChange={(e) => onSearchChange(e.target.value)}
                  sizing="md"
               />
            </div>

            <MultiSelect
               options={PG_OPTIONS}
               selected={filterPG}
               onChange={onFilterPGChange}
               placeholder="P/G"
               className="w-44"
            />

            <MultiSelect
               options={FUNC_OPTIONS}
               selected={filterFunc}
               onChange={onFilterFuncChange}
               placeholder="Função"
               className="w-44"
            />

            <div className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white p-0.5">
               <FilterButton
                  active={statusFilter === "all"}
                  onClick={() => onStatusFilterChange("all")}
               >
                  <MdFilterList className="h-3.5 w-3.5" />
                  Todos
               </FilterButton>
               <FilterButton
                  active={statusFilter === "expired"}
                  onClick={() => onStatusFilterChange("expired")}
                  dot="bg-red-500"
               >
                  Vencidos
               </FilterButton>
               <FilterButton
                  active={statusFilter === "critical"}
                  onClick={() => onStatusFilterChange("critical")}
                  dot="bg-orange-500"
               >
                  Críticos
               </FilterButton>
               <FilterButton
                  active={statusFilter === "warning"}
                  onClick={() => onStatusFilterChange("warning")}
                  dot="bg-yellow-400"
               >
                  Atenção
               </FilterButton>
               <FilterButton
                  active={statusFilter === "valid"}
                  onClick={() => onStatusFilterChange("valid")}
                  dot="bg-green-500"
               >
                  Regular
               </FilterButton>
            </div>
         </div>

         {!isLoading && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-2 text-sm">
               <div className="flex items-center gap-4">
                  <span className="text-gray-600">
                     Exibindo{" "}
                     <strong className="text-gray-900">{filteredCount}</strong>{" "}
                     de{" "}
                     <strong className="text-gray-900">{totalCount}</strong>{" "}
                     militares
                  </span>
                  {isFetching && <Spinner color="failure" size="sm" />}
               </div>
               {hasActiveFilters && (
                  <button
                     type="button"
                     onClick={onClearFilters}
                     className="flex items-center gap-1 text-red-800 hover:text-red-900"
                  >
                     <HiX className="h-4 w-4" />
                     <span>Limpar filtros</span>
                  </button>
               )}
            </div>
         )}
      </>
   );
});

export default Filters;
