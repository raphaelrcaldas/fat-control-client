"use client";

import { useEffect, useMemo, useState } from "react";
import {
   Label,
   TextInput,
   Select,
   Checkbox,
   Badge,
   Button,
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
} from "flowbite-react";
import { Pagination } from "@/components/Pagination";
import { MultiSelect } from "@/components/MultiSelect";
import { UserRow, UserCard } from "./components/userRow";
import { PagamentosSkeleton } from "./components/PagamentosSkeleton";
import { UserMissionDetailModal } from "../../components/UserMissionDetailModal";
import { usePagamentos } from "@/hooks/queries/usePagamentos";
import { PagamentoRecord } from "services/routes/cegep/financeiro";
import {
   useSearchParamsUpdater,
   getStringParam,
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
import { dateToIso, todayIso, formatDateFull } from "@/../utils/dateHandler";
import { clsx } from "clsx";

function getDefaultIni(): string {
   const d = new Date();
   d.setDate(d.getDate() - 60);
   return dateToIso(d);
}

const defaultIni = getDefaultIni();
const defaultFim = todayIso();

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
   const nDoc = getStringParam(searchParams, "n_doc");
   const selectedTipo = getArrayParam(searchParams, "tipo");
   const selectedSit = getArrayParam(searchParams, "sit");
   const userSearch = getStringParam(searchParams, "user");
   const dataInicio = getStringParam(searchParams, "ini", defaultIni);
   const dataFim = getStringParam(searchParams, "fim", defaultFim);
   const currentPage = Number(getStringParam(searchParams, "page", "1"));
   const itemsPerPage = Number(getStringParam(searchParams, "per_page", "10"));

   // Local state for text inputs (immediate feedback + debounced URL update)
   const [localUserSearch, setLocalUserSearch] = useState(userSearch);
   const [localNDoc, setLocalNDoc] = useState<string>(nDoc);
   const [localDataInicio, setLocalDataInicio] = useState(dataInicio);
   const [localDataFim, setLocalDataFim] = useState(dataFim);

   // Sync local state when URL changes externally (back/forward)
   useEffect(() => {
      setLocalUserSearch(userSearch);
   }, [userSearch]);
   useEffect(() => {
      setLocalNDoc(nDoc);
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
   const { data, isLoading, isFetching, isError, error, refetch } =
      usePagamentos(
         {
            page: currentPage,
            limit: itemsPerPage,
            tipo_doc: tipoDoc?.length ? tipoDoc : undefined,
            n_doc: nDoc || undefined,
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
         {/* Active Filters Tags — ocultos no mobile (poluíam e quebravam a
             linha); o badge de contagem no botão "Filtros" já sinaliza que há
             filtros ativos. Chips reaparecem no sm+. */}
         <section className="flex items-start justify-end gap-3 sm:justify-between">
            <div className="hidden flex-wrap items-center gap-2 sm:flex">
               <span className="text-xs font-medium text-gray-600">
                  Filtros ativos:
               </span>

               {tipoDoc?.map((td) => (
                  <Badge key={`tipoDoc-${td}`} color="primary">
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
                  <Badge color="primary">
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
                  <Badge key={`tipo-${tipo}`} color="primary">
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
                  <Badge key={`sit-${sit}`} color="primary">
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
                  <Badge color="primary">
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

               <Badge color="primary">
                  <div className="flex items-center gap-1.5">
                     <HiCalendar className="h-3 w-3" />
                     <span>Afastamento: {formatDateFull(dataInicio)}</span>
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

               <Badge color="primary">
                  <div className="flex items-center gap-1.5">
                     <HiCalendar className="h-3 w-3" />
                     <span>Regresso: {formatDateFull(dataFim)}</span>
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

               {hasActiveFilters && (
                  <button
                     onClick={clearFilters}
                     className="text-xs text-gray-500 underline hover:text-gray-700"
                  >
                     Limpar todos
                  </button>
               )}
            </div>
            <Button
               color="light"
               size="sm"
               onClick={() => setShowFilters(!showFilters)}
               className="shrink-0"
            >
               <HiFilter className="mr-2 h-4 w-4" />
               <span className="w-11 text-left">
                  {showFilters ? "Ocultar" : "Filtros"}
               </span>
               {hasActiveFilters && (
                  <Badge color="gray" size="sm" className="ml-2">
                     {activeFiltersCount}
                  </Badge>
               )}
            </Button>
         </section>

         {/* Filters Section */}
         <section
            className={clsx(
               "grid transition-[grid-template-rows] duration-300 ease-in-out",
               showFilters ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
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
                           onChange={(e) =>
                              handleUserSearchChange(e.target.value)
                           }
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
                           onChange={(e) => {
                              const newValue = e.target.value;
                              setLocalDataInicio(newValue);
                              if (isValidDate(newValue)) {
                                 debouncedSetDataInicio(newValue);
                                 if (localDataFim && newValue > localDataFim) {
                                    setLocalDataFim(newValue);
                                    debouncedSetDataFim(newValue);
                                 }
                              }
                           }}
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
                           onChange={(e) => {
                              const newValue = e.target.value;
                              setLocalDataFim(newValue);
                              if (isValidDate(newValue)) {
                                 debouncedSetDataFim(newValue);
                                 if (
                                    localDataInicio &&
                                    newValue < localDataInicio
                                 ) {
                                    setLocalDataInicio(newValue);
                                    debouncedSetDataInicio(newValue);
                                 }
                              }
                           }}
                        />
                     </div>
                  </div>
               </div>
            </div>
         </section>

         {/* Results Section */}
         <section className="relative">
            <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
               {/* Loading inicial (sem dados) */}
               {isLoading && !misRecords ? (
                  <PagamentosSkeleton rows={itemsPerPage} />
               ) : isError && !misRecords ? (
                  <div className="flex flex-col items-center justify-center gap-3 p-16">
                     <p className="text-sm font-medium text-red-800">
                        Erro ao carregar os pagamentos
                     </p>
                     <p className="text-xs text-red-600">
                        {error instanceof Error
                           ? error.message
                           : "Falha na comunicação com o servidor"}
                     </p>
                     <Button color="red" size="sm" onClick={() => refetch()}>
                        Tentar novamente
                     </Button>
                  </div>
               ) : misRecords && misRecords.length > 0 ? (
                  <div>
                     <div className="flex flex-col gap-2 border-b border-slate-200 bg-gray-50 px-3 py-1 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:py-0.5">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                           {/* Glifo compacto; o label vira o alvo de toque de
                               44px só no dedo (padrão do ToggleCheckbox). */}
                           <label className="inline-flex cursor-pointer items-center justify-center pointer-coarse:min-h-[44px] pointer-coarse:min-w-[44px]">
                              <Checkbox
                                 className="size-5 pointer-coarse:size-6"
                                 checked={selectedAll}
                                 color="primary"
                                 onChange={() => setSelectedAll(!selectedAll)}
                                 aria-label="Selecionar todos os registros"
                              />
                           </label>
                           <h2 className="shrink-0 text-sm font-semibold whitespace-nowrap text-gray-800">
                              Registros Encontrados ({totalRecords})
                           </h2>

                           {/* Resumo da seleção: só monta quando há algo
                               marcado — não reserva espaço nem estoura a
                               viewport no mobile. Full-width com wrap no
                               celular, inline (auto) no desktop. */}
                           {selectedIds.length > 0 && (
                              <div className="w-full rounded border border-green-300 bg-green-50 px-2 py-1.5 shadow-sm sm:w-auto">
                                 <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                                    <HiCurrencyDollar className="shrink-0 text-xl text-green-600" />
                                    <p className="text-sm font-medium text-gray-700">
                                       {selectedIds.length}{" "}
                                       {selectedIds.length === 1
                                          ? "registro selecionado"
                                          : "registros selecionados"}
                                    </p>
                                    <p className="text-sm font-medium text-green-700 tabular-nums">
                                       {valorSoma.toLocaleString("pt-BR", {
                                          style: "currency",
                                          currency: "BRL",
                                       })}
                                    </p>
                                    <p className="text-sm font-medium text-green-700 tabular-nums">
                                       {diariasSoma.toFixed(1)} diária
                                       {diariasSoma !== 1 ? "s" : ""}
                                    </p>
                                 </div>
                              </div>
                           )}
                        </div>
                        {/* "Exibindo X-Y de N" + seletor de qtd: ocultos no
                            mobile (a paginação embaixo já situa; menos ruído no
                            cabeçalho denso). Reaparecem no sm+. */}
                        <div className="hidden items-center gap-3 sm:flex">
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
                              aria-label="Registros por página"
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
                           "transition-opacity",
                           isFetching && "opacity-50"
                        )}
                     >
                        {/* Mobile (< md): cards empilhados — evita scroll horizontal */}
                        <div className="flex flex-col gap-3 p-2 sm:p-3 md:hidden">
                           {misRecords?.map((record) => (
                              <UserCard
                                 key={record.user_mis.id}
                                 record={record}
                                 checked={selectedIdSet.has(record.user_mis.id)}
                                 onSelect={handleSelect}
                                 onShowDetail={handleShowDetail}
                              />
                           ))}
                        </div>

                        {/* Desktop (>= md): tabela */}
                        <div className="hidden overflow-x-auto md:block">
                           <Table
                              hoverable
                              theme={{
                                 body: { cell: { base: "py-1 px-3" } },
                                 head: {
                                    cell: {
                                       base: "bg-white border-b border-slate-200 px-3",
                                    },
                                 },
                              }}
                           >
                              <TableHead>
                                 <TableRow>
                                    <TableHeadCell className="text-center">
                                       <span className="sr-only">Sel</span>
                                    </TableHeadCell>
                                    <TableHeadCell className="text-center">
                                       Ordem
                                    </TableHeadCell>
                                    <TableHeadCell>Militar</TableHeadCell>
                                    <TableHeadCell className="text-center">
                                       Sit
                                    </TableHeadCell>
                                    <TableHeadCell>Descrição</TableHeadCell>
                                    <TableHeadCell className="text-center">
                                       Afastamento
                                    </TableHeadCell>
                                    <TableHeadCell className="text-center">
                                       Regresso
                                    </TableHeadCell>
                                    <TableHeadCell className="text-center">
                                       Dias
                                    </TableHeadCell>
                                    <TableHeadCell className="text-center">
                                       Diárias
                                    </TableHeadCell>
                                    <TableHeadCell className="text-center">
                                       Valor
                                    </TableHeadCell>
                                    <TableHeadCell className="text-center">
                                       <span className="sr-only">Ações</span>
                                    </TableHeadCell>
                                 </TableRow>
                              </TableHead>
                              <TableBody className="divide-y">
                                 {misRecords?.map((record) => (
                                    <UserRow
                                       key={record.user_mis.id}
                                       record={record}
                                       checked={selectedIdSet.has(
                                          record.user_mis.id
                                       )}
                                       onSelect={handleSelect}
                                       onShowDetail={handleShowDetail}
                                    />
                                 ))}
                              </TableBody>
                           </Table>
                        </div>
                     </div>
                     {totalPages > 1 && (
                        <div className="flex justify-center border-t border-slate-200 bg-gray-50 px-3 py-4 sm:px-6">
                           <Pagination
                              currentPage={currentPage}
                              totalPages={totalPages}
                              onPageChange={setCurrentPage}
                           />
                        </div>
                     )}
                  </div>
               ) : isLoading ? (
                  <PagamentosSkeleton rows={itemsPerPage} />
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
