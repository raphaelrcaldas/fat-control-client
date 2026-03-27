"use client";

import { useEffect, useMemo, useState } from "react";
import {
   Label,
   TextInput,
   Select,
   Checkbox,
   Badge,
   Spinner,
} from "flowbite-react";
import { Pagination } from "@/components/Pagination";
import { MultiSelect } from "@/components/MultiSelect";
import { UserRow } from "./components/userRow";
import { UserMissionDetailModal } from "../../components/UserMissionDetailModal";
import { usePagamentos } from "@/hooks/queries/usePagamentos";
import { PagamentoRecord } from "services/routes/cegep/financeiro";
import {
   useSearchParamsUpdater,
   getStringParam,
   getNumberParam,
   getArrayParam,
   serializeArray,
   serializeNumber,
   serializeString,
} from "@/hooks/useSearchParamsState";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import {
   HiDocumentText,
   HiCurrencyDollar,
   HiFilter,
   HiX,
   HiHashtag,
   HiClipboardList,
   HiUser,
   HiCalendar,
   HiTag,
} from "react-icons/hi";
import { clsx } from "clsx";

function getDefaultIni(): string {
   const d = new Date();
   d.setDate(d.getDate() - 60);
   return d.toISOString().split("T")[0];
}

function getDefaultFim(): string {
   return new Date().toISOString().split("T")[0];
}

const defaultIni = getDefaultIni();
const defaultFim = getDefaultFim();

