"use client";

import { useState, useEffect } from "react";
import { Label, TextInput, Badge, Spinner } from "flowbite-react";
import { CardMission } from "./components/cardMission";
import { TableMission } from "./components/tableMission";
import { useMissoes } from "@/hooks/queries/useMissoes";
import { useEtiquetasMissoes } from "@/hooks/queries/useEtiquetasMissoes";
import { usePersistedState } from "@/hooks/usePersistedState";
import { Pagination } from "@/components/Pagination";
import { MultiSelect } from "@/components/MultiSelect";
import {
   useSearchParamsUpdater,
   getStringParam,
   getNumberParam,
   getArrayParam,
   getNumberArrayParam,
   serializeArray,
   serializeNumberArray,
   serializeString,
} from "@/hooks/useSearchParamsState";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import {
   HiX,
   HiDocumentText,
   HiHashtag,
   HiClipboardList,
   HiUser,
   HiLocationMarker,
   HiCalendar,
   HiTag,
   HiViewGrid,
   HiViewList,
} from "react-icons/hi";
import clsx from "clsx";

function getDefaultIni(): string {
   const d = new Date();
   d.setDate(d.getDate() - 60);
   return d.toISOString().split("T")[0];
}

function getDefaultFim(): string {
   return new Date().toISOString().split("T")[0];
}

const perPage = 20;
const defaultIni = getDefaultIni();
const defaultFim = getDefaultFim();

