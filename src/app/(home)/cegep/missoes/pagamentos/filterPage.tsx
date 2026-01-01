"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { Label, TextInput, Select, Checkbox, Badge } from "flowbite-react";
import { Spinner } from "@/components/Spinner";
import { Pagination } from "@/components/Pagination";
import { MultiSelect } from "@/components/MultiSelect";
import { getPgts } from "services/routes/cegep/financeiro";
import { UserRow } from "./components/userRow";
import { UserMissionDetailModal } from "../../components/UserMissionDetailModal";
import { useFilterContext } from "../../context/filterContext";
import useDebouncedValue from "@/hooks/useDebouncedValue";
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

export function FilterPage({ active }) {
   const [showFilters, setShowFilters] = useState(false);
   const [loading, setLoading] = useState(true);
   const [showModal, setShowModal] = useState(false);
   const [selectedRecord, setSelectedRecord] = useState(null);
   const {
      misRecords,
      setMisRecords,
      nDoc,
      setNDoc,
      tipoDoc,
      setTipoDoc,
      selectedTipo,
      userSearch,
      setUserSearch,
      setSelectedTipo,
      selectedSit,
      setSelectedSit,
      dataInicio,
      setDataInicio,
      dataFim,
      setDataFim,
      selectedAll,
      setSelectedAll,
      valorSoma,
      setValorSoma,
      listKey,
      setListKey,
      selectedIds,
      setSelectedIds,
      currentPage,
      setCurrentPage,
      itemsPerPage,
      setItemsPerPage,
      totalRecords,
      setTotalRecords,
      totalPages,
      setTotalPages,
      isHydrated,
   } = useFilterContext();

   function handleShowDetail(record) {
      setSelectedRecord(record);
      setShowModal(true);
   }

   // Agrupa os filtros em um objeto para debounce
   const filters = useMemo(
      () => ({
         userSearch,
         tipoDoc,
         nDoc,
         selectedTipo,
         selectedSit,
         dataInicio,
         dataFim,
      }),
      [
         userSearch,
         tipoDoc,
         nDoc,
         selectedTipo,
         selectedSit,
         dataInicio,
         dataFim,
      ]
   );

   const debouncedFilters = useDebouncedValue(filters, 500);

   // Refs para controlar o fluxo e evitar loops
   const hasFetchedInitial = useRef(false);
   const prevFiltersRef = useRef<string | null>(null);
   const prevPageRef = useRef(currentPage);
   const prevItemsPerPageRef = useRef(itemsPerPage);

   // Ref para armazenar os valores mais recentes (evita stale closures)
   const latestValuesRef = useRef({
      debouncedFilters,
      currentPage,
      itemsPerPage,
   });

   // Atualiza a ref sempre que os valores mudarem
   useEffect(() => {
      latestValuesRef.current = {
         debouncedFilters,
         currentPage,
         itemsPerPage,
      };
   }, [debouncedFilters, currentPage, itemsPerPage]);

   const fetchData = useCallback(
      async (resetPage = false) => {
         setLoading(true);

         // Usa os valores mais recentes da ref
         const {
            debouncedFilters: filters,
            currentPage: page,
            itemsPerPage: limit,
         } = latestValuesRef.current;
         const actualPage = resetPage ? 1 : page;

         let req: { [key: string]: any } = {
            page: actualPage,
            limit,
         };

         if (filters.userSearch) req.user = filters.userSearch.toLowerCase();
         if (filters.tipoDoc?.length) req.tipo_doc = filters.tipoDoc;
         if (filters.nDoc) req.n_doc = filters.nDoc;
         if (filters.selectedTipo?.length) req.tipo = filters.selectedTipo;
         if (filters.selectedSit?.length) req.sit = filters.selectedSit;
         if (filters.dataInicio) req.ini = filters.dataInicio;
         if (filters.dataFim) req.fim = filters.dataFim;

         const data = await getPgts(req);

         setMisRecords(data.items);
         setTotalRecords(data.total);
         setTotalPages(data.total_pages);
         setListKey(Date.now());
         if (resetPage) {
            setSelectedIds([]);
            setValorSoma(0);
            setSelectedAll(false);
            setCurrentPage(1);
         }
         setLoading(false);
      },
      [] // Sem dependências - usa ref para valores atualizados
   );

   // Fetch inicial - só roda uma vez quando hidratado
   useEffect(() => {
      if (!active || !isHydrated) return;

      // Sempre faz fetch se misRecords é null/undefined (dados não carregados)
      if (misRecords == null) {
         hasFetchedInitial.current = true;
         // Inicializa o ref dos filtros com o valor atual
         prevFiltersRef.current = JSON.stringify(debouncedFilters);
         fetchData(true);
      } else if (!hasFetchedInitial.current) {
         // Marca como inicializado se já tem dados (ex: veio do cache/context)
         hasFetchedInitial.current = true;
         prevFiltersRef.current = JSON.stringify(debouncedFilters);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [active, isHydrated]);

   // Chama fetchData quando os filtros debounced mudarem (reset page)
   useEffect(() => {
      if (!active || !isHydrated || !hasFetchedInitial.current) return;

      const filtersJson = JSON.stringify(debouncedFilters);

      // Só faz fetch se os filtros realmente mudaram
      if (prevFiltersRef.current !== filtersJson) {
         prevFiltersRef.current = filtersJson;
         fetchData(true);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [debouncedFilters]);

   // Chama fetchData quando a página mudar
   useEffect(() => {
      if (!active || !isHydrated || !hasFetchedInitial.current) return;
      if (prevPageRef.current !== currentPage) {
         prevPageRef.current = currentPage;
         fetchData(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [currentPage]);

   // Quando itemsPerPage mudar, reseta para página 1
   useEffect(() => {
      if (!active || !isHydrated || !hasFetchedInitial.current) return;
      if (prevItemsPerPageRef.current !== itemsPerPage) {
         prevItemsPerPageRef.current = itemsPerPage;
         if (currentPage !== 1) {
            setCurrentPage(1);
         } else {
            fetchData(false);
         }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [itemsPerPage]);

   useEffect(() => {
      if (misRecords && selectedAll) {
         setSelectedIds(misRecords.map((r) => r.user_mis.id));
         setValorSoma(
            misRecords.reduce((acc, r) => acc + Number(r.missao.valor_total), 0)
         );
      } else if (misRecords && !selectedAll) {
         setSelectedIds([]);
         setValorSoma(0);
      }
   }, [selectedAll, misRecords]);

   function handleSelect(id, valor, checked) {
      if (checked) {
         setSelectedIds((prev) => [...prev, id]);
         setValorSoma((prev) => prev + Number(valor));
      } else {
         setSelectedIds((prev) => prev.filter((item) => item !== id));
         setValorSoma((prev) => prev - Number(valor));
      }
   }

   const hasActiveFilters = !!(
      tipoDoc?.length ||
      nDoc ||
      selectedTipo?.length ||
      selectedSit?.length ||
      userSearch ||
      dataInicio ||
      dataFim
   );

   const activeFiltersCount =
      (tipoDoc?.length || 0) +
      (nDoc ? 1 : 0) +
      (selectedTipo?.length || 0) +
      (selectedSit?.length || 0) +
      (userSearch ? 1 : 0) +
      (dataInicio ? 1 : 0) +
      (dataFim ? 1 : 0);

   const clearFilters = () => {
      setTipoDoc([]);
      setNDoc(undefined);
      setSelectedTipo([]);
      setSelectedSit([]);
      setUserSearch("");
      const hoje = new Date();
      const quinzeDiasAntes = new Date(hoje.getFullYear(), 0, 1);
      setDataInicio(quinzeDiasAntes.toISOString().split("T")[0]);
      setDataFim(hoje.toISOString().split("T")[0]);
   };

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
                           onClick={() => setNDoc(undefined)}
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
                           onClick={() => setUserSearch("")}
                           className="ml-1 hover:text-red-600"
                        >
                           <HiX className="h-3 w-3" />
                        </button>
                     </div>
                  </Badge>
               )}

               {dataInicio && (
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
                           onClick={() => {
                              const hoje = new Date();
                              const quinzeDiasAntes = new Date(
                                 hoje.getFullYear(),
                                 0,
                                 1
                              );
                              setDataInicio(
                                 quinzeDiasAntes.toISOString().split("T")[0]
                              );
                           }}
                           className="ml-1 hover:text-red-600"
                        >
                           <HiX className="h-3 w-3" />
                        </button>
                     </div>
                  </Badge>
               )}

               {dataFim && (
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
                           onClick={() => {
                              const hoje = new Date();
                              setDataFim(hoje.toISOString().split("T")[0]);
                           }}
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
                           value={nDoc ?? ""}
                           onChange={(e) =>
                              setNDoc(
                                 e.target.value === ""
                                    ? undefined
                                    : Number(e.target.value)
                              )
                           }
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
                           value={userSearch}
                           onChange={(e) => setUserSearch(e.target.value)}
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
               {loading && !misRecords ? (
                  <div className="flex flex-col items-center justify-center gap-4 p-16">
                     <Spinner size="xl" />
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
                                 "border-t border-green-200 bg-green-50 px-3 py-1 shadow transition-all duration-300",
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
                     <div className="relative overflow-x-auto">
                        {loading && (
                           <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
                              <Spinner size="xl" />
                           </div>
                        )}
                        <ul className="px-2" key={listKey}>
                           {misRecords?.map((record) => (
                              <UserRow
                                 key={record.user_mis.id}
                                 record={record}
                                 checked={selectedIds.includes(
                                    record.user_mis.id
                                 )}
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
               ) : loading ? (
                  <div className="flex flex-col items-center justify-center gap-4 p-16">
                     <Spinner size="xl" />
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
