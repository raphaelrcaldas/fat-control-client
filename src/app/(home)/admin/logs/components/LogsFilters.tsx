"use client";

import { useState } from "react";
import { Button, Label, Select, TextInput } from "flowbite-react";
import { HiChevronDown, HiFilter, HiSearch, HiX } from "react-icons/hi";
import clsx from "clsx";
import { isoDateToString } from "@/../utils/dateHandler";

const ACTION_OPTIONS = [
   { value: "login", label: "Login" },
   { value: "logout", label: "Logout" },
   { value: "create", label: "Criar" },
   { value: "update", label: "Atualizar" },
   { value: "delete", label: "Deletar" },
   { value: "", label: "Todas as ações" },
];

interface LogsFiltersProps {
   searchTerm: string;
   onSearchChange: (value: string) => void;
   actionFilter: string;
   onActionChange: (value: string) => void;
   dateStart: string;
   onDateStartChange: (value: string) => void;
   dateEnd: string;
   onDateEndChange: (value: string) => void;
   onClearFilters: () => void;
}

export function LogsFilters({
   searchTerm,
   onSearchChange,
   actionFilter,
   onActionChange,
   dateStart,
   onDateStartChange,
   dateEnd,
   onDateEndChange,
   onClearFilters,
}: LogsFiltersProps) {
   // Só governa o mobile: no lg+ o painel fica sempre aberto por CSS
   const [open, setOpen] = useState(false);

   const hasRefinements = !!searchTerm || !!dateStart || !!dateEnd;
   const actionLabel =
      ACTION_OPTIONS.find((opt) => opt.value === actionFilter)?.label ??
      "Todas as ações";

   return (
      <section
         aria-label="Filtros"
         className="rounded border border-slate-200 bg-white p-2 shadow-sm sm:p-3"
      >
         <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-3">
            {/* Busca — sempre visível, é o filtro de uso corrente */}
            <div className="flex items-center gap-2 lg:flex-1">
               <TextInput
                  icon={HiSearch}
                  className="flex-1"
                  aria-label="Buscar por nome de guerra ou nome completo"
                  placeholder="Buscar por nome de guerra ou completo..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
               />
               <Button
                  color="light"
                  type="button"
                  onClick={() => setOpen((v) => !v)}
                  aria-expanded={open}
                  aria-controls="logs-filtros-panel"
                  className="shrink-0 lg:hidden pointer-coarse:min-h-[44px]"
               >
                  <HiFilter className="h-4 w-4" />
                  <span className="mx-2">Filtros</span>
                  <HiChevronDown
                     className={clsx(
                        "h-4 w-4 transition-transform duration-200 motion-reduce:transition-none",
                        open && "rotate-180"
                     )}
                  />
               </Button>
            </div>

            {/* Painel: colapsa no mobile (grid 0fr→1fr), inline no lg+ */}
            <div
               id="logs-filtros-panel"
               className={clsx(
                  "grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
                  "lg:grid-rows-[1fr]",
                  open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
               )}
            >
               <div className="overflow-hidden lg:overflow-visible">
                  <div className="grid grid-cols-2 gap-2 pt-2 sm:grid-cols-3 lg:flex lg:items-center lg:gap-3 lg:pt-0">
                     <Select
                        value={actionFilter}
                        aria-label="Filtrar por ação"
                        onChange={(e) => onActionChange(e.target.value)}
                        className="col-span-2 sm:col-span-1 lg:w-44"
                     >
                        {ACTION_OPTIONS.map((opt) => (
                           <option key={opt.value} value={opt.value}>
                              {opt.label}
                           </option>
                        ))}
                     </Select>

                     <div className="flex items-center gap-2">
                        {/* Largura fixa nos dois rótulos: sem isso "De" e "Até"
                            dão larguras diferentes aos campos de data */}
                        <Label
                           htmlFor="logs-date-start"
                           className="w-7 shrink-0 text-sm text-gray-500"
                        >
                           De
                        </Label>
                        <TextInput
                           id="logs-date-start"
                           type="date"
                           className="w-full"
                           value={dateStart}
                           max={dateEnd || undefined}
                           onChange={(e) => onDateStartChange(e.target.value)}
                        />
                     </div>

                     <div className="flex items-center gap-2">
                        <Label
                           htmlFor="logs-date-end"
                           className="w-7 shrink-0 text-sm text-gray-500"
                        >
                           Até
                        </Label>
                        <TextInput
                           id="logs-date-end"
                           type="date"
                           className="w-full"
                           value={dateEnd}
                           min={dateStart || undefined}
                           onChange={(e) => onDateEndChange(e.target.value)}
                        />
                     </div>

                     {hasRefinements && (
                        <Button
                           color="light"
                           type="button"
                           onClick={onClearFilters}
                           className="col-span-2 shrink-0 sm:col-span-3 sm:w-fit sm:justify-self-end lg:w-auto pointer-coarse:min-h-[44px]"
                        >
                           <HiX className="mr-2 h-4 w-4" />
                           Limpar
                        </Button>
                     )}
                  </div>
               </div>
            </div>
         </div>

         {/* Escopo vigente enquanto o painel está fechado — sem isso o mobile
             esconderia que a lista está restrita a uma ação/período */}
         {!open && (
            <div className="mt-2 flex gap-1.5 overflow-x-auto lg:hidden">
               <FilterChip prefix="Ação" label={actionLabel} />
               {dateStart && (
                  <FilterChip
                     prefix="De"
                     label={isoDateToString(dateStart)}
                     mono
                  />
               )}
               {dateEnd && (
                  <FilterChip
                     prefix="Até"
                     label={isoDateToString(dateEnd)}
                     mono
                  />
               )}
            </div>
         )}
      </section>
   );
}

/** Pílula de leitura do escopo. Datas em mono para ecoar a coluna de timestamp. */
function FilterChip({
   prefix,
   label,
   mono,
}: {
   prefix: string;
   label: string;
   mono?: boolean;
}) {
   return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-600">
         <span className="text-slate-400">{prefix}</span>
         <span className={clsx("font-medium", mono && "font-mono")}>
            {label}
         </span>
      </span>
   );
}
