"use client";

import { useMemo, useState } from "react";

import { TextInput, Spinner, Button } from "flowbite-react";
import { HiSearch, HiX } from "react-icons/hi";
import {
   MdFlightTakeoff,
   MdPeopleAlt,
   MdFilterList,
   MdErrorOutline,
} from "react-icons/md";
import clsx from "clsx";
import { MultiSelect } from "@/components/MultiSelect";
import { postoGradRecords } from "@/constants/militar";
import { useFuncoes } from "@/hooks/queries";
import type { TripFilter } from "../types";

const PG_OPTIONS = postoGradRecords.map((pg) => ({
   value: pg.short,
   label: pg.mid,
}));

// ========================================
// FilterButton
// ========================================

function FilterButton({
   active,
   onClick,
   children,
   icon: Icon,
}: {
   active: boolean;
   onClick: () => void;
   children: React.ReactNode;
   icon?: React.ComponentType<{ className?: string }>;
}) {
   return (
      <Button
         type="button"
         size="xs"
         color={active ? "primary" : "light"}
         onClick={onClick}
      >
         <span className="flex items-center gap-1.5">
            {Icon && <Icon className="h-3.5 w-3.5" />}
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
   semAta: boolean;
   onSemAtaChange: (value: boolean) => void;
   totalCount: number;
   filteredCount: number;
   isLoading: boolean;
   isFetching: boolean;
   hasActiveFilters: boolean;
   onClearFilters: () => void;
}

/**
 * Busca e recortes da listagem.
 *
 * O filtro de validade não mora aqui — ele é o próprio resumo (ver
 * SummaryBar), para o número e a ação serem a mesma coisa. Sobrou o que é de
 * outro eixo: quem é o militar (P/G, função, tripulante) e se a ata do CEMAL
 * está anexada.
 *
 * No mobile os filtros ficam atrás do botão "Filtros": empilhados eles
 * ocupavam meia tela antes da primeira linha da lista. No desktop (md+) o
 * wrapper vira `contents` e eles voltam a dividir a linha com a busca.
 */
export default function Filters({
   searchUser,
   onSearchChange,
   filterPG,
   onFilterPGChange,
   filterFunc,
   onFilterFuncChange,
   tripFilter,
   onTripFilterChange,
   semAta,
   onSemAtaChange,
   totalCount,
   filteredCount,
   isLoading,
   isFetching,
   hasActiveFilters,
   onClearFilters,
}: FiltersProps) {
   const [showFilters, setShowFilters] = useState(false);
   const { principais } = useFuncoes();
   const funcOptions = useMemo(
      () => principais.map((f) => ({ value: f.cod, label: f.nome })),
      [principais]
   );

   const activeCount =
      filterPG.length +
      filterFunc.length +
      (tripFilter !== "all" ? 1 : 0) +
      (semAta ? 1 : 0);

   return (
      <>
         <div className="flex flex-col gap-3 p-4 md:flex-row md:flex-wrap md:items-center">
            <div className="flex gap-2 md:min-w-[16rem] md:flex-1 md:basis-64">
               <div className="min-w-0 flex-1">
                  <TextInput
                     icon={HiSearch}
                     placeholder="Buscar por nome de guerra ou completo..."
                     value={searchUser}
                     onChange={(e) => onSearchChange(e.target.value)}
                     sizing="md"
                  />
               </div>
               <Button
                  type="button"
                  color={activeCount > 0 ? "primary" : "light"}
                  onClick={() => setShowFilters((v) => !v)}
                  aria-expanded={showFilters}
                  aria-controls="cartoes-filtros"
                  className="shrink-0 md:hidden"
               >
                  <span className="flex items-center gap-1.5">
                     <MdFilterList className="h-4 w-4" />
                     Filtros
                     {activeCount > 0 && <span>({activeCount})</span>}
                  </span>
               </Button>
            </div>

            <div
               id="cartoes-filtros"
               className={clsx(
                  "flex-col gap-3 md:contents",
                  showFilters ? "flex" : "hidden"
               )}
            >
               <MultiSelect
                  options={PG_OPTIONS}
                  selected={filterPG}
                  onChange={onFilterPGChange}
                  placeholder="P/G"
                  className="md:w-44"
               />

               <MultiSelect
                  options={funcOptions}
                  selected={filterFunc}
                  onChange={onFilterFuncChange}
                  placeholder="Função"
                  className="md:w-44"
               />

               <div className="flex flex-wrap items-center gap-2">
                  {/* Tripulante — abaixo de 430px os ícones saem (os rótulos
                      já dizem tudo). */}
                  <div className="flex items-center gap-1 rounded border border-slate-200 bg-white p-0.5 max-[430px]:[&_svg]:hidden">
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

                  {/* Ata é eixo próprio (documento anexado, não validade):
                      por isso um toggle solto, e não uma opção do resumo. */}
                  <Button
                     type="button"
                     size="xs"
                     color={semAta ? "primary" : "light"}
                     aria-pressed={semAta}
                     onClick={() => onSemAtaChange(!semAta)}
                  >
                     <span className="flex items-center gap-1.5">
                        <MdErrorOutline className="h-3.5 w-3.5" />
                        Sem ata
                     </span>
                  </Button>
               </div>
            </div>
         </div>

         {/* Stats bar — renderizada também durante o carregamento (com os
             números em bloco) para a tabela não descer 39px quando os dados
             chegam. O CLS não pega esse salto: skeleton e conteúdo são nós
             diferentes, e a API de layout-shift só mede o mesmo nó. */}
         {/* min-h: o botão "Limpar filtros" (que só existe depois do
             carregamento) é mais alto que o texto — sem o piso, a tabela ainda
             descia 17px quando os dados chegavam com filtro ativo. */}
         <div className="flex min-h-11 items-center justify-between border-t border-slate-200 bg-gray-50 px-4 py-2 text-sm">
            <div className="flex items-center gap-4">
               {isLoading ? (
                  <div className="h-4 w-44 animate-pulse rounded bg-slate-200" />
               ) : (
                  <span className="text-gray-600">
                     Exibindo{" "}
                     <strong className="text-gray-900 tabular-nums">
                        {filteredCount}
                     </strong>{" "}
                     de{" "}
                     <strong className="text-gray-900 tabular-nums">
                        {totalCount}
                     </strong>{" "}
                     militares
                  </span>
               )}
               {isFetching && !isLoading && (
                  <Spinner color="primary" size="sm" />
               )}
            </div>
            {!isLoading && hasActiveFilters && (
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
      </>
   );
}