export function RegisPage() {
   const { searchParams, setParams } = useSearchParamsUpdater();

   // Read filters from URL
   const tipoDoc = getArrayParam(searchParams, "tipo_doc");
   const nDoc = getNumberParam(searchParams, "n_doc");
   const selectedTipo = getArrayParam(searchParams, "tipo");
   const userSearch = getStringParam(searchParams, "user");
   const citySearch = getStringParam(searchParams, "city");
   const dataInicio = getStringParam(searchParams, "ini", defaultIni);
   const dataFim = getStringParam(searchParams, "fim", defaultFim);
   const selectedEtiquetaIds = getNumberArrayParam(searchParams, "etiquetas");
   const currentPage = Number(getStringParam(searchParams, "page", "1"));
   const [viewMode, setViewMode] = usePersistedState<"cards" | "table">(
      "missoes-view-mode",
      "cards"
   );

   // Local state for text inputs (immediate feedback + debounced URL update)
   const [localUserSearch, setLocalUserSearch] = useState(userSearch);
   const [localCitySearch, setLocalCitySearch] = useState(citySearch);
   const [localNDoc, setLocalNDoc] = useState<string>(
      nDoc !== undefined ? String(nDoc) : ""
   );
   const [localDataInicio, setLocalDataInicio] = useState(dataInicio);
   const [localDataFim, setLocalDataFim] = useState(dataFim);

   // Sync local state when URL changes externally (back/forward)
   useEffect(() => {
      setLocalUserSearch(userSearch);
   }, [userSearch]);
   useEffect(() => {
      setLocalCitySearch(citySearch);
   }, [citySearch]);
   useEffect(() => {
      setLocalNDoc(nDoc !== undefined ? String(nDoc) : "");
   }, [nDoc]);
   useEffect(() => {
      setLocalDataInicio(dataInicio);
   }, [dataInicio]);
   useEffect(() => {
      setLocalDataFim(dataFim);
   }, [dataFim]);

   // Debounced URL updaters
   const debouncedSetUser = useDebouncedCallback((value: string) => {
      setParams({ user: serializeString(value), page: undefined });
   }, 400);

   const debouncedSetCity = useDebouncedCallback((value: string) => {
      setParams({ city: serializeString(value), page: undefined });
   }, 400);

   const debouncedSetNDoc = useDebouncedCallback((value: string) => {
      setParams({
         n_doc: value === "" ? undefined : value,
         page: undefined,
      });
   }, 400);

   const isValidDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v);

   const debouncedSetDataInicio = useDebouncedCallback((value: string) => {
      if (!isValidDate(value)) return;
      setParams({
         ini: serializeString(value, defaultIni),
         page: undefined,
      });
   }, 500);

   const debouncedSetDataFim = useDebouncedCallback((value: string) => {
      if (!isValidDate(value)) return;
      setParams({
         fim: serializeString(value, defaultFim),
         page: undefined,
      });
   }, 500);

   // Setters that update URL
   function setTipoDoc(value: string[]) {
      setParams({ tipo_doc: serializeArray(value), page: undefined });
   }

   function setSelectedTipo(value: string[]) {
      setParams({ tipo: serializeArray(value), page: undefined });
   }

   function setDataInicio(value: string) {
      setParams({
         ini: serializeString(value, defaultIni),
         page: undefined,
      });
   }

   function setDataFim(value: string) {
      setParams({
         fim: serializeString(value, defaultFim),
         page: undefined,
      });
   }

   function setSelectedEtiquetaIds(
      updater: number[] | ((prev: number[]) => number[])
   ) {
      const newIds =
         typeof updater === "function" ? updater(selectedEtiquetaIds) : updater;
      setParams({
         etiquetas: serializeNumberArray(newIds),
         page: undefined,
      });
   }

   function handlePageChange(page: number) {
      setParams({ page: page === 1 ? undefined : String(page) });
   }

   // Event handlers for text inputs
   function handleUserSearchChange(value: string) {
      setLocalUserSearch(value);
      debouncedSetUser(value);
   }

   function handleCitySearchChange(value: string) {
      setLocalCitySearch(value);
      debouncedSetCity(value);
   }

   function handleNDocChange(value: string) {
      setLocalNDoc(value);
      debouncedSetNDoc(value);
   }

   const { data: etiquetasDisponiveis = [] } = useEtiquetasMissoes();

   // React Query para buscar missoes
   const { data, isLoading, isFetching } = useMissoes({
      page: currentPage,
      per_page: perPage,
      tipo_doc: tipoDoc.length > 0 ? tipoDoc.join(",") : undefined,
      n_doc: nDoc,
      tipo: selectedTipo.length > 0 ? selectedTipo.join(",") : undefined,
      ini: dataInicio || undefined,
      fim: dataFim || undefined,
      user_search: userSearch || undefined,
      city: citySearch || undefined,
      etiqueta_ids:
         selectedEtiquetaIds.length > 0
            ? selectedEtiquetaIds.join(",")
            : undefined,
   });

   const missoes = data?.items ?? null;
   const totalPages = data?.pages ?? 1;
   const total = data?.total ?? 0;

   const hasActiveFilters = !!(
      tipoDoc.length > 0 ||
      nDoc ||
      selectedTipo.length > 0 ||
      userSearch ||
      citySearch ||
      dataInicio !== defaultIni ||
      dataFim !== defaultFim ||
      selectedEtiquetaIds.length > 0
   );

   const clearFilters = () => {
      setParams({
         tipo_doc: undefined,
         n_doc: undefined,
         tipo: undefined,
         user: undefined,
         city: undefined,
         etiquetas: undefined,
         ini: undefined,
         fim: undefined,
         page: undefined,
      });
      setLocalUserSearch("");
      setLocalCitySearch("");
      setLocalNDoc("");
   };

   // Badge removal handlers for individual filters
   function removeTipoDoc(tipo: string) {
      setTipoDoc(tipoDoc.filter((t) => t !== tipo));
   }

   function removeNDoc() {
      setParams({ n_doc: undefined, page: undefined });
      setLocalNDoc("");
   }

   function removeSelectedTipo(tipo: string) {
      setSelectedTipo(selectedTipo.filter((t) => t !== tipo));
   }

   function removeUserSearch() {
      setParams({ user: undefined, page: undefined });
      setLocalUserSearch("");
   }

   function removeCitySearch() {
      setParams({ city: undefined, page: undefined });
      setLocalCitySearch("");
   }

   function removeDataInicio() {
      setParams({ ini: undefined, page: undefined });
   }

   function removeDataFim() {
      setParams({ fim: undefined, page: undefined });
   }

   function removeEtiqueta(id: number) {
      setSelectedEtiquetaIds((prev) => prev.filter((eid) => eid !== id));
   }

   function toggleEtiqueta(etiquetaId: number) {
      const isSelected = selectedEtiquetaIds.includes(etiquetaId);
      if (isSelected) {
         setSelectedEtiquetaIds((prev) =>
            prev.filter((id) => id !== etiquetaId)
         );
      } else {
         setSelectedEtiquetaIds([...selectedEtiquetaIds, etiquetaId]);
      }
   }

   return (
      <div className="flex h-full flex-col overflow-hidden">
         {/* Filters Section */}
         <section className="shrink-0">
            <div className="rounded border border-slate-300 bg-white p-4">
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
                     <Label className="mb-1.5 flex items-center gap-1.5 text-xs text-gray-600">
                        <HiHashtag className="text-gray-500" />
                        Nº da Ordem
                     </Label>
                     <TextInput
                        type="text"
                        value={localNDoc}
                        onChange={(e) => handleNDocChange(e.target.value)}
                        onKeyDown={(e) => {
                           if (
                              !(
                                 (e.key >= "0" && e.key <= "9") ||
                                 [
                                    "Backspace",
                                    "Tab",
                                    "Delete",
                                    "ArrowLeft",
                                    "ArrowRight",
                                 ].includes(e.key)
                              )
                           ) {
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
                     <Label className="mb-1.5 flex items-center gap-1.5 text-xs text-gray-600">
                        <HiUser className="text-gray-500" />
                        Militar
                     </Label>
                     <TextInput
                        type="text"
                        value={localUserSearch}
                        onChange={(e) => handleUserSearchChange(e.target.value)}
                        placeholder="Nome de guerra"
                        sizing="sm"
                     />
                  </div>

                  {/* Cidade */}
                  <div>
                     <Label className="mb-1.5 flex items-center gap-1.5 text-xs text-gray-600">
                        <HiLocationMarker className="text-gray-500" />
                        Cidade
                     </Label>
                     <TextInput
                        type="text"
                        value={localCitySearch}
                        onChange={(e) => handleCitySearchChange(e.target.value)}
                        placeholder="Município"
                        sizing="sm"
                     />
                  </div>

                  {/* Data Afastamento */}
                  <div>
                     <Label className="mb-1.5 flex items-center gap-1.5 text-xs text-gray-600">
                        <HiCalendar className="text-gray-500" />
                        Afastamento
                     </Label>
                     <input
                        type="date"
                        value={localDataInicio}
                        onChange={(e) => {
                           const newValue = e.target.value;
                           setLocalDataInicio(newValue);
                           if (isValidDate(newValue)) {
                              debouncedSetDataInicio(newValue);
                           }
                        }}
                        className="block w-full rounded border border-slate-300 bg-white p-2 text-xs text-gray-900 focus:border-red-500 focus:ring-red-500"
                     />
                  </div>

                  {/* Data Regresso */}
                  <div>
                     <Label className="mb-1.5 flex items-center gap-1.5 text-xs text-gray-600">
                        <HiCalendar className="text-gray-500" />
                        Regresso
                     </Label>
                     <input
                        type="date"
                        value={localDataFim}
                        onChange={(e) => {
                           const newValue = e.target.value;
                           setLocalDataFim(newValue);
                           if (isValidDate(newValue)) {
                              debouncedSetDataFim(newValue);
                           }
                        }}
                        className="block w-full rounded border border-slate-300 bg-white p-2 text-xs text-gray-900 focus:border-red-500 focus:ring-red-500"
                     />
                  </div>
               </div>

               {/* Multi-select Etiquetas */}
               {etiquetasDisponiveis.length > 0 && (
                  <div className="mt-4 border-t border-slate-300 pt-4">
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
         </section>

         {/* Active Filters Tags */}
         <section className="my-2 shrink-0">
            <div className="flex flex-wrap items-center gap-2">
               <span className="text-xs font-medium text-gray-600">
                  Filtros ativos:
               </span>

               {tipoDoc.map((tipo) => (
                  <Badge key={tipo} color="red">
                     <div className="flex items-center gap-1.5">
                        <HiDocumentText className="h-3 w-3" />
                        <span>
                           Ordem: {tipo === "om" ? "Missão" : "Serviço"}
                        </span>
                        <button
                           onClick={() => removeTipoDoc(tipo)}
                           className="ml-1 hover:text-red-600"
                        >
                           <HiX className="h-3 w-3" />
                        </button>
                     </div>
                  </Badge>
               ))}

               {nDoc && (
                  <Badge color="red">
                     <div className="flex items-center gap-1.5">
                        <HiHashtag className="h-3 w-3" />
                        <span>Nº {nDoc}</span>
                        <button
                           onClick={removeNDoc}
                           className="ml-1 hover:text-red-600"
                        >
                           <HiX className="h-3 w-3" />
                        </button>
                     </div>
                  </Badge>
               )}

               {selectedTipo.map((tipo) => (
                  <Badge key={tipo} color="red">
                     <div className="flex items-center gap-1.5">
                        <HiClipboardList className="h-3 w-3" />
                        <span>Tipo: {tipo.toUpperCase()}</span>
                        <button
                           onClick={() => removeSelectedTipo(tipo)}
                           className="ml-1 hover:text-red-600"
                        >
                           <HiX className="h-3 w-3" />
                        </button>
                     </div>
                  </Badge>
               ))}

               {userSearch && (
                  <Badge color="red">
                     <div className="flex items-center gap-1.5">
                        <HiUser className="h-3 w-3" />
                        <span>Militar: {userSearch}</span>
                        <button
                           onClick={removeUserSearch}
                           className="ml-1 hover:text-red-600"
                        >
                           <HiX className="h-3 w-3" />
                        </button>
                     </div>
                  </Badge>
               )}

               {citySearch && (
                  <Badge color="red">
                     <div className="flex items-center gap-1.5">
                        <HiLocationMarker className="h-3 w-3" />
                        <span>Cidade: {citySearch}</span>
                        <button
                           onClick={removeCitySearch}
                           className="ml-1 hover:text-red-600"
                        >
                           <HiX className="h-3 w-3" />
                        </button>
                     </div>
                  </Badge>
               )}

               <Badge color="red">
                  <div className="flex items-center gap-1.5">
                     <HiCalendar className="h-3 w-3" />
                     <span>
                        Afastamento:{" "}
                        {new Date(dataInicio + "T00:00:00").toLocaleDateString(
                           "pt-BR"
                        )}
                     </span>
                     {dataInicio !== defaultIni && (
                        <button
                           onClick={removeDataInicio}
                           className="ml-1 hover:text-red-600"
                        >
                           <HiX className="h-3 w-3" />
                        </button>
                     )}
                  </div>
               </Badge>

               <Badge color="red">
                  <div className="flex items-center gap-1.5">
                     <HiCalendar className="h-3 w-3" />
                     <span>
                        Regresso:{" "}
                        {new Date(dataFim + "T00:00:00").toLocaleDateString(
                           "pt-BR"
                        )}
                     </span>
                     {dataFim !== defaultFim && (
                        <button
                           onClick={removeDataFim}
                           className="ml-1 hover:text-red-600"
                        >
                           <HiX className="h-3 w-3" />
                        </button>
                     )}
                  </div>
               </Badge>

               {selectedEtiquetaIds.map((id) => {
                  const etiqueta = etiquetasDisponiveis.find(
                     (e) => e.id === id
                  );
                  if (!etiqueta) return null;
                  return (
                     <span
                        key={id}
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-white"
                        style={{ backgroundColor: etiqueta.cor }}
                     >
                        <HiTag className="h-3 w-3" />
                        {etiqueta.nome}
                        <button
                           onClick={() => removeEtiqueta(id)}
                           className="ml-0.5 rounded-full p-0.5 hover:bg-white/20"
                        >
                           <HiX className="h-3 w-3" />
                        </button>
                     </span>
                  );
               })}

               {hasActiveFilters && (
                  <button
                     onClick={clearFilters}
                     className="text-xs text-gray-500 underline hover:text-gray-700"
                  >
                     Limpar todos
                  </button>
               )}
            </div>
         </section>

         {/* Results Section */}
         <section className="flex-1">
            {isLoading && !missoes ? (
               <div className="flex min-h-75 flex-col items-center justify-center gap-2 p-8">
                  <Spinner size="lg" color="failure" />
                  <p className="text-sm text-gray-500">Carregando...</p>
               </div>
            ) : (
               <div className={clsx(isFetching && "opacity-50")}>
                  {/* Results Grid */}
                  {missoes?.length === 0 ? (
                     <div className="flex flex-col items-center justify-center rounded border border-slate-300 bg-gray-50 p-8">
                        <p className="mb-3 text-sm text-gray-600">
                           Nenhuma missão encontrada
                        </p>
                        {hasActiveFilters && (
                           <button
                              onClick={clearFilters}
                              className="text-sm text-red-600 hover:text-red-700"
                           >
                              Limpar Filtros
                           </button>
                        )}
                     </div>
                  ) : (
                     <div>
                        <div className="mb-4 flex items-center justify-between">
                           <h3 className="text-lg font-bold text-gray-800">
                              Registros Encontrados ({total})
                           </h3>
                           <div className="flex overflow-hidden rounded border border-slate-300">
                              <button
                                 type="button"
                                 onClick={() => setViewMode("cards")}
                                 className={clsx(
                                    "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors",
                                    viewMode === "cards"
                                       ? "bg-red-600 text-white"
                                       : "bg-white text-gray-600 hover:bg-gray-50"
                                 )}
                              >
                                 <HiViewGrid className="h-4 w-4" />
                                 <span className="hidden sm:inline">Cards</span>
                              </button>
                              <button
                                 type="button"
                                 onClick={() => setViewMode("table")}
                                 className={clsx(
                                    "flex items-center gap-1.5 border-l border-slate-300 px-3 py-1.5 text-sm font-medium transition-colors",
                                    viewMode === "table"
                                       ? "bg-red-600 text-white"
                                       : "bg-white text-gray-600 hover:bg-gray-50"
                                 )}
                              >
                                 <HiViewList className="h-4 w-4" />
                                 <span className="hidden sm:inline">
                                    Tabela
                                 </span>
                              </button>
                           </div>
                        </div>

                        {viewMode === "cards" ? (
                           <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                              {missoes?.map((m) => (
                                 <CardMission key={m.id} missao={m} />
                              ))}
                           </div>
                        ) : (
                           <TableMission missoes={missoes ?? []} />
                        )}

                        {/* Pagination Section */}
                        {missoes && missoes.length > 0 && (
                           <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-slate-300 pt-4 sm:flex-row">
                              <p className="text-sm text-gray-600">
                                 Mostrando{" "}
                                 <span className="font-medium text-gray-900">
                                    {(currentPage - 1) * perPage + 1}
                                 </span>
                                 -
                                 <span className="font-medium text-gray-900">
                                    {Math.min(currentPage * perPage, total)}
                                 </span>{" "}
                                 de{" "}
                                 <span className="font-medium text-gray-900">
                                    {total}
                                 </span>{" "}
                                 missões
                              </p>
                              <Pagination
                                 currentPage={currentPage}
                                 totalPages={totalPages}
                                 onPageChange={handlePageChange}
                              />
                           </div>
                        )}
                     </div>
                  )}
               </div>
            )}
         </section>
      </div>
   );
}
