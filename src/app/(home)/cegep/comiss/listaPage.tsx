"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button, Label, Select, TextInput, Badge } from "flowbite-react";
import { TableComiss } from "./components/tableComiss";
import { TableComissSkeleton } from "./components/TableComissSkeleton";
import { ComissSubheader } from "./components/ComissSubheader";
import { RoleBasedRoute } from "../../hooks/useRoleBased";

import {
   HiFilter,
   HiX,
   HiPlus,
   HiOutlineUser,
   HiOutlineCheckCircle,
   HiOutlineUserGroup,
   HiOutlineTag,
   HiOutlineCube,
   HiOutlineClipboardList,
} from "react-icons/hi";
import { useComissList } from "@/hooks/queries";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { MultiSelect } from "@/components/MultiSelect";
import { postoGradRecords } from "@/constants/militar";
import {
   useSearchParamsUpdater,
   getStringParam,
   getArrayParam,
   serializeArray,
   serializeString,
} from "@/hooks/useSearchParamsState";

const PG_OPTIONS = postoGradRecords.map((pg) => ({
   value: pg.short,
   label: pg.mid,
}));

// Rótulos da situação, usados no subtítulo e nas tags de filtro ativo.
const STATUS_LABELS: Record<string, string> = {
   aberto: "Abertos",
   fechado: "Fechados",
   todos: "Abertos e fechados",
};

