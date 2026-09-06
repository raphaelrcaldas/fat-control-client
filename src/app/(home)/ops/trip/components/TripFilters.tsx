"use client";

import { useState, useEffect } from "react";
import clsx from "clsx";
import { Badge, Button, TextInput } from "flowbite-react";
import { HiFilter, HiSearch, HiX } from "react-icons/hi";
import { postoGradRecords } from "services/routes/postos";
import { OPER_LABELS } from "@/constants/tripulantes";
import { useFuncoes } from "@/hooks/queries";
import { MultiSelect } from "@/components/MultiSelect";
import { SegmentedControl } from "@/components/SegmentedControl";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import { useAbaixoDe } from "@/hooks/useAbaixoDe";
import type { FuncType, OperType } from "../types/trip.types";

type TripFilterState = {
   name: string;
   p_g: string[];
   func: FuncType[];
   oper: OperType[];
   active: boolean;
};

type TripFiltersProps = {
   filters: TripFilterState;
   urlSearch: string;
   updateSearch: (value: string) => void;
   updateFilter: (key: string, value: string[] | boolean | string) => void;
   onClear: () => void;
   hasActiveFilters: boolean;
};

/** Um chip por valor selecionado, removível no próprio chip. */
type Chip = { key: string; value: string; label: string };

