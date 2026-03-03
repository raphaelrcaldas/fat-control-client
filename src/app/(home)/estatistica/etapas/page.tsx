"use client";

import {
   Button,
   Label,
   Select,
   TextInput,
   Badge,
   Spinner,
} from "flowbite-react";
import {
   MdBarChart,
   MdFlightTakeoff,
   MdFlightLand,
   MdSearch,
} from "react-icons/md";
import {
   HiFilter,
   HiX,
   HiCalendar,
   HiUser,
   HiDownload,
   HiPlus,
   HiViewBoards,
   HiTable,
} from "react-icons/hi";
import { Pagination } from "@/components/Pagination";
import { MultiSelect } from "@/components/MultiSelect";
import { useState, useCallback, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import { useEtapas } from "@/hooks/queries";
import { useAeronaves } from "@/hooks/queries/useAeronaves";
import { useTiposMissao } from "@/hooks/queries/useTiposMissao";
import { EtapasTable } from "./components/EtapasTable";
import { MissaoFormModal } from "./components/MissaoFormModal";
import { MissaoDeleteModal } from "./components/MissaoDeleteModal";
import { formatDateFull } from "@/../utils/dateHandler";
import type { MissaoComEtapas } from "services/routes/estatistica/etapas";
import clsx from "clsx";

const PER_PAGE_OPTIONS = [10, 15, 25, 50];
const DEFAULT_PER_PAGE = 15;
const DEFAULT_PAGE = 1;

export default function EtapasPage() {
   const searchParams = useSearchParams();
   const router = useRouter();

   const [showFilters, setShowFilters] = useState(false);
   const [groupByMissao, setGroupByMissao] = useState(true);
   const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

   // Missao modal state
   const [showMissaoModal, setShowMissaoModal] = useState(false);
   const [editingMissao, setEditingMissao] = useState<MissaoComEtapas | null>(
      null
   );
   const [showDeleteModal, setShowDeleteModal] = useState(false);
   const [deletingMissao, setDeletingMissao] = useState<MissaoComEtapas | null>(
      null
   );

   // --- Read URL params ---
   const urlAnv = searchParams.getAll("anv");
   const urlOrigem = searchParams.get("origem") ?? "";
   const urlDestino = searchParams.get("destino") ?? "";
   const urlTrip = searchParams.get("trip_search") ?? "";
   const urlEsfAer = searchParams.get("esf_aer") ?? "";
   const urlDataIni = searchParams.get("data_ini") ?? "";
   const urlDataFim = searchParams.get("data_fim") ?? "";
   const urlTipoMissao = searchParams.getAll("tipo_missao_cod");
   const currentPage = Number(searchParams.get("page")) || DEFAULT_PAGE;
   const perPage = Number(searchParams.get("per_page")) || DEFAULT_PER_PAGE;

   // --- Local state (text inputs with debounce) ---
   const [filterOrigem, setFilterOrigem] = useState(urlOrigem);
   const [filterDestino, setFilterDestino] = useState(urlDestino);
   const [filterTrip, setFilterTrip] = useState(urlTrip);
   const [filterEsfAer, setFilterEsfAer] = useState(urlEsfAer);

   const debouncedOrigem = useDebouncedValue(filterOrigem, 350);
   const debouncedDestino = useDebouncedValue(filterDestino, 350);
   const debouncedTrip = useDebouncedValue(filterTrip, 350);
   const debouncedEsfAer = useDebouncedValue(filterEsfAer, 350);

   // --- URL update helper ---
   const updateParams = useCallback(
      (updates: Record<string, string | undefined>, resetPage = true) => {
         const params = new URLSearchParams(searchParams.toString());

         for (const [key, value] of Object.entries(updates)) {
            if (value === undefined || value === "") {
               params.delete(key);
            } else {
               params.set(key, value);
            }
         }

         if (resetPage) params.delete("page");
         if (params.get("per_page") === String(DEFAULT_PER_PAGE))
            params.delete("per_page");
         if (params.get("page") === String(DEFAULT_PAGE)) params.delete("page");

         const qs = params.toString();
         router.replace(qs ? `?${qs}` : "?", { scroll: false });
      },
      [searchParams, router]
   );

   // --- Sync debounced text values to URL ---
   useEffect(() => {
      if (debouncedOrigem !== urlOrigem)
         updateParams({ origem: debouncedOrigem || undefined });
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [debouncedOrigem]);

   useEffect(() => {
      if (debouncedDestino !== urlDestino)
         updateParams({ destino: debouncedDestino || undefined });
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [debouncedDestino]);

   useEffect(() => {
      if (debouncedTrip !== urlTrip)
         updateParams({ trip_search: debouncedTrip || undefined });
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [debouncedTrip]);

   useEffect(() => {
      if (debouncedEsfAer !== urlEsfAer)
         updateParams({ esf_aer: debouncedEsfAer || undefined });
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [debouncedEsfAer]);

   // --- Sync URL back to local state on external navigation ---
   useEffect(() => {
      if (urlOrigem !== filterOrigem && urlOrigem !== debouncedOrigem)
         setFilterOrigem(urlOrigem);
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [urlOrigem]);

   useEffect(() => {
      if (urlDestino !== filterDestino && urlDestino !== debouncedDestino)
         setFilterDestino(urlDestino);
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [urlDestino]);

   useEffect(() => {
      if (urlTrip !== filterTrip && urlTrip !== debouncedTrip)
         setFilterTrip(urlTrip);
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [urlTrip]);

   useEffect(() => {
      if (urlEsfAer !== filterEsfAer && urlEsfAer !== debouncedEsfAer)
         setFilterEsfAer(urlEsfAer);
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [urlEsfAer]);

   // --- Aeronaves data ---
   const { data: aeronaveData } = useAeronaves({ per_page: 100 });
   const aeronaveOptions = useMemo(
      () =>
         (aeronaveData?.items ?? []).map((a) => ({
            value: a.matricula,
            label: a.matricula,
         })),
      [aeronaveData]
   );

   // --- Tipos de missao data ---
   const { data: tiposMissaoData } = useTiposMissao();
   const tipoMissaoOptions = useMemo(
      () =>
         (tiposMissaoData ?? []).map((t) => ({
            value: t.cod,
            label: `${t.cod} - ${t.desc}`,
         })),
      [tiposMissaoData]
   );

   // --- Multiselect handlers (direct to URL) ---
   const handleMultiSelectChange = useCallback(
      (key: string, values: string[]) => {
         const params = new URLSearchParams(searchParams.toString());
         params.delete(key);
         values.forEach((v) => params.append(key, v));
         params.delete("page");
         const qs = params.toString();
         router.replace(qs ? `?${qs}` : "?", { scroll: false });
      },
      [searchParams, router]
   );

   // --- Select / date handlers (direct to URL) ---
   const handleDataIniChange = useCallback(
      (value: string) => updateParams({ data_ini: value || undefined }),
      [updateParams]
   );

   const handleDataFimChange = useCallback(
      (value: string) => updateParams({ data_fim: value || undefined }),
      [updateParams]
   );

   const handlePageChange = useCallback(
      (page: number) =>
         updateParams(
            { page: page > DEFAULT_PAGE ? String(page) : undefined },
            false
         ),
      [updateParams]
   );

   const handlePerPageChange = useCallback(
      (value: number) =>
         updateParams({
            per_page: value !== DEFAULT_PER_PAGE ? String(value) : undefined,
         }),
      [updateParams]
   );

   // --- Missao modal callbacks ---
   const handleOpenCreateMissao = useCallback(() => {
      setEditingMissao(null);
      setShowMissaoModal(true);
   }, []);

   const handleEditMissao = useCallback((missao: MissaoComEtapas) => {
      setEditingMissao(missao);
      setShowMissaoModal(true);
   }, []);

   const handleDeleteMissao = useCallback((missao: MissaoComEtapas) => {
      setDeletingMissao(missao);
      setShowDeleteModal(true);
   }, []);

   const clearFilters = useCallback(() => {
      setFilterOrigem("");
      setFilterDestino("");
      setFilterTrip("");
      setFilterEsfAer("");
      updateParams({
         anv: undefined,
         origem: undefined,
         destino: undefined,
         trip_search: undefined,
         esf_aer: undefined,
         tipo_missao_cod: undefined,
         data_ini: undefined,
         data_fim: undefined,
      });
   }, [updateParams]);

   // --- React Query ---
   const {
      data,
      isLoading: loading,
      isFetching,
   } = useEtapas({
      page: currentPage,
      per_page: perPage,
      anv: urlAnv.length > 0 ? urlAnv : undefined,
      origem: debouncedOrigem || undefined,
      destino: debouncedDestino || undefined,
      trip_search: debouncedTrip || undefined,
      esf_aer: debouncedEsfAer || undefined,
      tipo_missao_cod: urlTipoMissao.length > 0 ? urlTipoMissao : undefined,
      data_ini: urlDataIni || undefined,
      data_fim: urlDataFim || undefined,
   });

   const missoes = data?.items ?? [];
   const totalPages = data?.pages ?? 1;
   const totalItems = data?.total ?? 0;

   const activeFilterCount =
      (urlAnv.length > 0 ? 1 : 0) +
      (urlTipoMissao.length > 0 ? 1 : 0) +
      [
         urlOrigem,
         urlDestino,
         urlTrip,
         urlEsfAer,
         urlDataIni,
         urlDataFim,
      ].filter(Boolean).length;

   const hasActiveFilters = activeFilterCount > 0;
   const isRefetching = !loading && isFetching;

   // --- Selection ---
   const allEtapaIds = missoes.flatMap((m) => m.etapas.map((e) => e.id));
   const allSelected =
      allEtapaIds.length > 0 && allEtapaIds.every((id) => selectedIds.has(id));

   const toggleEtapa = useCallback((id: number) => {
      setSelectedIds((prev) => {
         const next = new Set(prev);
         if (next.has(id)) next.delete(id);
         else next.add(id);
         return next;
      });
   }, []);

   const toggleMissao = useCallback((etapaIds: number[]) => {
      setSelectedIds((prev) => {
         const next = new Set(prev);
         const allChecked = etapaIds.every((id) => next.has(id));
         if (allChecked) {
            etapaIds.forEach((id) => next.delete(id));
         } else {
            etapaIds.forEach((id) => next.add(id));
         }
         return next;
      });
   }, []);

   const toggleAll = useCallback(() => {
      setSelectedIds((prev) => {
         const currentAllSelected =
            allEtapaIds.length > 0 && allEtapaIds.every((id) => prev.has(id));
         if (currentAllSelected) return new Set();
         return new Set(allEtapaIds);
      });
   }, [allEtapaIds]);

   return (
      <div className="flex flex-1 flex-col overflow-hidden p-1">
         <div className="mb-4 shrink-0 rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 p-4">
               <h2>Etapas</h2>
               <div className="flex items-center gap-2">
                  <Button
                     color="red"
                     size="sm"
                     onClick={handleOpenCreateMissao}
                  >
                     <HiPlus className="mr-2 h-4 w-4" />
                     Nova Missao
                  </Button>
                  <Button
                     color="light"
                     size="sm"
                     onClick={() => setShowFilters((v) => !v)}
                     aria-expanded={showFilters}
                     aria-controls="filtros-panel"
                  >
                     <HiFilter className="mr-2 h-4 w-4" />
                     Filtros
                     {hasActiveFilters && (
                        <Badge color="red" size="sm" className="ml-2">
                           {activeFilterCount}
                        </Badge>
                     )}
                  </Button>
                  <Button
                     color="light"
                     size="sm"
                     onClick={() => setGroupByMissao((v) => !v)}
                     title={
                        groupByMissao
                           ? "Exibir tabela plana"
                           : "Agrupar por missao"
                     }
                  >
                     {groupByMissao ? (
                        <HiTable className="mr-2 h-4 w-4" />
                     ) : (
                        <HiViewBoards className="mr-2 h-4 w-4" />
                     )}
                     {groupByMissao ? "Tabela plana" : "Agrupar por Missao"}
                  </Button>
                  <Button
                     color="light"
                     size="sm"
                     disabled={selectedIds.size === 0}
                  >
                     <HiDownload className="mr-2 h-4 w-4" />
                     Exportar
                     {selectedIds.size > 0 && (
                        <Badge color="red" size="sm" className="ml-2">
                           {selectedIds.size}
                        </Badge>
                     )}
                  </Button>
               </div>
            </div>

            {/* Filtros expandidos */}
            {showFilters && (
               <div
                  id="filtros-panel"
                  className="border-t border-gray-200 bg-gray-50 p-4"
               >
                  <div className="flex flex-wrap gap-2">
                     <div className="w-32">
                        <Label className="mb-1 block text-xs font-medium text-gray-700">
                           Data inicial
                        </Label>
                        <TextInput
                           type="date"
                           value={urlDataIni}
                           onChange={(e) => handleDataIniChange(e.target.value)}
                           sizing="sm"
                        />
                     </div>

                     <div className="w-32">
                        <Label className="mb-1 block text-xs font-medium text-gray-700">
                           Data final
                        </Label>
                        <TextInput
                           type="date"
                           value={urlDataFim}
                           onChange={(e) => handleDataFimChange(e.target.value)}
                           sizing="sm"
                        />
                     </div>

                     <div className="w-20">
                        <Label className="mb-1 block text-xs font-medium text-gray-700">
                           Origem
                        </Label>
                        <TextInput
                           placeholder="SBPA"
                           value={filterOrigem}
                           onChange={(e) =>
                              setFilterOrigem(
                                 e.target.value.slice(0, 4).toUpperCase()
                              )
                           }
                           sizing="sm"
                           maxLength={4}
                        />
                     </div>

                     <div className="w-20">
                        <Label className="mb-1 block text-xs font-medium text-gray-700">
                           Destino
                        </Label>
                        <TextInput
                           placeholder="SBBE"
                           value={filterDestino}
                           onChange={(e) =>
                              setFilterDestino(
                                 e.target.value.slice(0, 4).toUpperCase()
                              )
                           }
                           sizing="sm"
                           maxLength={4}
                        />
                     </div>

                     <div className="w-44">
                        <Label className="mb-1 block text-xs font-medium text-gray-700">
                           Aeronave
                        </Label>
                        <MultiSelect
                           options={aeronaveOptions}
                           selected={urlAnv}
                           onChange={(values) =>
                              handleMultiSelectChange("anv", values)
                           }
                           placeholder="Todas"
                           sizing="sm"
                        />
                     </div>

                     <div>
                        <Label className="mb-1 block text-xs font-medium text-gray-700">
                           Esforco Aereo
                        </Label>
                        <TextInput
                           icon={MdSearch}
                           placeholder="Descricao do esforco"
                           value={filterEsfAer}
                           onChange={(e) => setFilterEsfAer(e.target.value)}
                           sizing="sm"
                        />
                     </div>

                     <div className="w-52">
                        <Label className="mb-1 block text-xs font-medium text-gray-700">
                           Tipo de Missao
                        </Label>
                        <MultiSelect
                           options={tipoMissaoOptions}
                           selected={urlTipoMissao}
                           onChange={(values) =>
                              handleMultiSelectChange("tipo_missao_cod", values)
                           }
                           placeholder="Todos"
                           sizing="sm"
                        />
                     </div>

                     <div className="flex-1">
                        <Label className="mb-1 block text-xs font-medium text-gray-700">
                           Tripulante
                        </Label>
                        <TextInput
                           icon={MdSearch}
                           placeholder="Buscar trigrama ou nome de guerra ..."
                           value={filterTrip}
                           onChange={(e) => setFilterTrip(e.target.value)}
                           sizing="sm"
                        />
                     </div>
                  </div>
               </div>
            )}
         </div>

         {/* Tags de filtros ativos */}
         {hasActiveFilters && (
            <div className="mb-3 flex shrink-0 flex-wrap items-center gap-2">
               <span className="text-xs font-medium text-gray-600">
                  Filtros ativos:
               </span>

               {urlDataIni && (
                  <Badge color="red">
                     <div className="flex items-center gap-1.5">
                        <HiCalendar className="h-3 w-3" />
                        <span>De: {formatDateFull(urlDataIni)}</span>
                        <button
                           type="button"
                           aria-label="Remover filtro data inicial"
                           onClick={() => updateParams({ data_ini: undefined })}
                           className="ml-1 hover:text-red-600"
                        >
                           <HiX className="h-3 w-3" />
                        </button>
                     </div>
                  </Badge>
               )}

               {urlDataFim && (
                  <Badge color="red">
                     <div className="flex items-center gap-1.5">
                        <HiCalendar className="h-3 w-3" />
                        <span>Ate: {formatDateFull(urlDataFim)}</span>
                        <button
                           type="button"
                           aria-label="Remover filtro data final"
                           onClick={() => updateParams({ data_fim: undefined })}
                           className="ml-1 hover:text-red-600"
                        >
                           <HiX className="h-3 w-3" />
                        </button>
                     </div>
                  </Badge>
               )}

               {urlAnv.length > 0 && (
                  <Badge color="red">
                     <div className="flex items-center gap-1.5">
                        <MdFlightTakeoff className="h-3 w-3" />
                        <span>Aeronave: {urlAnv.join(", ")}</span>
                        <button
                           type="button"
                           aria-label="Remover filtro aeronave"
                           onClick={() => handleMultiSelectChange("anv", [])}
                           className="ml-1 hover:text-red-600"
                        >
                           <HiX className="h-3 w-3" />
                        </button>
                     </div>
                  </Badge>
               )}

               {urlOrigem && (
                  <Badge color="red">
                     <div className="flex items-center gap-1.5">
                        <MdFlightTakeoff className="h-3 w-3" />
                        <span>Origem: {urlOrigem}</span>
                        <button
                           type="button"
                           aria-label="Remover filtro origem"
                           onClick={() => {
                              setFilterOrigem("");
                              updateParams({ origem: undefined });
                           }}
                           className="ml-1 hover:text-red-600"
                        >
                           <HiX className="h-3 w-3" />
                        </button>
                     </div>
                  </Badge>
               )}

               {urlDestino && (
                  <Badge color="red">
                     <div className="flex items-center gap-1.5">
                        <MdFlightLand className="h-3 w-3" />
                        <span>Destino: {urlDestino}</span>
                        <button
                           type="button"
                           aria-label="Remover filtro destino"
                           onClick={() => {
                              setFilterDestino("");
                              updateParams({ destino: undefined });
                           }}
                           className="ml-1 hover:text-red-600"
                        >
                           <HiX className="h-3 w-3" />
                        </button>
                     </div>
                  </Badge>
               )}

               {urlTrip && (
                  <Badge color="red">
                     <div className="flex items-center gap-1.5">
                        <HiUser className="h-3 w-3" />
                        <span>Tripulante: {urlTrip}</span>
                        <button
                           type="button"
                           aria-label="Remover filtro tripulante"
                           onClick={() => {
                              setFilterTrip("");
                              updateParams({ trip_search: undefined });
                           }}
                           className="ml-1 hover:text-red-600"
                        >
                           <HiX className="h-3 w-3" />
                        </button>
                     </div>
                  </Badge>
               )}

               {urlEsfAer && (
                  <Badge color="red">
                     <div className="flex items-center gap-1.5">
                        <MdBarChart className="h-3 w-3" />
                        <span>ESF: {urlEsfAer}</span>
                        <button
                           type="button"
                           aria-label="Remover filtro esforco aereo"
                           onClick={() => {
                              setFilterEsfAer("");
                              updateParams({ esf_aer: undefined });
                           }}
                           className="ml-1 hover:text-red-600"
                        >
                           <HiX className="h-3 w-3" />
                        </button>
                     </div>
                  </Badge>
               )}

               {urlTipoMissao.length > 0 && (
                  <Badge color="red">
                     <div className="flex items-center gap-1.5">
                        <span>Tipo Missao: {urlTipoMissao.join(", ")}</span>
                        <button
                           type="button"
                           aria-label="Remover filtro tipo missao"
                           onClick={() =>
                              handleMultiSelectChange("tipo_missao_cod", [])
                           }
                           className="ml-1 hover:text-red-600"
                        >
                           <HiX className="h-3 w-3" />
                        </button>
                     </div>
                  </Badge>
               )}

               <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs text-gray-500 underline hover:text-gray-700"
               >
                  Limpar todos
               </button>
            </div>
         )}

         {/* Conteudo principal */}
         <div className="relative flex-1 overflow-auto">
            {loading && (
               <div className="flex h-64 items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                     <Spinner size="lg" color="failure" />
                     <p className="text-sm text-gray-600">
                        Carregando etapas...
                     </p>
                  </div>
               </div>
            )}

            {!loading && missoes.length === 0 && (
               <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-gray-200 bg-white">
                  <div className="mb-4 rounded-full bg-gray-100 p-4">
                     <MdBarChart className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                     {hasActiveFilters
                        ? "Nenhuma etapa encontrada"
                        : "Nenhuma etapa disponivel"}
                  </h3>
                  <p className="max-w-md text-center text-sm text-gray-500">
                     {hasActiveFilters
                        ? "Nao foram encontrados resultados com os filtros aplicados."
                        : "Utilize os filtros para visualizar as etapas."}
                  </p>
                  {hasActiveFilters && (
                     <button
                        type="button"
                        onClick={clearFilters}
                        className="mt-3 text-sm text-red-600 hover:text-red-700"
                     >
                        Limpar filtros
                     </button>
                  )}
               </div>
            )}

            {missoes.length > 0 && (
               <div
                  className={clsx(
                     "transition-opacity duration-200",
                     isRefetching && "pointer-events-none opacity-40"
                  )}
               >
                  <EtapasTable
                     missoes={missoes}
                     loading={isRefetching}
                     selectedIds={selectedIds}
                     onToggleEtapa={toggleEtapa}
                     onToggleMissao={toggleMissao}
                     onToggleAll={toggleAll}
                     allSelected={allSelected}
                     onEditMissao={handleEditMissao}
                     onDeleteMissao={handleDeleteMissao}
                     grouped={groupByMissao}
                  />
               </div>
            )}

            {(missoes.length > 0 || loading) && (
               <nav
                  className={clsx(
                     "mt-4 flex flex-col items-start justify-between space-y-3 rounded-lg border border-gray-200 bg-white px-4 py-3 md:flex-row md:items-center md:space-y-0",
                     "transition-opacity duration-200",
                     isRefetching && "pointer-events-none opacity-50"
                  )}
                  aria-label="Navegacao da tabela"
               >
                  <div className="flex items-center gap-4">
                     <span className="text-sm font-normal text-gray-500">
                        Mostrando{" "}
                        <span className="font-semibold text-gray-900">
                           {(currentPage - 1) * perPage + 1}–
                           {Math.min(currentPage * perPage, totalItems)}
                        </span>{" "}
                        de{" "}
                        <span className="font-semibold text-gray-900">
                           {totalItems}
                        </span>{" "}
                        etapas
                     </span>
                     <div className="flex items-center gap-2">
                        <label
                           htmlFor="perPage"
                           className="text-sm text-gray-500"
                        >
                           Por pagina:
                        </label>
                        <Select
                           id="perPage"
                           sizing="sm"
                           value={perPage}
                           onChange={(e) =>
                              handlePerPageChange(Number(e.target.value))
                           }
                           className="w-20"
                        >
                           {PER_PAGE_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                 {option}
                              </option>
                           ))}
                        </Select>
                     </div>
                  </div>
                  {totalPages > 1 && (
                     <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                     />
                  )}
               </nav>
            )}
         </div>

         <MissaoFormModal
            show={showMissaoModal}
            onClose={() => setShowMissaoModal(false)}
            editingMissao={editingMissao}
         />

         <MissaoDeleteModal
            show={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            missao={deletingMissao}
         />
      </div>
   );
}