export function ListaPage() {
   const router = useRouter();
   const { searchParams, setParams } = useSearchParamsUpdater();

   // Ler filtros da URL
   const statusComis = getStringParam(searchParams, "status", "aberto");
   const urlSearch = getStringParam(searchParams, "search");
   const filterPG = getArrayParam(searchParams, "pg");
   const filterTipo = getStringParam(searchParams, "tipo");
   const filterModulo = getStringParam(searchParams, "modulo");

   // Estado local para input de texto (debounce)
   const [searchUser, setSearchUser] = useState(urlSearch);
   const deferredSearch = useDebouncedValue(searchUser, 500);

   // Sync debounced search -> URL
   useEffect(() => {
      if (deferredSearch !== urlSearch) {
         setParams({ search: deferredSearch || undefined });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [deferredSearch]);

   // Sync URL -> local state (navegação externa)
   useEffect(() => {
      if (urlSearch !== searchUser && urlSearch !== deferredSearch) {
         setSearchUser(urlSearch);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [urlSearch]);

   const [filtersExpanded, setFiltersExpanded] = useState(false);

   // Animação suave do painel de filtros. Um ResizeObserver mantém a altura
   // correta mesmo quando o grid de filtros quebra em mais linhas no resize.
   const filtersRef = useRef<HTMLDivElement>(null);
   const [filtersHeight, setFiltersHeight] = useState(0);

   useEffect(() => {
      const el = filtersRef.current;
      if (!el) return;
      const update = () => setFiltersHeight(el.scrollHeight);
      update();
      const ro = new ResizeObserver(update);
      ro.observe(el);
      return () => ro.disconnect();
   }, []);

   // Handlers de filtros -> URL
   const setStatusComis = useCallback(
      (v: string) => setParams({ status: serializeString(v, "aberto") }),
      [setParams]
   );
   const setFilterPG = useCallback(
      (v: string[]) => setParams({ pg: serializeArray(v) }),
      [setParams]
   );
   const setFilterTipo = useCallback(
      (v: string) => setParams({ tipo: v || undefined }),
      [setParams]
   );
   const setFilterModulo = useCallback(
      (v: string) => setParams({ modulo: v || undefined }),
      [setParams]
   );

   // React Query
   const {
      data: cmtosRaw,
      isLoading,
      isFetching,
   } = useComissList({
      status: statusComis,
      search: deferredSearch,
      pg: filterPG,
      tipo: filterTipo,
      modulo: filterModulo,
   });

   const cmtos = cmtosRaw || [];

   const loading = isLoading;
   const hasActiveFilters = !!(
      searchUser ||
      statusComis !== "aberto" ||
      filterPG.length > 0 ||
      filterTipo ||
      filterModulo
   );

   const activeFilterCount = [
      searchUser,
      statusComis !== "aberto" ? statusComis : null,
      filterPG.length > 0 ? filterPG : null,
      filterTipo,
      filterModulo,
   ].filter((v) => v).length;

   const clearFilters = useCallback(() => {
      setSearchUser("");
      setParams({
         status: undefined,
         search: undefined,
         pg: undefined,
         tipo: undefined,
         modulo: undefined,
      });
   }, [setParams]);

   return (
      <div className="flex flex-col">
         {/* Subheader da aba */}
         <ComissSubheader
            actions={
               <>
                  <Button
                     color="light"
                     size="sm"
                     onClick={() => setFiltersExpanded(!filtersExpanded)}
                  >
                     <HiFilter className="mr-2 h-4 w-4" />
                     {filtersExpanded ? "Ocultar" : "Filtros"}
                     {hasActiveFilters && (
                        <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                           {activeFilterCount}
                        </span>
                     )}
                  </Button>
                  <RoleBasedRoute requiredRoles={["apoio_avancado"]}>
                     <Button
                        color="red"
                        size="sm"
                        onClick={() => router.push("/cegep/comiss/new")}
                     >
                        <HiPlus className="mr-2 h-4 w-4" />
                        Novo
                     </Button>
                  </RoleBasedRoute>
               </>
            }
         >
            <h2 className="text-base font-semibold text-slate-900">
               Registros
            </h2>
            <p className="text-sm text-slate-500">
               {!loading && cmtos.length > 0
                  ? `${cmtos.length} ${
                       cmtos.length === 1
                          ? "comissionamento"
                          : "comissionamentos"
                    }`
                  : (STATUS_LABELS[statusComis] ?? STATUS_LABELS.aberto)}
            </p>
         </ComissSubheader>

         {/* Tags de filtros ativos */}
         {hasActiveFilters && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
               <span className="text-xs font-medium text-slate-600">
                  Filtros ativos:
               </span>

               {searchUser && (
                  <FilterTag onRemove={() => setSearchUser("")}>
                     Militar: {searchUser}
                  </FilterTag>
               )}

               {statusComis !== "aberto" && (
                  <FilterTag onRemove={() => setStatusComis("aberto")}>
                     Situação: {STATUS_LABELS[statusComis] ?? statusComis}
                  </FilterTag>
               )}

               {filterPG.length > 0 && (
                  <FilterTag onRemove={() => setFilterPG([])}>
                     P/G:{" "}
                     {filterPG
                        .map(
                           (pg) =>
                              PG_OPTIONS.find((o) => o.value === pg)?.label ||
                              pg
                        )
                        .join(", ")}
                  </FilterTag>
               )}

               {filterTipo && (
                  <FilterTag onRemove={() => setFilterTipo("")}>
                     Tipo:{" "}
                     {filterTipo === "periodo" ? "Período" : "Comparativo"}
                  </FilterTag>
               )}

               {filterModulo && (
                  <FilterTag onRemove={() => setFilterModulo("")}>
                     Módulo: {filterModulo === "sim" ? "Sim" : "Não"}
                  </FilterTag>
               )}

               <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs text-slate-500 underline hover:text-slate-700"
               >
                  Limpar todos
               </button>
            </div>
         )}

         {/* Painel de filtros — transicao suave (gap dentro da area animada) */}
         <div
            className="overflow-hidden transition-all duration-300 ease-in-out"
            style={{
               maxHeight: filtersExpanded ? `${filtersHeight}px` : "0px",
               opacity: filtersExpanded ? 1 : 0,
            }}
         >
            <div ref={filtersRef} className="pt-3">
               <div className="rounded border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                     <h6 className="text-sm font-medium text-slate-700">
                        Filtros
                     </h6>
                     {hasActiveFilters && (
                        <button
                           type="button"
                           onClick={clearFilters}
                           className="flex items-center gap-1.5 rounded px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                        >
                           <HiX />
                           Limpar
                        </button>
                     )}
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                     {/* Militar */}
                     <div>
                        <FilterLabel icon={<HiOutlineUser />}>
                           Militar
                        </FilterLabel>
                        <TextInput
                           type="text"
                           value={searchUser}
                           onChange={(e) => setSearchUser(e.target.value)}
                           placeholder="Nome completo ou de guerra"
                           sizing="sm"
                        />
                     </div>

                     {/* Situação */}
                     <div>
                        <FilterLabel icon={<HiOutlineCheckCircle />}>
                           Situação
                        </FilterLabel>
                        <Select
                           value={statusComis}
                           onChange={(e) => setStatusComis(e.target.value)}
                           sizing="sm"
                        >
                           <option value="aberto">Aberto</option>
                           <option value="fechado">Fechado</option>
                           <option value="todos">Todos</option>
                        </Select>
                     </div>

                     {/* P/G */}
                     <div>
                        <FilterLabel icon={<HiOutlineUserGroup />}>
                           Posto/Graduação
                        </FilterLabel>
                        <MultiSelect
                           options={PG_OPTIONS}
                           selected={filterPG}
                           onChange={setFilterPG}
                           placeholder="Todos"
                           sizing="sm"
                        />
                     </div>

                     {/* Tipo */}
                     <div>
                        <FilterLabel icon={<HiOutlineTag />}>Tipo</FilterLabel>
                        <Select
                           value={filterTipo}
                           onChange={(e) => setFilterTipo(e.target.value)}
                           sizing="sm"
                        >
                           <option value="">Todos</option>
                           <option value="periodo">Período</option>
                           <option value="comparativo">Comparativo</option>
                        </Select>
                     </div>

                     {/* Módulo */}
                     <div>
                        <FilterLabel icon={<HiOutlineCube />}>
                           Módulo
                        </FilterLabel>
                        <Select
                           value={filterModulo}
                           onChange={(e) => setFilterModulo(e.target.value)}
                           sizing="sm"
                        >
                           <option value="">Todos</option>
                           <option value="sim">Sim</option>
                           <option value="nao">Não</option>
                        </Select>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Conteudo */}
         <div className="mt-3 min-h-50 flex-1">
            {loading ? (
               <TableComissSkeleton />
            ) : cmtos.length === 0 ? (
               <div className="flex flex-col items-center justify-center px-4 py-16">
                  <div className="mb-4 rounded-full bg-slate-50 p-6">
                     <HiOutlineClipboardList className="h-16 w-16 text-slate-400" />
                  </div>
                  <h3 className="mb-1 text-lg font-semibold text-slate-900">
                     Nenhum comissionamento encontrado
                  </h3>
                  <p className="text-sm text-slate-500">
                     {hasActiveFilters
                        ? "Tente ajustar ou limpar os filtros ativos"
                        : "Ainda não há comissionamentos cadastrados"}
                  </p>
               </div>
            ) : (
               <div
                  className={clsx(
                     "transition-opacity",
                     isFetching && "opacity-50"
                  )}
               >
                  <TableComiss cmtos={cmtos} />
               </div>
            )}
         </div>
      </div>
   );
}

function FilterLabel({
   icon,
   children,
}: {
   icon: React.ReactNode;
   children: React.ReactNode;
}) {
   return (
      <Label className="mb-1.5 flex items-center gap-1.5 text-xs text-slate-600">
         <span className="text-slate-500">{icon}</span>
         {children}
      </Label>
   );
}

function FilterTag({
   children,
   onRemove,
}: {
   children: React.ReactNode;
   onRemove: () => void;
}) {
   return (
      <Badge color="failure">
         <div className="flex items-center gap-1.5">
            <span>{children}</span>
            <button
               type="button"
               aria-label="Remover filtro"
               onClick={onRemove}
               className="ml-1 hover:text-red-600"
            >
               <HiX className="h-3 w-3" />
            </button>
         </div>
      </Badge>
   );
}