export function TripFilters({
   filters,
   urlSearch,
   updateSearch,
   updateFilter,
   onClear,
   hasActiveFilters,
}: TripFiltersProps) {
   const { funcoes, labelShort } = useFuncoes();
   const compacto = useAbaixoDe("md");

   // Estado local do input, para o texto aparecer sem esperar a URL.
   const [search, setSearch] = useState(urlSearch);
   const debouncedSearch = useDebouncedValue(search, 350);

   useEffect(() => {
      if (debouncedSearch !== urlSearch) updateSearch(debouncedSearch);
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [debouncedSearch]);

   // Navegação para trás muda a URL sem passar pelo input.
   useEffect(() => {
      if (urlSearch !== search && urlSearch !== debouncedSearch) {
         setSearch(urlSearch);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [urlSearch]);

   const postoLabel = (short: string) =>
      postoGradRecords.find((p) => p.short === short)?.mid ?? short;

   // O recorte Ativos/Inativos entra na conta: fechado o disclosure, o badge e
   // a unica pista de que a lista nao esta no padrao.
   const advancedCount =
      filters.p_g.length +
      filters.func.length +
      filters.oper.length +
      (filters.active ? 0 : 1);
   const [filtersOpen, setFiltersOpen] = useState(advancedCount > 0);

   const chips: Chip[] = [
      ...filters.p_g.map((v) => ({
         key: "p_g",
         value: v,
         label: postoLabel(v),
      })),
      ...filters.func.map((v) => ({
         key: "func",
         value: v,
         label: labelShort(v),
      })),
      ...filters.oper.map((v) => ({
         key: "oper",
         value: v,
         label: OPER_LABELS[v] ?? v,
      })),
   ];

   function removeChip({ key, value }: Chip) {
      const current = filters[key as "p_g" | "func" | "oper"] as string[];
      updateFilter(
         key,
         current.filter((v) => v !== value)
      );
   }

   return (
      <div className="space-y-3 border-b border-slate-200 p-3 sm:p-4">
         <div className="flex flex-col md:flex-row md:items-center md:gap-3">
            <div className="flex gap-3 md:flex-1">
               <div className="flex-1">
                  <TextInput
                     icon={HiSearch}
                     type="search"
                     aria-label="Buscar tripulante"
                     placeholder="Buscar por trigrama ou nome..."
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                  />
               </div>
               <Button
                  color="light"
                  className="shrink-0 md:hidden"
                  onClick={() => setFiltersOpen((open) => !open)}
                  aria-expanded={filtersOpen}
                  aria-controls="trip-filters"
               >
                  <HiFilter className="mr-1 h-4 w-4" />
                  Filtros
                  {advancedCount > 0 && (
                     <Badge color="primary" className="ml-1.5">
                        {advancedCount}
                     </Badge>
                  )}
               </Button>
            </div>

            {/* Selects — recolhíveis no mobile, inline no desktop.
                A altura anima por `grid-template-rows` (0fr → 1fr), e não por
                `max-height`: com `max-height` a duração vira função de um
                palpite de altura, e sobra ou falta tempo no fim do curso. */}
            <div
               id="trip-filters"
               className={clsx(
                  "grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none md:contents",
                  filtersOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
               )}
            >
               <div className="overflow-hidden md:contents">
                  {/* `inert` so no mobile: no desktop `filtersOpen` e falso e
                      mesmo assim os filtros estao visiveis (`md:contents`). */}
                  <div
                     inert={compacto && !filtersOpen}
                     className="flex flex-col gap-3 pt-3 md:contents"
                  >
                     <div className="w-full md:w-44">
                        <MultiSelect
                           options={postoGradRecords.map((posto) => ({
                              value: posto.short,
                              label: posto.mid,
                           }))}
                           selected={filters.p_g}
                           onChange={(values) => updateFilter("p_g", values)}
                           placeholder="Posto/Graduação"
                        />
                     </div>

                     {/* No celular os dois cabem lado a lado porque o rótulo vira
                   o próprio código (PIL, IN) — é assim que eles aparecem na
                   lista, então não há o que decifrar. */}
                     <div className="flex gap-3 md:contents">
                        <div className="flex-1 md:w-40 md:flex-none">
                           <MultiSelect
                              options={funcoes.map((f) => ({
                                 value: f.cod,
                                 label: compacto
                                    ? f.cod.toUpperCase()
                                    : f.nome_curto,
                              }))}
                              selected={filters.func}
                              onChange={(values) =>
                                 updateFilter("func", values)
                              }
                              placeholder="Função"
                           />
                        </div>

                        <div className="flex-1 md:w-48 md:flex-none">
                           <MultiSelect
                              options={Object.entries(OPER_LABELS).map(
                                 ([key, value]) => ({
                                    value: key,
                                    label: compacto ? key.toUpperCase() : value,
                                 })
                              )}
                              selected={filters.oper}
                              onChange={(values) =>
                                 updateFilter("oper", values)
                              }
                              placeholder={
                                 compacto ? "Oper." : "Operacionalidade"
                              }
                           />
                        </div>
                     </div>

                     {/* Ativos/Inativos e recorte do conjunto, nao acao — ver o
                SegmentedControl. Vive dentro do disclosure: no mobile uma
                linha so para ele custava a altura de dois cartoes da lista. */}
                     <SegmentedControl
                        options={[
                           { label: "Ativos", value: "true" },
                           { label: "Inativos", value: "false" },
                        ]}
                        value={String(filters.active) as "true" | "false"}
                        onChange={(value) =>
                           updateFilter("active", value === "true")
                        }
                        ariaLabel="Situação do tripulante"
                        className="w-full self-start md:w-auto"
                     />
                  </div>
               </div>
            </div>
         </div>

         {(chips.length > 0 || hasActiveFilters) && (
            <div className="hidden flex-wrap items-center gap-1.5 md:flex">
               {chips.map((chip) => (
                  <button
                     key={`${chip.key}-${chip.value}`}
                     type="button"
                     onClick={() => removeChip(chip)}
                     aria-label={`Remover filtro ${chip.label}`}
                     title={`Remover filtro ${chip.label}`}
                     className="focus-visible:outline-primary-600 group inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-50 py-1 pr-1.5 pl-2 text-xs leading-5 font-medium text-slate-700 transition-colors outline-none hover:border-slate-300 hover:bg-slate-100 focus-visible:outline-[2px] focus-visible:outline-offset-[2px] focus-visible:[outline-style:solid]"
                  >
                     {chip.label}
                     <HiX className="h-3 w-3 text-slate-400 group-hover:text-slate-700" />
                  </button>
               ))}
               {hasActiveFilters && (
                  <button
                     type="button"
                     onClick={onClear}
                     className="focus-visible:outline-primary-600 rounded px-2 py-1 text-xs leading-5 font-medium text-slate-500 underline-offset-2 outline-none hover:text-slate-800 hover:underline focus-visible:outline-[2px] focus-visible:outline-offset-[2px] focus-visible:[outline-style:solid]"
                  >
                     Limpar filtros
                  </button>
               )}
            </div>
         )}
      </div>
   );
}
