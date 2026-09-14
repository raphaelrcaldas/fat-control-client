"use client";

import { useState, useEffect, useCallback } from "react";
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

   // No celular o botao E o resumo do escopo (a fita de pilhas fica oculta):
   // ele mostra a situacao vigente, que e o recorte principal da lista, e conta
   // os demais filtros, que nao cabem no rotulo.
   const situacaoLabel = STATUS_LABELS[statusComis] ?? STATUS_LABELS.aberto;
   const outrosFiltros = [
      searchUser,
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
            compact
            actions={
               /* No celular o botao de Novo fica so-icone (o par nao cabia ao
                  lado do titulo e custava uma segunda linha da faixa), mas o de
                  Filtros carrega a situacao vigente: e ele que substitui a fita
                  de pilhas, oculta abaixo de `md`. */
               <>
                  <Button
                     color="light"
                     size="sm"
                     aria-expanded={filtersExpanded}
                     aria-label={`Filtros: ${situacaoLabel}${
                        outrosFiltros ? `, mais ${outrosFiltros}` : ""
                     }`}
                     onClick={() => setFiltersExpanded(!filtersExpanded)}
                  >
                     <HiFilter className="h-4 w-4 shrink-0" />
                     {/* Mobile: a situacao vigente. Desktop: o rotulo do botao,
                         porque la a fita de chips ja diz o escopo. */}
                     <span className="mx-1.5 max-w-20 truncate md:hidden">
                        {situacaoLabel}
                     </span>
                     <span className="mx-2 hidden md:inline">
                        {filtersExpanded ? "Ocultar" : "Filtros"}
                     </span>
                     {/* No mobile conta so o que NAO cabe no rotulo; no desktop
                         conta tudo, como antes. */}
                     {outrosFiltros > 0 && (
                        <span
                           aria-hidden
                           className="bg-primary-600 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white md:hidden"
                        >
                           {outrosFiltros}
                        </span>
                     )}
                     {hasActiveFilters && (
                        <span
                           aria-hidden
                           className="bg-primary-600 hidden h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white md:flex"
                        >
                           {activeFilterCount}
                        </span>
                     )}
                  </Button>
                  <RoleBasedRoute requiredRoles={["apoio_avancado"]}>
                     <Button
                        color="primary"
                        size="sm"
                        aria-label="Novo comissionamento"
                        title="Novo comissionamento"
                        onClick={() => router.push("/cegep/comiss/new")}
                     >
                        <HiPlus className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Novo</span>
                     </Button>
                  </RoleBasedRoute>
               </>
            }
         >
            <h2 className="text-base font-semibold text-slate-900">
               Registros
            </h2>
            <p className="truncate text-sm text-slate-500">
               {!loading && cmtos.length > 0
                  ? `${cmtos.length} ${
                       cmtos.length === 1
                          ? "comissionamento"
                          : "comissionamentos"
                    }`
                  : (STATUS_LABELS[statusComis] ?? STATUS_LABELS.aberto)}
            </p>
         </ComissSubheader>

         {/* Tags de filtros ativos — `hidden md:flex`: no celular a fita custa
             uma linha inteira da lista para repetir o que o botao de Filtros ja
             diz (situacao vigente + contador do resto). No desktop nao ha
             painel colapsado, entao ela nao custa linha e ainda da o atalho de
             tirar um filtro sem reabrir o select. */}
         {hasActiveFilters && (
            <div className="mt-3 hidden flex-wrap items-center gap-2 md:flex">
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

         {/* Painel de filtros — a altura anima por `grid-template-rows`
             (0fr → 1fr), e nao por `max-height` medido em JS: o valor certo e o
             do conteudo, sem ResizeObserver para reconferir quando o grid
             quebra em mais linhas. `inert` enquanto fechado tira os campos do
             Tab e do leitor de tela. */}
         <div
            className={clsx(
               "grid transition-[grid-template-rows] duration-300 ease-in-out motion-reduce:transition-none",
               filtersExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            )}
         >
            <div className="overflow-hidden" inert={!filtersExpanded}>
               <div className="pt-3">
                  <div className="rounded border border-slate-200 bg-white p-4 shadow-sm">
                     <div className="mb-4 flex items-center justify-between">
                        {/* `h3` e não `h6`: o nível segue a hierarquia (h1 da
                         página → h2 da lista → este), não o tamanho da fonte,
                         que vem da classe. Saltar níveis reprova
                         `heading-order` e quebra a navegação por títulos. */}
                        <h3 className="text-sm font-medium text-slate-700">
                           Filtros
                        </h3>
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

                     {/* Duas colunas ja no celular: os quatro seletores tem
                         opcoes curtas (Aberto/Fechado, Sim/Nao) e cabem em
                         ~150px a 360px, poupando quatro linhas de rolagem. O
                         campo de nome e a excecao e fica com a linha inteira. */}
                     <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                        {/* Militar */}
                        <div className="col-span-2 lg:col-span-1">
                           <FilterLabel
                              htmlFor="filtro-militar"
                              icon={<HiOutlineUser />}
                           >
                              Militar
                           </FilterLabel>
                           <TextInput
                              id="filtro-militar"
                              type="text"
                              value={searchUser}
                              onChange={(e) => setSearchUser(e.target.value)}
                              placeholder="Nome completo ou de guerra"
                              sizing="md"
                           />
                        </div>

                        {/* Situação */}
                        <div>
                           <FilterLabel
                              htmlFor="filtro-situacao"
                              icon={<HiOutlineCheckCircle />}
                           >
                              Situação
                           </FilterLabel>
                           <Select
                              id="filtro-situacao"
                              value={statusComis}
                              onChange={(e) => setStatusComis(e.target.value)}
                              sizing="md"
                           >
                              <option value="aberto">Aberto</option>
                              <option value="fechado">Fechado</option>
                              <option value="todos">Todos</option>
                           </Select>
                        </div>

                        {/* P/G */}
                        <div>
                           {/* Sem `htmlFor`: o MultiSelect é um botão com
                            dropdown, não um campo com id — o nome acessível
                            dele vai por `ariaLabel`. */}
                           <FilterLabel icon={<HiOutlineUserGroup />}>
                              Posto/Graduação
                           </FilterLabel>
                           <MultiSelect
                              ariaLabel="Posto/Graduação"
                              options={PG_OPTIONS}
                              selected={filterPG}
                              onChange={setFilterPG}
                              placeholder="Todos"
                              sizing="md"
                           />
                        </div>

                        {/* Tipo */}
                        <div>
                           <FilterLabel
                              htmlFor="filtro-tipo"
                              icon={<HiOutlineTag />}
                           >
                              Tipo
                           </FilterLabel>
                           <Select
                              id="filtro-tipo"
                              value={filterTipo}
                              onChange={(e) => setFilterTipo(e.target.value)}
                              sizing="md"
                           >
                              <option value="">Todos</option>
                              <option value="periodo">Período</option>
                              <option value="comparativo">Comparativo</option>
                           </Select>
                        </div>

                        {/* Módulo */}
                        <div>
                           <FilterLabel
                              htmlFor="filtro-modulo"
                              icon={<HiOutlineCube />}
                           >
                              Módulo
                           </FilterLabel>
                           <Select
                              id="filtro-modulo"
                              value={filterModulo}
                              onChange={(e) => setFilterModulo(e.target.value)}
                              sizing="md"
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
                  <p className="truncate text-sm text-slate-500">
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

/**
 * Rótulo de um campo de filtro.
 *
 * O `htmlFor` não é decorativo: sem ele o `<select>` fica sem nome acessível
 * (reprova `select-name` no axe) e o rótulo visível não foca o campo ao ser
 * clicado — o texto está ali, mas só para quem enxerga.
 */
function FilterLabel({
   htmlFor,
   icon,
   children,
}: {
   htmlFor?: string;
   icon: React.ReactNode;
   children: React.ReactNode;
}) {
   return (
      <Label
         htmlFor={htmlFor}
         className="mb-1.5 flex items-center gap-1.5 text-xs text-slate-600"
      >
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
      <Badge color="primary">
         <div className="flex items-center gap-1.5">
            <span>{children}</span>
            <button
               type="button"
               aria-label="Remover filtro"
               onClick={onRemove}
               className="hover:text-primary-800 ml-1"
            >
               <HiX className="h-3 w-3" />
            </button>
         </div>
      </Badge>
   );
}
