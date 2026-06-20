"use client";

import { TextInput, Spinner, Button } from "flowbite-react";
import { HiSearch, HiX } from "react-icons/hi";
import { MdFlightTakeoff, MdPeopleAlt, MdFilterList } from "react-icons/md";
import clsx from "clsx";
import { MultiSelect } from "@/components/MultiSelect";
import { postoGradRecords } from "@/constants/militar";
import {
   FUNCOES_PRINCIPAIS,
   FUNC_LABELS,
} from "@/constants/tripulantes/funcoes";
import type { TripFilter, StatusFilter } from "../types";

// ========================================
// Constants
// ========================================

const PG_OPTIONS = postoGradRecords.map((pg) => ({
   value: pg.short,
   label: pg.mid,
}));

const FUNC_OPTIONS = FUNCOES_PRINCIPAIS.map((f) => ({
   value: f,
   label: FUNC_LABELS[f],
}));

// ========================================
// FilterButton
// ========================================

function FilterButton({
   active,
   onClick,
   children,
   icon: Icon,
   dot,
}: {
   active: boolean;
   onClick: () => void;
   children: React.ReactNode;
   icon?: React.ComponentType<{ className?: string }>;
   dot?: string;
}) {
   return (
      <Button
         type="button"
         size="xs"
         color={active ? "blue" : "light"}
         onClick={onClick}
      >
         <span className="flex items-center gap-1.5">
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {dot && <span className={clsx("h-2 w-2 rounded-full", dot)} />}
            {children}
         </span>
      </Button>
   );
}

// ========================================
// Filters
// ========================================

interface FiltersProps {
   searchUser: string;
   onSearchChange: (value: string) => void;
   filterPG: string[];
   onFilterPGChange: (value: string[]) => void;
   filterFunc: string[];
   onFilterFuncChange: (value: string[]) => void;
   tripFilter: TripFilter;
   onTripFilterChange: (value: TripFilter) => void;
   statusFilter: StatusFilter;
   onStatusFilterChange: (value: StatusFilter) => void;
   totalCount: number;
   filteredCount: number;
   isLoading: boolean;
   isFetching: boolean;
   hasActiveFilters: boolean;
   onClearFilters: () => void;
}

export default function Filters({
   searchUser,
   onSearchChange,
   filterPG,
   onFilterPGChange,
   filterFunc,
   onFilterFuncChange,
   tripFilter,
   onTripFilterChange,
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
         <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
            {/* Busca */}
            <div className="min-w-0 flex-1">
               <TextInput
                  icon={HiSearch}
                  placeholder="Buscar por nome, posto..."
                  value={searchUser}
                  onChange={(e) => onSearchChange(e.target.value)}
                  sizing="md"
               />
            </div>

            {/* P/G */}
            <MultiSelect
               options={PG_OPTIONS}
               selected={filterPG}
               onChange={onFilterPGChange}
               placeholder="P/G"
               className="w-44"
            />

            {/* Funcao */}
            <MultiSelect
               options={FUNC_OPTIONS}
               selected={filterFunc}
               onChange={onFilterFuncChange}
               placeholder="Função"
               className="w-44"
            />

            {/* Tripulante */}
            <div className="flex items-center gap-1 rounded border border-slate-200 bg-white p-0.5">
               <FilterButton
                  active={tripFilter === "all"}
                  onClick={() => onTripFilterChange("all")}
                  icon={MdPeopleAlt}
               >
                  Todos
               </FilterButton>
               <FilterButton
                  active={tripFilter === "trip"}
                  onClick={() => onTripFilterChange("trip")}
                  icon={MdFlightTakeoff}
               >
                  Tripulantes
               </FilterButton>
               <FilterButton
                  active={tripFilter === "naoTrip"}
                  onClick={() => onTripFilterChange("naoTrip")}
                  icon={MdPeopleAlt}
               >
                  Não Trip.
               </FilterButton>
            </div>

            {/* Status */}
            <div className="flex items-center gap-1 rounded border border-slate-200 bg-white p-0.5">
               <FilterButton
                  active={statusFilter === "all"}
                  onClick={() => onStatusFilterChange("all")}
                  icon={MdFilterList}
               >
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
               <FilterButton
                  active={statusFilter === "sem_ata"}
                  onClick={() => onStatusFilterChange("sem_ata")}
                  dot="bg-amber-500"
               >
                  Sem ata
               </FilterButton>
            </div>
         </div>

         {/* Stats bar */}
         {!isLoading && (
            <div className="flex items-center justify-between border-t border-slate-200 bg-gray-50 px-4 py-2 text-sm">
               <div className="flex items-center gap-4">
                  <span className="text-gray-600">
                     Exibindo{" "}
                     <strong className="text-gray-900">{filteredCount}</strong>{" "}
                     de <strong className="text-gray-900">{totalCount}</strong>{" "}
                     militares
                  </span>
                  {isFetching && <Spinner color="failure" size="sm" />}
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
}
