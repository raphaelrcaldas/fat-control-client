"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button, Label, Select, TextInput, Badge } from "flowbite-react";
import { TableComiss } from "./components/tableComiss";
import { TableComissSkeleton } from "./components/TableComissSkeleton";
import { ComissSubheader } from "./components/ComissSubheader";
import { RoleBasedRoute } from "../../hooks/useRoleBased";

import {
   HiFilter,
   HiExclamation,
   HiX,
   HiPlus,
   HiOutlineUser,
   HiOutlineCheckCircle,
   HiOutlineUserGroup,
   HiOutlineTag,
   HiOutlineCube,
   HiOutlineClipboardList,
} from "react-icons/hi";
import { useComissRecords } from "@/hooks/queries/useComiss";
import { Pagination } from "@/components/Pagination";
import { SegmentedControl } from "@/components/SegmentedControl";
import { COMISS_SORT_KEYS, ComissOrderBy } from "services/routes/cegep/comiss";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { MultiSelect } from "@/components/MultiSelect";
import { postoGradRecords } from "@/constants/militar";
import {
   useSearchParamsUpdater,
   getStringParam,
   getNumberParam,
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
};

const PER_PAGE = 20;
// Paridade com `le=10_000` de `page` em GET /cegep/comiss/: acima disso a API
// responde 422. Limitada, a página vem vazia com metadados e o efeito de
// ajuste leva a URL à última página existente.
const MAX_PAGE = 10_000;

// Ordenação aplicada enquanto a URL não traz `order_by`: abertos por
// antiguidade, fechados pelo fechamento mais recente. Uma coluna escolhida
// pelo usuário vai explícita na URL e se mantém ao alternar a situação.
const DEFAULT_SORT: Record<
   "aberto" | "fechado",
   { key: ComissOrderBy; direction: "asc" | "desc" }
> = {
   aberto: { key: "militar", direction: "asc" },
   fechado: { key: "data_fc", direction: "desc" },
};