export function FilterPage({ active }: { active: boolean }) {
   const [showFilters, setShowFilters] = useState(false);
   const [showModal, setShowModal] = useState(false);
   const [selectedRecord, setSelectedRecord] = useState<PagamentoRecord | null>(
      null
   );

   // UI-only selection state (not filter state)
   const [selectedAll, setSelectedAll] = useState(false);
   const [valorSoma, setValorSoma] = useState(0);
   const [diariasSoma, setDiariasSoma] = useState(0);
   const [selectedIds, setSelectedIds] = useState<number[]>([]);
   const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

   const { searchParams, setParams } = useSearchParamsUpdater();

   // Read filters from URL
   const tipoDoc = getArrayParam(searchParams, "tipo_doc");
   const nDoc = getNumberParam(searchParams, "n_doc");
   const selectedTipo = getArrayParam(searchParams, "tipo");
   const selectedSit = getArrayParam(searchParams, "sit");
   const userSearch = getStringParam(searchParams, "user");
   const dataInicio = getStringParam(searchParams, "ini", defaultIni);
   const dataFim = getStringParam(searchParams, "fim", defaultFim);
   const currentPage = Number(getStringParam(searchParams, "page", "1"));
   const itemsPerPage = Number(getStringParam(searchParams, "per_page", "10"));

   // Local state for text inputs (immediate feedback + debounced URL update)
   const [localUserSearch, setLocalUserSearch] = useState(userSearch);
   const [localNDoc, setLocalNDoc] = useState<string>(
      nDoc !== undefined ? String(nDoc) : ""
   );

   // Sync local state when URL changes externally (back/forward)
   useEffect(() => {
      setLocalUserSearch(userSearch);
   }, [userSearch]);
   useEffect(() => {
      setLocalNDoc(nDoc !== undefined ? String(nDoc) : "");
   }, [nDoc]);

   // Debounced URL updaters
   const debouncedSetUser = useDebouncedCallback((value: string) => {
      setParams({ user: serializeString(value), page: undefined });
   }, 300);

   const debouncedSetNDoc = useDebouncedCallback((value: string) => {
      setParams({
         n_doc: value === "" ? undefined : value,
         page: undefined,
      });
   }, 300);

   // Setters that update URL
   function setTipoDoc(value: string[]) {
      setParams({ tipo_doc: serializeArray(value), page: undefined });
   }

   function setSelectedTipo(value: string[]) {
      setParams({ tipo: serializeArray(value), page: undefined });
   }

   function setSelectedSit(value: string[]) {
      setParams({ sit: serializeArray(value), page: undefined });
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

   function setCurrentPage(page: number) {
      setParams({ page: page === 1 ? undefined : String(page) });
   }

   function setItemsPerPage(value: number) {
      setParams({
         per_page: value === 10 ? undefined : String(value),
         page: undefined,
      });
   }

   // Event handlers for text inputs
   function handleUserSearchChange(value: string) {
      setLocalUserSearch(value);
      debouncedSetUser(value);
   }

   function handleNDocChange(value: string) {
      setLocalNDoc(value);
      debouncedSetNDoc(value);
   }

   // React Query para buscar pagamentos
   const { data, isLoading, isFetching } = usePagamentos(
      {
         page: currentPage,
         limit: itemsPerPage,
         tipo_doc: tipoDoc?.length ? tipoDoc : undefined,
         n_doc: nDoc,
         tipo: selectedTipo?.length ? selectedTipo : undefined,
         sit: selectedSit?.length ? selectedSit : undefined,
         user: userSearch?.toLowerCase() || undefined,
         ini: dataInicio || undefined,
         fim: dataFim || undefined,
      },
      { enabled: active }
   );

   const misRecords = data?.items ?? null;
   const totalRecords = data?.total ?? 0;
   const totalPages = data?.total_pages ?? 1;

   function handleShowDetail(record: PagamentoRecord) {
      setSelectedRecord(record);
      setShowModal(true);
   }

   // Handle select all
   useEffect(() => {
      if (misRecords && selectedAll) {
         setSelectedIds(misRecords.map((r) => r.user_mis.id));
         setValorSoma(
            misRecords.reduce((acc, r) => acc + Number(r.missao.valor_total), 0)
         );
         setDiariasSoma(
            misRecords.reduce(
               (acc, r) => acc + Number(r.missao.diarias ?? 0),
               0
            )
         );
      } else if (misRecords && !selectedAll) {
         setSelectedIds([]);
         setValorSoma(0);
         setDiariasSoma(0);
      }
   }, [selectedAll, misRecords]);

   function handleSelect(
      id: number,
      valor: number,
      diarias: number,
      checked: boolean
   ) {
      if (checked) {
         setSelectedIds((prev) => [...prev, id]);
         setValorSoma((prev) => prev + Number(valor));
         setDiariasSoma((prev) => prev + Number(diarias));
      } else {
         setSelectedIds((prev) => prev.filter((item) => item !== id));
         setValorSoma((prev) => prev - Number(valor));
         setDiariasSoma((prev) => prev - Number(diarias));
      }
   }

   const hasActiveFilters = !!(
      tipoDoc?.length ||
      nDoc ||
      selectedTipo?.length ||
      selectedSit?.length ||
      userSearch ||
      dataInicio !== defaultIni ||
      dataFim !== defaultFim
   );

   const activeFiltersCount =
      (tipoDoc?.length || 0) +
      (nDoc ? 1 : 0) +
      (selectedTipo?.length || 0) +
      (selectedSit?.length || 0) +
      (userSearch ? 1 : 0) +
      (dataInicio !== defaultIni ? 1 : 0) +
      (dataFim !== defaultFim ? 1 : 0);

   const clearFilters = () => {
      setParams({
         tipo_doc: undefined,
         n_doc: undefined,
         tipo: undefined,
         sit: undefined,
         user: undefined,
         ini: undefined,
         fim: undefined,
         page: undefined,
      });
      setLocalUserSearch("");
      setLocalNDoc("");
   };

   // Badge removal handlers
   function removeNDoc() {
      setParams({ n_doc: undefined, page: undefined });
      setLocalNDoc("");
   }

   function removeUserSearch() {
      setParams({ user: undefined, page: undefined });
      setLocalUserSearch("");
   }

   function removeDataInicio() {
      setParams({ ini: undefined, page: undefined });
   }

   function removeDataFim() {
      setParams({ fim: undefined, page: undefined });
   }

   return (
      <div className="space-y-2">
         {/* Active Filters Tags */}
         <section className="flex items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
               <span className="text-xs font-medium text-gray-600">
                  Filtros ativos:
               </span>

               {tipoDoc?.map((td) => (
                  <Badge key={`tipoDoc-${td}`} color="red">
                     <div className="flex items-center gap-1.5">
                        <HiDocumentText className="h-3 w-3" />
                        <span>Ordem: {td === "om" ? "Missão" : "Serviço"}</span>
                        <button
                           onClick={() =>
                              setTipoDoc(tipoDoc.filter((v) => v !== td))
                           }
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

               {selectedTipo?.map((tipo) => (
                  <Badge key={`tipo-${tipo}`} color="red">
                     <div className="flex items-center gap-1.5">
                        <HiClipboardList className="h-3 w-3" />
                        <span>Tipo: {tipo.toUpperCase()}</span>
                        <button
                           onClick={() =>
                              setSelectedTipo(
                                 selectedTipo.filter((v) => v !== tipo)
                              )
                           }
                           className="ml-1 hover:text-red-600"
                        >
                           <HiX className="h-3 w-3" />
                        </button>
                     </div>
                  </Badge>
               ))}

               {selectedSit?.map((sit) => (
                  <Badge key={`sit-${sit}`} color="red">
                     <div className="flex items-center gap-1.5">
                        <HiTag className="h-3 w-3" />
                        <span>
                           Situação:{" "}
                           {sit === "d"
                              ? "Diária"
                              : sit === "c"
                                ? "Comissionado"
                                : "Grat Rep"}
                        </span>
                        <button
                           onClick={() =>
                              setSelectedSit(
                                 selectedSit.filter((v) => v !== sit)
                              )
                           }
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

               {dataInicio !== defaultIni && (
                  <Badge color="red">
                     <div className="flex items-center gap-1.5">
                        <HiCalendar className="h-3 w-3" />
                        <span>
                           Afastamento:{" "}
                           {new Date(
                              dataInicio + "T00:00:00"
                           ).toLocaleDateString("pt-BR")}
                        </span>
                        <button
                           onClick={removeDataInicio}
                           className="ml-1 hover:text-red-600"
                        >
                           <HiX className="h-3 w-3" />
                        </button>
                     </div>
                  </Badge>
               )}

               {dataFim !== defaultFim && (
                  <Badge color="red">
                     <div className="flex items-center gap-1.5">
                        <HiCalendar className="h-3 w-3" />
                        <span>
                           Regresso:{" "}
                           {new Date(dataFim + "T00:00:00").toLocaleDateString(
                              "pt-BR"
                           )}
                        </span>
                        <button
                           onClick={removeDataFim}
                           className="ml-1 hover:text-red-600"
                        >
                           <HiX className="h-3 w-3" />
                        </button>
                     </div>
                  </Badge>
               )}

               <button
                  onClick={clearFilters}
                  className="text-xs text-gray-500 underline hover:text-gray-700"
               >
                  Limpar todos
               </button>
            </div>
            <button
               type="button"
               onClick={() => setShowFilters(!showFilters)}
               className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
               <HiFilter />
               <span className="w-11">
                  {showFilters ? "Ocultar" : "Filtros"}
               </span>
               {hasActiveFilters && (
                  <Badge color="gray" size="sm">
                     {activeFiltersCount}
                  </Badge>
               )}
            </button>
         </section>

         {/* Filters Section */}
         <section
            className={clsx(
               "grid transition-[grid-template-rows] duration-300 ease-in-out",
               showFilters ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            )}
         >
            <div className="overflow-hidden">
               <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
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
                           placeholder="Todos"
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
                           onChange={(e) =>
                              handleUserSearchChange(e.target.value)
                           }
                           placeholder="Nome completo ou de guerra"
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
                           value={dataInicio}
                           max={dataFim || undefined}
                           onChange={(e) => {
                              const newValue = e.target.value;
                              setDataInicio(newValue);
                              // Se a nova data de afastamento for maior que a de regresso, ajusta a de regresso
                              if (dataFim && newValue > dataFim) {
                                 setDataFim(newValue);
                              }
                           }}
                           className="block w-full rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-900 focus:border-red-500 focus:ring-red-500"
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
                           value={dataFim}
                           min={dataInicio || undefined}
                           onChange={(e) => {
                              const newValue = e.target.value;
                              setDataFim(newValue);
                              // Se a nova data de regresso for menor que a de afastamento, ajusta a de afastamento
                              if (dataInicio && newValue < dataInicio) {
                                 setDataInicio(newValue);
                              }
                           }}
                           className="block w-full rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-900 focus:border-red-500 focus:ring-red-500"
                        />
                     </div>
                  </div>
               </div>
            </div>
         </section>

         {/* Results Section */}
         <section className="relative">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
               {/* Loading inicial (sem dados) */}
               {isLoading && !misRecords ? (
                  <div className="flex flex-col items-center justify-center gap-4 p-16">
                     <Spinner size="xl" color="failure" />
                     <p className="text-lg font-medium text-gray-600">
                        Carregando registros...
                     </p>
                  </div>
               ) : misRecords && misRecords.length > 0 ? (
                  <div>
                     <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-6 py-2">
                        <div className="flex items-center gap-4">
                           <div className="flex items-center gap-2">
                              <Checkbox
                                 className="h-4 w-4"
                                 checked={selectedAll}
                                 color="red"
                                 onChange={() => setSelectedAll(!selectedAll)}
                              />
                           </div>
                           <h3 className="text-lg font-bold text-gray-800">
                              Registros Encontrados ({totalRecords})
                           </h3>

                           <div
                              className={clsx(
                                 "border-t border-green-200 bg-green-50 px-3 py-1 shadow",
                                 selectedIds.length > 0
                                    ? "translate-y-0 opacity-100"
                                    : "pointer-events-none translate-y-full opacity-0"
                              )}
                           >
                              <div className="flex items-center gap-3">
                                 <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                                    <HiCurrencyDollar className="text-xl text-green-600" />
                                 </div>
                                 <p className="text-sm font-medium text-gray-700">
                                    {selectedIds.length}{" "}
                                    {selectedIds.length === 1
                                       ? "registro selecionado"
                                       : "registros selecionados"}
                                 </p>
                                 <p className="font-medium text-green-700">
                                    {valorSoma.toLocaleString("pt-BR", {
                                       style: "currency",
                                       currency: "BRL",
                                    })}
                                 </p>
                                 <p className="font-medium text-green-700">
                                    {diariasSoma.toFixed(1)} diária
                                    {diariasSoma !== 1 ? "s" : ""}
                                 </p>
                              </div>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <span className="text-sm text-gray-600">
                              Exibindo{" "}
                              {Math.min(
                                 (currentPage - 1) * itemsPerPage + 1,
                                 totalRecords
                              )}
                              -
                              {Math.min(
                                 currentPage * itemsPerPage,
                                 totalRecords
                              )}{" "}
                              de {totalRecords}
                           </span>
                           <Select
                              sizing="sm"
                              value={itemsPerPage}
                              onChange={(e) =>
                                 setItemsPerPage(Number(e.target.value))
                              }
                              className="w-20"
                           >
                              <option value={10}>10</option>
                              <option value={20}>20</option>
                              <option value={50}>50</option>
                              <option value={100}>100</option>
                           </Select>
                        </div>
                     </div>
                     {/* Área dos registros com spinner */}
                     <div
                        className={clsx(
                           "relative overflow-x-auto",
                           isFetching && "opacity-50"
                        )}
                     >
                        {isFetching && (
                           <div className="absolute inset-0 z-10 flex items-center justify-center">
                              <Spinner size="xl" color="failure" />
                           </div>
                        )}
                        <ul className="px-2">
                           {misRecords?.map((record) => (
                              <UserRow
                                 key={record.user_mis.id}
                                 record={record}
                                 checked={selectedIdSet.has(record.user_mis.id)}
                                 onSelect={handleSelect}
                                 onShowDetail={handleShowDetail}
                              />
                           ))}
                        </ul>
                     </div>
                     {totalPages > 1 && (
                        <div className="flex justify-center border-t border-gray-200 bg-gray-50 px-6 py-4">
                           <Pagination
                              currentPage={currentPage}
                              totalPages={totalPages}
                              onPageChange={setCurrentPage}
                           />
                        </div>
                     )}
                  </div>
               ) : isLoading ? (
                  <div className="flex flex-col items-center justify-center gap-4 p-16">
                     <Spinner size="xl" color="failure" />
                     <p className="text-lg font-medium text-gray-600">
                        Carregando registros...
                     </p>
                  </div>
               ) : (
                  <div className="flex flex-col items-center justify-center gap-4 p-16">
                     <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                        <HiDocumentText className="text-4xl text-gray-400" />
                     </div>
                     <p className="text-lg font-medium text-gray-500">
                        Nenhum registro encontrado
                     </p>
                     <p className="text-sm text-gray-400">
                        Ajuste os filtros para encontrar resultados
                     </p>
                  </div>
               )}
            </div>
         </section>

         <UserMissionDetailModal
            show={showModal}
            onClose={() => setShowModal(false)}
            record={selectedRecord}
         />
      </div>
   );
}
