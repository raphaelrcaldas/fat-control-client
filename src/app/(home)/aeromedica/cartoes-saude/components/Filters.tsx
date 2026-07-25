"use client";

import {
   TextInput,
   Spinner,
   Button,
   Dropdown,
   DropdownItem,
} from "flowbite-react";
import { HiSearch, HiX } from "react-icons/hi";
import { MdFlightTakeoff, MdPeopleAlt, MdFilterList } from "react-icons/md";
import clsx from "clsx";
import { MultiSelect } from "@/components/MultiSelect";
import { postoGradRecords } from "@/constants/militar";
import {
   FUNCOES_PRINCIPAIS,
   FUNC_LABELS,
} from "@/constants/tripulantes/funcoes";
import type { DateStatus } from "@/utils/dateStatus";
import { getStatusConfig } from "../utils/dateStatus";
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

// Cor e rótulo saem de `getStatusConfig` — a mesma fonte do farol da linha e
// dos StatCards. Cravar aqui seria a quarta cópia da paleta de status.
const SEVERIDADES: DateStatus[] = [
   "expired",
   "critical",
   "warning",
   "valid",
   "empty",
];

const STATUS_OPTIONS: {
   value: StatusFilter;
   label: string;
   dot?: string;
}[] = [
   { value: "all", label: "Todos" },
   ...SEVERIDADES.map((s) => {
      const cfg = getStatusConfig(s);
      return { value: s as StatusFilter, label: cfg.label, dot: cfg.dot };
   }),
   { value: "sem_ata", label: "Sem ata", dot: "bg-amber-500" },
];

export const STATUS_VALUES = STATUS_OPTIONS.map((o) => o.value);

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
         color={active ? "primary" : "light"}
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
   const activeStatus =
      STATUS_OPTIONS.find((o) => o.value === statusFilter) ?? STATUS_OPTIONS[0];

   return (
      <>
         {/* flex-wrap é obrigatório: sem ele o grupo de status estoura o card
             (overflow-hidden) entre 768px e ~1120px e os últimos filtros ficam
             fisicamente inalcançáveis, sem barra de rolagem que os revele. */}
         <div className="flex flex-col gap-3 p-4 md:flex-row md:flex-wrap md:items-center">
            {/* Busca — basis-64 impede o colapso para o tamanho do ícone
                quando a toolbar fica apertada (min-w-0 + flex-1 encolhia a 0).
                Só a partir de `md`: no mobile o container é `flex-col` e o
                basis viraria 224px de ALTURA (buraco no lugar da toolbar). */}
            <div className="md:min-w-[16rem] md:flex-1 md:basis-64">
               <TextInput
                  icon={HiSearch}
                  placeholder="Buscar por nome de guerra ou completo..."
                  value={searchUser}
                  onChange={(e) => onSearchChange(e.target.value)}
                  sizing="md"
               />
            </div>

            {/* No mobile os quatro filtros dividem duas linhas (P/G+Função,
                depois tripulante+status) em vez de uma pilha de quatro.
                `md:contents` dissolve este agrupador no desktop — lá os filhos
                voltam a ser irmãos diretos da toolbar. */}
            <div className="flex flex-wrap items-center gap-3 md:contents">
               {/* Par 1 — `w-full` obriga a linha própria: sem ele os dois
                   selects encolhiam a ~58px para caber junto do grupo de
                   tripulante (que tem largura fixa e não cede). */}
               <div className="flex w-full gap-3 md:contents">
                  {/* P/G */}
                  <MultiSelect
                     options={PG_OPTIONS}
                     selected={filterPG}
                     onChange={onFilterPGChange}
                     placeholder="P/G"
                     className="min-w-0 flex-1 md:w-44 md:flex-none"
                  />

                  {/* Funcao */}
                  <MultiSelect
                     options={FUNC_OPTIONS}
                     selected={filterFunc}
                     onChange={onFilterFuncChange}
                     placeholder="Função"
                     className="min-w-0 flex-1 md:w-44 md:flex-none"
                  />
               </div>

               {/* Par 2 — tripulante + status na mesma linha onde couber
                   (a partir de ~430px); abaixo disso o status desce. */}
               <div className="flex w-full flex-wrap items-center gap-2 sm:gap-3 md:contents">
                  {/* Tripulante — abaixo de 430px os ícones saem (os rótulos
                      já dizem tudo): são os ~60px que faltavam para o status
                      caber na mesma linha em vez de descer sozinho. */}
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

                  {/* Status — 6 chips só cabem no monitor largo; abaixo de xl a
                mesma lista vira menu, preservando a densidade da toolbar. */}
                  <div className="hidden items-center gap-1 rounded border border-slate-200 bg-white p-0.5 xl:flex">
                     {STATUS_OPTIONS.map((opt) => (
                        <FilterButton
                           key={opt.value}
                           active={statusFilter === opt.value}
                           onClick={() => onStatusFilterChange(opt.value)}
                           icon={opt.value === "all" ? MdFilterList : undefined}
                           dot={opt.dot}
                        >
                           {opt.label}
                        </FilterButton>
                     ))}
                  </div>

                  <div className="xl:hidden">
                     <Dropdown
                        dismissOnClick
                        size="xs"
                        color={statusFilter === "all" ? "light" : "primary"}
                        label={
                           <span className="flex items-center gap-1.5">
                              {activeStatus.dot ? (
                                 <span
                                    className={clsx(
                                       "h-2 w-2 rounded-full",
                                       activeStatus.dot
                                    )}
                                 />
                              ) : (
                                 <MdFilterList className="h-3.5 w-3.5" />
                              )}
                              Status: {activeStatus.label}
                           </span>
                        }
                     >
                        {STATUS_OPTIONS.map((opt) => (
                           <DropdownItem
                              key={opt.value}
                              onClick={() => onStatusFilterChange(opt.value)}
                           >
                              <span
                                 className={clsx(
                                    "flex items-center gap-2",
                                    statusFilter === opt.value &&
                                       "text-primary-600 font-semibold"
                                 )}
                              >
                                 {opt.dot ? (
                                    <span
                                       className={clsx(
                                          "h-2 w-2 rounded-full",
                                          opt.dot
                                       )}
                                    />
                                 ) : (
                                    <MdFilterList className="h-3.5 w-3.5" />
                                 )}
                                 {opt.label}
                              </span>
                           </DropdownItem>
                        ))}
                     </Dropdown>
                  </div>
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