export function ListaPage() {
   const router = useRouter();
   const { searchParams, setParams } = useSearchParamsUpdater();

   // Ler filtros da URL
   const rawStatus = getStringParam(searchParams, "status", "aberto");
   const statusComis = rawStatus === "fechado" ? "fechado" : "aberto";
   const urlSearch = getStringParam(searchParams, "search");
   const filterPG = getArrayParam(searchParams, "pg");
   const filterTipo = getStringParam(searchParams, "tipo");
   const filterModulo = getStringParam(searchParams, "modulo");
   const requestedPage = getNumberParam(searchParams, "page");
   const page =
      statusComis === "fechado" &&
      typeof requestedPage === "number" &&
      Number.isSafeInteger(requestedPage) &&
      requestedPage > 0
         ? Math.min(requestedPage, MAX_PAGE)
         : 1;
   // `direction` solta, sem `order_by` válido, é ignorada: vale o par padrão.
   const explicitOrderBy = COMISS_SORT_KEYS.find(
      (key) => key === getStringParam(searchParams, "order_by")
   );
   const orderBy = explicitOrderBy ?? DEFAULT_SORT[statusComis].key;
   const direction: "asc" | "desc" = explicitOrderBy
      ? getStringParam(searchParams, "direction") === "desc"
         ? "desc"
         : "asc"
      : DEFAULT_SORT[statusComis].direction;

   useEffect(() => {
      // Links antigos com "todos" voltam à visão de acompanhamento.
      if (rawStatus !== "aberto" && rawStatus !== "fechado") {
         setParams({ status: undefined, page: undefined });
      } else if (statusComis === "aberto" && searchParams.has("page")) {
         setParams({ page: undefined });
      }
   }, [rawStatus, statusComis, searchParams, setParams]);

   // Estado local para input de texto (debounce)
   const [searchUser, setSearchUser] = useState(urlSearch);
   const deferredSearch = useDebouncedValue(searchUser, 500);

   // Sync debounced search -> URL
   useEffect(() => {
      if (deferredSearch !== urlSearch) {
         setParams({ search: deferredSearch || undefined, page: undefined });
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
      (v: string) =>
         setParams({ status: serializeString(v, "aberto"), page: undefined }),
      [setParams]
   );
   const setFilterPG = useCallback(
      (v: string[]) => setParams({ pg: serializeArray(v), page: undefined }),
      [setParams]
   );
   const setFilterTipo = useCallback(
      (v: string) => setParams({ tipo: v || undefined, page: undefined }),
      [setParams]
   );
   const setFilterModulo = useCallback(
      (v: string) => setParams({ modulo: v || undefined, page: undefined }),
      [setParams]
   );

   // React Query
   const {
      data: response,
      isLoading,
      isFetching,
      isError,
      isPlaceholderData,
      refetch,
   } = useComissRecords({
      status: statusComis,
      // A URL muda busca e página numa só escrita; nunca pedir o termo
      // novo com a página antiga enquanto o debounce é sincronizado.
      search: urlSearch,
      pg: filterPG,
      tipo: filterTipo,
      modulo: filterModulo,
      order_by: orderBy,
      direction,
      page: statusComis === "fechado" ? page : undefined,
      per_page: statusComis === "fechado" ? PER_PAGE : undefined,
   });

   const cmtosRaw = response?.data;
   const cmtos = cmtosRaw || [];
   const pagination = response && "total" in response ? response : undefined;
   const total = pagination?.total ?? cmtos.length;
   const displayedPage = pagination?.page ?? page;

   // Exclusão concorrente pode esvaziar a última página. Corrige o endereço
   // somente com uma resposta atual, nunca usando metadados de placeholder.
   useEffect(() => {
      if (
         statusComis === "fechado" &&
         pagination &&
         !isPlaceholderData &&
         !isError &&
         page > pagination.pages
      ) {
         setParams({
            page: pagination.pages > 1 ? String(pagination.pages) : undefined,
         });
      }
   }, [statusComis, pagination, isPlaceholderData, isError, page, setParams]);

   const handleSort = useCallback(
      (key: ComissOrderBy) => {
         const nextDirection =
            key === orderBy && direction === "asc" ? "desc" : "asc";
         const padrao = DEFAULT_SORT[statusComis];
         // Só o par idêntico ao padrão da situação sai da URL; qualquer outro
         // vai explícito, senão voltaria ao padrão (ex.: Militar asc em Fechados).
         const ehPadrao =
            key === padrao.key && nextDirection === padrao.direction;
         setParams({
            order_by: ehPadrao ? undefined : key,
            direction: ehPadrao ? undefined : nextDirection,
            page: undefined,
         });
      },
      [orderBy, direction, statusComis, setParams]
   );
   const sortConfig = useMemo(
      () => ({ key: orderBy, direction }),
      [orderBy, direction]
   );

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
         page: undefined,
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
               {!loading && !isPlaceholderData && total > 0
                  ? `${total} ${
                       total === 1 ? "comissionamento" : "comissionamentos"
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

                     {/* Situação e nome ocupam a largura inteira no celular;
                         os demais filtros têm opções curtas e dividem a linha. */}
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
                        <div className="col-span-2 lg:col-span-1">
                           <FilterLabel icon={<HiOutlineCheckCircle />}>
                              Situação
                           </FilterLabel>
                           <fieldset
                              disabled={loading}
                              className="disabled:opacity-50"
                           >
                              <SegmentedControl
                                 ariaLabel="Situação do comissionamento"
                                 options={[
                                    { label: "Abertos", value: "aberto" },
                                    { label: "Fechados", value: "fechado" },
                                 ]}
                                 value={statusComis}
                                 onChange={setStatusComis}
                                 className="w-full"
                              />
                           </fieldset>
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
            ) : isError && !cmtosRaw ? (
               // Erro nunca vira "nenhum comissionamento": sem dado, mostra a
               // falha e oferece nova tentativa.
               <div
                  role="alert"
                  className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center"
               >
                  <p className="text-sm font-medium text-red-800">
                     Não foi possível carregar os comissionamentos
                  </p>
                  <Button
                     color="light"
                     size="sm"
                     onClick={() => refetch()}
                     disabled={isFetching}
                  >
                     Tentar novamente
                  </Button>
               </div>
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
                  {/* Refetch que falha com a lista em tela: mantém o dado e
                      avisa, sem trocar a tela pelo erro. */}
                  {isError && (
                     <p
                        role="status"
                        className="mb-2 flex items-center gap-2 rounded border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500"
                     >
                        <HiExclamation
                           aria-hidden
                           className="size-3.5 shrink-0"
                        />
                        <span className="min-w-0 flex-1 truncate">
                           Não foi possível atualizar a lista
                        </span>
                        <button
                           type="button"
                           onClick={() => refetch()}
                           disabled={isFetching}
                           className="min-h-[24px] shrink-0 font-semibold text-slate-900 underline underline-offset-2 disabled:opacity-50"
                        >
                           Tentar novamente
                        </button>
                     </p>
                  )}
                  <TableComiss
                     cmtos={cmtos}
                     sortConfig={sortConfig}
                     onSort={handleSort}
                  />
               </div>
            )}
         </div>
         {statusComis === "fechado" && pagination && total > 0 && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
               <p className="text-sm text-slate-500" role="status">
                  Mostrando {(displayedPage - 1) * pagination.per_page + 1}–
                  {Math.min(displayedPage * pagination.per_page, total)} de{" "}
                  {total}
               </p>
               {pagination.pages > 1 && (
                  <fieldset
                     disabled={isPlaceholderData}
                     className="w-full disabled:opacity-50 sm:w-auto"
                  >
                     <legend className="sr-only">
                        Paginação dos comissionamentos fechados
                     </legend>
                     <Pagination
                        currentPage={displayedPage}
                        totalPages={pagination.pages}
                        onPageChange={(value) =>
                           setParams({
                              page: value > 1 ? String(value) : undefined,
                           })
                        }
                     />
                  </fieldset>
               )}
            </div>
         )}
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
