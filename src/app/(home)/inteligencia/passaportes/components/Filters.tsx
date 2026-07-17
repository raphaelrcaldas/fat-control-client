"use client";

import { memo } from "react";
import { TextInput, Spinner, Button } from "flowbite-react";
import { HiSearch, HiX } from "react-icons/hi";
import { MdFilterList } from "react-icons/md";
import clsx from "clsx";
import { MultiSelect } from "@/components/MultiSelect";
import { postoGradRecords } from "@/constants/militar";
import {
   FUNCOES_PRINCIPAIS,
   FUNC_LABELS,
} from "@/constants/tripulantes/funcoes";
import type { StatusFilter } from "../types";
import { getStatusConfig } from "../utils/dateStatus";

const PG_OPTIONS = postoGradRecords.map((pg) => ({
   value: pg.short,
   label: pg.mid,
}));

const FUNC_OPTIONS = FUNCOES_PRINCIPAIS.map((f) => ({
   value: f,
   label: FUNC_LABELS[f],
}));

// Chips de status (cores vêm de getStatusConfig — fonte única).
const STATUS_FILTERS: { value: Exclude<StatusFilter, "all">; label: string }[] =
   [
      { value: "expired", label: "Vencidos" },
      { value: "critical", label: "Críticos" },
      { value: "warning", label: "Atenção" },
      { value: "valid", label: "Regular" },
   ];

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
      <Button
         type="button"
         size="xs"
         color={active ? "primary" : "light"}
         onClick={onClick}
      >
         <span className="flex items-center gap-1.5">
            {dot && <span className={clsx("h-2 w-2 rounded-full", dot)} />}
            {children}
         </span>
      </Button>
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
         <div className="flex flex-col gap-3 p-4 md:flex-row md:flex-wrap md:items-center">
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

            <div className="flex items-center gap-1 rounded border border-slate-200 bg-white p-0.5">
               <FilterButton
                  active={statusFilter === "all"}
                  onClick={() => onStatusFilterChange("all")}
               >
                  <MdFilterList className="h-3.5 w-3.5" />
                  Todos
               </FilterButton>
               {STATUS_FILTERS.map(({ value, label }) => (
                  <FilterButton
                     key={value}
                     active={statusFilter === value}
                     onClick={() => onStatusFilterChange(value)}
                     dot={getStatusConfig(value).dot}
                  >
                     {label}
                  </FilterButton>
               ))}
            </div>
         </div>

         {!isLoading && (
            <div className="flex items-center justify-between border-t border-slate-200 bg-gray-50 px-4 py-2 text-sm">
               <div className="flex items-center gap-4">
                  <span className="text-gray-600">
                     Exibindo{" "}
                     <strong className="text-gray-900">{filteredCount}</strong>{" "}
                     de <strong className="text-gray-900">{totalCount}</strong>{" "}
                     militares
                  </span>
                  {isFetching && <Spinner color="primary" size="sm" />}
               </div>
               {hasActiveFilters && (
                  <Button
                     type="button"
                     size="xs"
                     color="light"
                     onClick={onClearFilters}
                  >
                     <HiX className="mr-1.5 h-4 w-4" />
                     Limpar filtros
                  </Button>
               )}
            </div>
         )}
      </>
   );
});

export default Filters;
