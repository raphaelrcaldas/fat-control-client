"use client";

import { useState } from "react";
import { Button, Label, Select, TextInput } from "flowbite-react";
import { HiChevronDown, HiFilter, HiSearch, HiX } from "react-icons/hi";
import clsx from "clsx";

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
   // O botão vira o resumo do escopo, então o rótulo tem que caber ao lado da
   // busca — "Todas as ações" seria truncado justamente onde diz o que filtra
   const actionShort = actionFilter ? actionLabel : "Todas";
   // Datas não cabem no botão; o que cabe é dizer que existem
   const periodo = (dateStart ? 1 : 0) + (dateEnd ? 1 : 0);

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
               {/* O botão É o resumo do escopo: mostra a ação vigente e sinaliza
                   o período. Antes isso morava numa fita de pílulas abaixo, que
                   custava uma linha inteira da tela para repetir o que o próprio
                   controle pode dizer */}
               <Button
                  color="light"
                  type="button"
                  onClick={() => setOpen((v) => !v)}
                  aria-expanded={open}
                  aria-controls="logs-filtros-panel"
                  aria-label={`Filtros: ação ${actionLabel}${
                     periodo ? ", com período" : ""
                  }`}
                  className="shrink-0 lg:hidden"
               >
                  <HiFilter className="size-4 shrink-0" />
                  <span className="mx-2 max-w-24 truncate">{actionShort}</span>
                  {periodo > 0 && (
                     <span
                        aria-hidden
                        className="mr-2 grid size-4 shrink-0 place-items-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700"
                     >
                        {periodo}
                     </span>
                  )}
                  <HiChevronDown
                     className={clsx(
                        "size-4 shrink-0 transition-transform duration-200 motion-reduce:transition-none",
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

                     {/* Lado a lado, os dois campos de data ficam com ~137px
                         no celular e o seletor nativo corta o próprio ícone —
                         abaixo de `sm` cada um ocupa a linha inteira */}
                     <div className="col-span-2 flex items-center gap-2 sm:col-span-1">
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

                     <div className="col-span-2 flex items-center gap-2 sm:col-span-1">
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
                           className="col-span-2 shrink-0 sm:col-span-3 sm:w-fit sm:justify-self-end lg:w-auto"
                        >
                           <HiX className="mr-2 h-4 w-4" />
                           Limpar
                        </Button>
                     )}
                  </div>
               </div>
            </div>
         </div>
      </section>
   );
}
