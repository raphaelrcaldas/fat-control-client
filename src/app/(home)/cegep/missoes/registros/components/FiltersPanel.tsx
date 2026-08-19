"use client";

import { Label, TextInput } from "flowbite-react";
import clsx from "clsx";
import {
   HiX,
   HiDocumentText,
   HiHashtag,
   HiClipboardList,
   HiUser,
   HiLocationMarker,
   HiCalendar,
   HiTag,
} from "react-icons/hi";
import { MultiSelect } from "@/components/MultiSelect";
import { useEtiquetasMissoes } from "@/hooks/queries/useEtiquetasMissoes";
import { RegistrosFilters } from "../hooks/useRegistrosFilters";

type Props = {
   filters: RegistrosFilters;
   show: boolean;
};

export function FiltersPanel({ filters, show }: Props) {
   const { data: etiquetasDisponiveis = [] } = useEtiquetasMissoes();
   const {
      tipoDoc,
      selectedTipo,
      selectedEtiquetaIds,
      localNDoc,
      localUserSearch,
      localCitySearch,
      localDataInicio,
      localDataFim,
      setTipoDoc,
      setSelectedTipo,
      handleNDocChange,
      handleUserSearchChange,
      handleCitySearchChange,
      handleDataInicioChange,
      handleDataFimChange,
      toggleEtiqueta,
   } = filters;

   return (
      /* Painel colapsável (transição grid-rows, igual Pagamentos) */
      <section
         className={clsx(
            "order-2 grid shrink-0 transition-[grid-template-rows] duration-300 ease-in-out",
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
                        placeholder="Selecione..."
                        sizing="sm"
                     />
                  </div>

                  {/* Nº da Ordem */}
                  <div>
                     <Label
                        htmlFor="reg-n-ordem"
                        className="mb-1.5 flex items-center gap-1.5 text-xs text-gray-600"
                     >
                        <HiHashtag className="text-gray-500" />
                        Nº da Ordem
                     </Label>
                     <TextInput
                        id="reg-n-ordem"
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
                        placeholder="Selecione..."
                        sizing="sm"
                     />
                  </div>

                  {/* Militar */}
                  <div>
                     <Label
                        htmlFor="reg-militar"
                        className="mb-1.5 flex items-center gap-1.5 text-xs text-gray-600"
                     >
                        <HiUser className="text-gray-500" />
                        Militar
                     </Label>
                     <TextInput
                        id="reg-militar"
                        type="text"
                        value={localUserSearch}
                        onChange={(e) => handleUserSearchChange(e.target.value)}
                        placeholder="Nome de guerra"
                        sizing="sm"
                     />
                  </div>

                  {/* Cidade */}
                  <div>
                     <Label
                        htmlFor="reg-cidade"
                        className="mb-1.5 flex items-center gap-1.5 text-xs text-gray-600"
                     >
                        <HiLocationMarker className="text-gray-500" />
                        Cidade
                     </Label>
                     <TextInput
                        id="reg-cidade"
                        type="text"
                        value={localCitySearch}
                        onChange={(e) => handleCitySearchChange(e.target.value)}
                        placeholder="Município"
                        sizing="sm"
                     />
                  </div>

                  {/* Data Afastamento */}
                  <div>
                     <Label
                        htmlFor="reg-afastamento"
                        className="mb-1.5 flex items-center gap-1.5 text-xs text-gray-600"
                     >
                        <HiCalendar className="text-gray-500" />
                        Afastamento
                     </Label>
                     <TextInput
                        id="reg-afastamento"
                        type="date"
                        sizing="sm"
                        value={localDataInicio}
                        onChange={(e) => handleDataInicioChange(e.target.value)}
                     />
                  </div>

                  {/* Data Regresso */}
                  <div>
                     <Label
                        htmlFor="reg-regresso"
                        className="mb-1.5 flex items-center gap-1.5 text-xs text-gray-600"
                     >
                        <HiCalendar className="text-gray-500" />
                        Regresso
                     </Label>
                     <TextInput
                        id="reg-regresso"
                        type="date"
                        sizing="sm"
                        value={localDataFim}
                        onChange={(e) => handleDataFimChange(e.target.value)}
                     />
                  </div>
               </div>

               {/* Multi-select Etiquetas */}
               {etiquetasDisponiveis.length > 0 && (
                  <div className="mt-4 border-t border-slate-200 pt-4">
                     <Label className="mb-2 flex items-center gap-1.5 text-xs text-gray-600">
                        <HiTag className="text-gray-500" />
                        Filtrar por Etiquetas
                     </Label>
                     <div className="flex flex-wrap gap-2">
                        {etiquetasDisponiveis.map((etiqueta, index) => {
                           const isSelected = selectedEtiquetaIds.includes(
                              etiqueta.id!
                           );
                           return (
                              <button
                                 key={etiqueta.id ?? `etiqueta-${index}`}
                                 onClick={() => toggleEtiqueta(etiqueta.id!)}
                                 className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                                    isSelected
                                       ? "text-white shadow-sm"
                                       : "border border-dashed"
                                 }`}
                                 style={
                                    isSelected
                                       ? {
                                            backgroundColor: etiqueta.cor,
                                         }
                                       : {
                                            borderColor: etiqueta.cor,
                                            color: etiqueta.cor,
                                            backgroundColor: `${etiqueta.cor}10`,
                                         }
                                 }
                              >
                                 <HiTag className="h-3 w-3" />
                                 {etiqueta.nome}
                                 {isSelected && <HiX className="h-3 w-3" />}
                              </button>
                           );
                        })}
                     </div>
                  </div>
               )}
            </div>
         </div>
      </section>
   );
}
