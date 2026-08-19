"use client";

import { Label, TextInput } from "flowbite-react";
import { clsx } from "clsx";
import {
   HiDocumentText,
   HiHashtag,
   HiClipboardList,
   HiUser,
   HiCalendar,
   HiTag,
} from "react-icons/hi";
import { MultiSelect } from "@/components/MultiSelect";
import { PagamentosFilters } from "../hooks/usePagamentosFilters";

type Props = {
   filters: PagamentosFilters;
   show: boolean;
};

export function FiltersPanel({ filters, show }: Props) {
   const {
      tipoDoc,
      selectedTipo,
      selectedSit,
      localNDoc,
      localUserSearch,
      localDataInicio,
      localDataFim,
      setTipoDoc,
      setSelectedTipo,
      setSelectedSit,
      handleNDocChange,
      handleUserSearchChange,
      handleDataInicioChange,
      handleDataFimChange,
   } = filters;

   return (
      <section
         className={clsx(
            "grid transition-[grid-template-rows] duration-300 ease-in-out",
            show ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
         )}
      >
         <div className="overflow-hidden">
            <div className="rounded border border-slate-200 bg-white px-4 py-3">
               <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
                  {/* Tipo da Ordem */}
                  <div>
                     <Label className="mb-1.5 flex items-center gap-1.5 text-xs text-gray-600">
                        <HiDocumentText className="text-gray-500" />
                        Tipo da Ordem
                     </Label>
                     <MultiSelect
                        options={[
                           { value: "om", label: "Missão" },
                           { value: "os", label: "Serviço" },
                        ]}
                        selected={tipoDoc}
                        onChange={setTipoDoc}
                        placeholder="Todos"
                        sizing="sm"
                     />
                  </div>

                  {/* Nº da Ordem */}
                  <div>
                     <Label
                        htmlFor="pg-n-ordem"
                        className="mb-1.5 flex items-center gap-1.5 text-xs text-gray-600"
                     >
                        <HiHashtag className="text-gray-500" />
                        Nº da Ordem
                     </Label>
                     <TextInput
                        id="pg-n-ordem"
                        type="text"
                        value={localNDoc}
                        onChange={(e) => handleNDocChange(e.target.value)}
                        onKeyDown={(e) => {
                           if (!(
                              (e.key >= "0" && e.key <= "9") ||
                              [
                                 "Backspace",
                                 "Tab",
                                 "Delete",
                                 "ArrowLeft",
                                 "ArrowRight",
                              ].includes(e.key)
                           )) {
                              e.preventDefault();
                           }
                        }}
                        placeholder="Número"
                        sizing="sm"
                     />
                  </div>

                  {/* Tipo de Missão */}
                  <div>
                     <Label className="mb-1.5 flex items-center gap-1.5 text-xs text-gray-600">
                        <HiClipboardList className="text-gray-500" />
                        Tipo de Missão
                     </Label>
                     <MultiSelect
                        options={[
                           { value: "tal", label: "TAL" },
                           { value: "adm", label: "ADM" },
                           { value: "opr", label: "OPR" },
                        ]}
                        selected={selectedTipo}
                        onChange={setSelectedTipo}
                        placeholder="Todos"
                        sizing="sm"
                     />
                  </div>

                  {/* Situação */}
                  <div>
                     <Label className="mb-1.5 flex items-center gap-1.5 text-xs text-gray-600">
                        <HiTag className="text-gray-500" />
                        Situação
                     </Label>
                     <MultiSelect
                        options={[
                           { value: "d", label: "Diária" },
                           { value: "c", label: "Comissionado" },
                           { value: "g", label: "Grat Rep" },
                        ]}
                        selected={selectedSit}
                        onChange={setSelectedSit}
                        placeholder="Todos"
                        sizing="sm"
                     />
                  </div>

                  {/* Militar */}
                  <div>
                     <Label
                        htmlFor="pg-militar"
                        className="mb-1.5 flex items-center gap-1.5 text-xs text-gray-600"
                     >
                        <HiUser className="text-gray-500" />
                        Militar
                     </Label>
                     <TextInput
                        id="pg-militar"
                        type="text"
                        value={localUserSearch}
                        onChange={(e) => handleUserSearchChange(e.target.value)}
                        placeholder="Nome completo ou de guerra"
                        sizing="sm"
                     />
                  </div>

                  {/* Data Afastamento */}
                  <div>
                     <Label
                        htmlFor="pg-afastamento"
                        className="mb-1.5 flex items-center gap-1.5 text-xs text-gray-600"
                     >
                        <HiCalendar className="text-gray-500" />
                        Afastamento
                     </Label>
                     <TextInput
                        id="pg-afastamento"
                        type="date"
                        sizing="sm"
                        value={localDataInicio}
                        max={localDataFim || undefined}
                        onChange={(e) => handleDataInicioChange(e.target.value)}
                     />
                  </div>

                  {/* Data Regresso */}
                  <div>
                     <Label
                        htmlFor="pg-regresso"
                        className="mb-1.5 flex items-center gap-1.5 text-xs text-gray-600"
                     >
                        <HiCalendar className="text-gray-500" />
                        Regresso
                     </Label>
                     <TextInput
                        id="pg-regresso"
                        type="date"
                        sizing="sm"
                        value={localDataFim}
                        min={localDataInicio || undefined}
                        onChange={(e) => handleDataFimChange(e.target.value)}
                     />
                  </div>
               </div>
            </div>
         </div>
      </section>
   );
}
