"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MdHealthAndSafety } from "react-icons/md";
import clsx from "clsx";
import { Button } from "flowbite-react";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import { useCartoesSaude } from "@/hooks/queries";
import type { UserCartaoSaude } from "services/routes/aeromedica/cartoesSaude";
import type { DateStatus } from "@/utils/dateStatus";
import {
   DOCS,
   SEVERIDADES,
   type SortField,
   type SortDirection,
   type TripFilter,
   type ValidadeFilter,
   type DocKey,
   type CartaoStats,
} from "./types";
import { getCemalStatus, getDateStatus } from "./utils/dateStatus";
import { compareByAntiguidade } from "utils/sortByAntiguidade";
import SummaryBar from "./components/SummaryBar";
import SummaryBarSkeleton from "./components/SummaryBarSkeleton";
import Filters from "./components/Filters";
import CartoesSaudeTable from "./components/CartoesSaudeTable";
import CartoesSaudeTableSkeleton from "./components/CartoesSaudeTableSkeleton";
import CartoesSaudeCardList from "./components/CartoesSaudeCardList";
import CartoesSaudeCardListSkeleton from "./components/CartoesSaudeCardListSkeleton";
import EditCartaoDrawer from "./components/EditCartaoDrawer";
import OrfaosAlert from "./components/OrfaosAlert";
import { PermBased } from "../../hooks/usePermBased";
import { useExportCart } from "@/components/export/useExportCart";
import { ExportCartBar } from "@/components/export/ExportCartBar";
import { ExportCartDrawer } from "@/components/export/ExportCartDrawer";
import { ExportColumnsModal } from "@/components/export/ExportColumnsModal";
import { CARTOES_SAUDE_EXPORT_COLUMNS } from "./exportColumns";

// Fora do componente: identidade estavel, para o `toggle` do carrinho nao
// mudar a cada render e derrubar o `memo` das linhas.
const getUserId = (item: UserCartaoSaude) => item.user.id;
const getCartLabel = (item: UserCartaoSaude) =>
   `${item.user.posto.short} ${item.user.nome_guerra}`;
const NOUN = { one: "militar", many: "militares" };

// Helper: parse comma-separated URL param into array
function parseCommaSeparated(value: string | null): string[] {
   if (!value) return [];
   return value.split(",").filter(Boolean);
}

export default function CartoesSaudePage() {
   const searchParams = useSearchParams();
   const router = useRouter();

   // --- Leitura dos filtros da URL ---
   const urlSearch = searchParams.get("search") ?? "";
   const filterPG = parseCommaSeparated(searchParams.get("pg"));
   const filterFunc = parseCommaSeparated(searchParams.get("func"));
   // Validados contra os valores conhecidos: `?status=xyz` na URL deixava a
   // tabela vazia enquanto o seletor continuava exibindo "Todos".
   // O padrao e "Tripulantes", e o padrao nao vai para a URL: "Todos" e que
   // precisa ser explicito (`?trip=todos`) — o `updateParams` apaga "all".
   // Qualquer outro valor cai no padrao.
   const tripParamRaw = searchParams.get("trip");
   const tripFilter: TripFilter =
      tripParamRaw === "todos"
         ? "all"
         : tripParamRaw === "naoTrip"
           ? "naoTrip"
           : "trip";

   // O recorte de validade só existe com os dois lados válidos: um status
   // sem documento (ou vice-versa) não descreve nada, então cai em "all".
   const statusParamRaw = searchParams.get("status") as DateStatus | null;
   const docParamRaw = searchParams.get("doc") as DocKey | null;
   const validadeFilter: ValidadeFilter =
      statusParamRaw &&
      docParamRaw &&
      SEVERIDADES.includes(statusParamRaw) &&
      DOCS.includes(docParamRaw)
         ? { tipo: "doc", doc: docParamRaw, status: statusParamRaw }
         : { tipo: "all" };

   // Ata anexada é outro eixo, então tem seu próprio parâmetro em vez de
   // disputar o `status` com o farol de validade.
   const semAta = searchParams.get("sem_ata") === "1";

   // --- Estado local apenas para o campo de busca (feedback imediato) ---
   const [searchUser, setSearchUser] = useState(urlSearch);
   const [sortField, setSortField] = useState<SortField | null>(null);
   const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
   const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
   const [showDrawer, setShowDrawer] = useState(false);

   const debouncedSearch = useDebouncedValue(searchUser, 500);

   // --- Helper para atualizar a URL ---
   const updateParams = useCallback(
      (updates: Record<string, string | undefined>, resetPage = true) => {
         const params = new URLSearchParams(searchParams.toString());

         for (const [key, value] of Object.entries(updates)) {
            if (value === undefined || value === "" || value === "all") {
               params.delete(key);
            } else {
               params.set(key, value);
            }
         }

         if (resetPage) params.delete("page");

         const qs = params.toString();
         router.replace(qs ? `?${qs}` : "?", { scroll: false });
      },
      [searchParams, router]
   );

   // --- Sincroniza debounce do search com a URL ---
   useEffect(() => {
      if (debouncedSearch !== urlSearch) {
         updateParams({ search: debouncedSearch || undefined });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [debouncedSearch]);

   // --- Sincroniza URL de volta ao input em navegação ---
   useEffect(() => {
      if (urlSearch !== searchUser && urlSearch !== debouncedSearch) {
         setSearchUser(urlSearch);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [urlSearch]);

   // Filtro de tripulante enviado ao backend
   const tripParam =
      tripFilter === "trip"
         ? true
         : tripFilter === "naoTrip"
           ? false
           : undefined;

   const {
      data: cartoesSaude = [],
      isLoading,
      isFetching,
      isError,
      error,
      refetch,
   } = useCartoesSaude({
      search: debouncedSearch || undefined,
      p_g: filterPG.length > 0 ? filterPG.join(",") : undefined,
      funcao: filterFunc.length > 0 ? filterFunc.join(",") : undefined,
      tripulante: tripParam,
   });

   // Filtros client-side: validade e ata são independentes e se acumulam.
   const filteredClientSide = useMemo(() => {
      return cartoesSaude.filter((item) => {
         if (semAta && item.cemal_tem_ata !== false) return false;
         if (validadeFilter.tipo === "doc") {
            // Status do documento clicado, não o pior do militar: é o mesmo
            // critério que gerou o número no contador.
            const { doc, status } = validadeFilter;
            const atual =
               doc === "cemal"
                  ? getCemalStatus(item)
                  : getDateStatus(item.cartao?.[doc]);
            if (atual !== status) return false;
         }
         return true;
      });
   }, [cartoesSaude, validadeFilter, semAta]);

   // Sort (null = antiguidade da API)
   const sortedData = useMemo(() => {
      if (!sortField) return filteredClientSide;

      const sorted = [...filteredClientSide];
      sorted.sort((a, b) => {
         let comparison = 0;
         switch (sortField) {
            case "militar":
               comparison = compareByAntiguidade(a.user, b.user);
               break;
            case "cemal":
            case "tovn":
            case "imae": {
               const dateA = a.cartao?.[sortField] || "";
               const dateB = b.cartao?.[sortField] || "";
               // Datas ausentes vão sempre para o fim, independente da
               // direção — não competem na ordenação cronológica.
               if (!dateA && !dateB) comparison = 0;
               else if (!dateA) return 1;
               else if (!dateB) return -1;
               else comparison = dateA.localeCompare(dateB);
               break;
            }
         }
         return sortDirection === "asc" ? comparison : -comparison;
      });
      return sorted;
   }, [filteredClientSide, sortField, sortDirection]);

   const handleSort = useCallback(
      (field: SortField) => {
         if (sortField === field) {
            if (sortDirection === "desc") {
               setSortField(null);
               setSortDirection("asc");
            } else {
               setSortDirection("desc");
            }
         } else {
            setSortField(field);
            setSortDirection("asc");
         }
      },
      [sortField, sortDirection]
   );

   const handleTripFilterChange = useCallback(
      (value: TripFilter) => {
         const trip =
            value === "all" ? "todos" : value === "naoTrip" ? value : undefined;
         updateParams(
            value === "naoTrip" ? { trip, func: undefined } : { trip }
         );
      },
      [updateParams]
   );

   const handlePGChange = useCallback(
      (values: string[]) => {
         updateParams({ pg: values.length > 0 ? values.join(",") : undefined });
      },
      [updateParams]
   );

   const handleFuncChange = useCallback(
      (values: string[]) => {
         updateParams({
            func: values.length > 0 ? values.join(",") : undefined,
         });
      },
      [updateParams]
   );

   const handleValidadeChange = useCallback(
      (value: ValidadeFilter) => {
         updateParams(
            value.tipo === "all"
               ? { status: undefined, doc: undefined }
               : { status: value.status, doc: value.doc }
         );
      },
      [updateParams]
   );

   const handleSemAtaChange = useCallback(
      (value: boolean) => {
         updateParams({ sem_ata: value ? "1" : undefined });
      },
      [updateParams]
   );

   const selectedItem = useMemo(
      () =>
         cartoesSaude.find((item) => item.user.id === selectedUserId) ?? null,
      [cartoesSaude, selectedUserId]
   );

   const handleRowClick = useCallback((item: UserCartaoSaude) => {
      setSelectedUserId(item.user.id);
      setShowDrawer(true);
   }, []);

   const handleCloseDrawer = () => {
      setShowDrawer(false);
      setSelectedUserId(null);
   };

   // Carrinho de exportacao. A planilha sai so do que a listagem ja traz —
   // sem hidratacao por `POST /users/export`, porque nenhuma coluna de PII e
   // oferecida aqui.
   const cart = useExportCart<UserCartaoSaude>(getUserId);
   const [showCartDrawer, setShowCartDrawer] = useState(false);
   const [showExportModal, setShowExportModal] = useState(false);

   // O carrinho guarda o retrato do clique; um cartao editado depois sairia
   // com a validade antiga. Na hora de exportar, cada item e trocado pela
   // linha atual da listagem — o retrato so fica para quem saiu dela (busca,
   // P/G, funcao e tripulante sao server-side).
   const exportRows = useMemo(() => {
      const atual = new Map(cartoesSaude.map((c) => [c.user.id, c]));
      return cart.items.map((item) => atual.get(item.user.id) ?? item);
   }, [cart.items, cartoesSaude]);

   // O que esta marcado e o filtro esconde: sem isso, o contador da barra
   // parece nao bater com a lista.
   const selectedOffView =
      cart.count - sortedData.filter((item) => cart.has(item.user.id)).length;

   const hasActiveFilters =
      !!urlSearch ||
      filterPG.length > 0 ||
      filterFunc.length > 0 ||
      tripFilter !== "trip" ||
      validadeFilter.tipo !== "all" ||
      semAta;

   const clearFilters = useCallback(() => {
      setSearchUser("");
      updateParams({
         search: undefined,
         pg: undefined,
         func: undefined,
         trip: undefined,
         status: undefined,
         doc: undefined,
         sem_ata: undefined,
      });
   }, [updateParams]);

   // Stats por campo (iteração única) sobre o que a API devolveu, antes dos
   // recortes client-side (validade e ata) — senão o número que gerou o
   // clique sumiria ao clicar. Busca, P/G, função e tripulante são params da
   // query, então esses o resumo acompanha.
   const { cemalStats, tovnStats, imaeStats } = useMemo(() => {
      const emptyCounts = (): Record<DateStatus, number> => ({
         valid: 0,
         warning: 0,
         critical: 0,
         expired: 0,
         empty: 0,
      });
      const cemal = emptyCounts();
      const tovn = emptyCounts();
      const imae = emptyCounts();

      for (const item of cartoesSaude) {
         const c = item.cartao;
         cemal[getCemalStatus(item)]++;
         tovn[getDateStatus(c?.tovn)]++;
         imae[getDateStatus(c?.imae)]++;
      }

      // `efetivo` é o denominador comum das barras: com bases diferentes elas
      // não seriam comparáveis entre si, que é a razão de ficarem alinhadas.
      const build = (counts: Record<DateStatus, number>): CartaoStats => ({
         counts,
         efetivo: cartoesSaude.length,
         total: cartoesSaude.length - counts.empty,
      });

      return {
         cemalStats: build(cemal),
         tovnStats: build(tovn),
         imaeStats: build(imae),
      };
   }, [cartoesSaude]);

   return (
      // `md:pb-24` reservado SEMPRE a partir de `md` (onde a tabela, e com ela
      // a selecao, aparece): condicional, marcar o primeiro militar
      // empurraria a pagina inteira para cima. Abaixo de `md` so com carrinho
      // cheio — selecao feita na tabela que sobrevive ao celular girar para
      // retrato; ali nao ha como marcar, entao nao ha salto.
      <div
         className={clsx(
            "flex flex-col space-y-2 md:pb-24",
            !cart.isEmpty && "pb-24"
         )}
      >
         {/* Masthead */}
         <header className="relative overflow-hidden rounded border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6 sm:py-5">
            <span
               aria-hidden
               className="bg-primary-600 absolute top-0 left-0 h-full w-1"
            />
            <div className="relative flex items-center justify-between gap-4">
               <div className="flex min-w-0 items-center gap-4">
                  <div className="bg-primary-50 text-primary-600 ring-primary-100 grid h-12 w-12 shrink-0 place-items-center rounded-md ring-1 ring-inset">
                     <MdHealthAndSafety className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                     <span className="text-primary-600 block font-mono text-[10px] font-bold tracking-[0.3em] uppercase">
                        Aeromédica
                     </span>
                     <h1 className="text-2xl leading-none font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                        Cartões de Saúde
                     </h1>
                  </div>
               </div>
            </div>
         </header>

         {/* Documentos de usuários inativos (gated por permissão de remoção) */}
         <PermBased resource="aeromedica.cartoes" requiredPerm="delete">
            <OrfaosAlert />
         </PermBased>

         {/* Resumo por documento — os contadores são o filtro de validade */}
         {isLoading ? (
            <SummaryBarSkeleton />
         ) : (
            cartoesSaude.length > 0 && (
               <div
                  className={clsx(
                     "transition-opacity",
                     isFetching && "opacity-50"
                  )}
               >
                  <SummaryBar
                     cemalStats={cemalStats}
                     imaeStats={imaeStats}
                     tovnStats={tovnStats}
                     validadeFilter={validadeFilter}
                     onValidadeFilterChange={handleValidadeChange}
                  />
               </div>
            )
         )}

         {/* Filtros + lista — sem `overflow-hidden`, para o card não recortar
             menu aberto de dentro dele. O canto arredondado da base fica por
             conta do wrapper da tabela. */}
         <div className="relative rounded border border-slate-200 bg-white shadow-sm">
            <Filters
               searchUser={searchUser}
               onSearchChange={setSearchUser}
               filterPG={filterPG}
               onFilterPGChange={handlePGChange}
               filterFunc={filterFunc}
               onFilterFuncChange={handleFuncChange}
               tripFilter={tripFilter}
               onTripFilterChange={handleTripFilterChange}
               semAta={semAta}
               onSemAtaChange={handleSemAtaChange}
               totalCount={cartoesSaude.length}
               filteredCount={sortedData.length}
               isLoading={isLoading}
               hasActiveFilters={hasActiveFilters}
               onClearFilters={clearFilters}
            />

            {isLoading ? (
               <>
                  <div className="md:hidden">
                     <CartoesSaudeCardListSkeleton />
                  </div>
                  <div className="hidden md:block">
                     <CartoesSaudeTableSkeleton />
                  </div>
               </>
            ) : isError && cartoesSaude.length === 0 ? (
               <div
                  role="alert"
                  className="flex flex-col items-center justify-center gap-1 px-6 py-12 text-center"
               >
                  <p className="text-sm font-semibold text-red-800">
                     Não foi possível carregar os cartões de saúde
                  </p>
                  <p className="max-w-md text-xs text-slate-500">
                     {error instanceof Error
                        ? error.message
                        : "Erro desconhecido"}
                  </p>
                  <Button
                     color="light"
                     size="sm"
                     className="mt-3"
                     onClick={() => refetch()}
                     disabled={isFetching}
                  >
                     Tentar novamente
                  </Button>
               </div>
            ) : (
               <>
                  {isError && (
                     <div
                        role="status"
                        className="flex flex-wrap items-center justify-between gap-2 border-t border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800"
                     >
                        <span>
                           Não foi possível atualizar os cartões de saúde.
                           Exibindo a última consulta.
                        </span>
                        <Button
                           color="light"
                           size="xs"
                           onClick={() => refetch()}
                           disabled={isFetching}
                        >
                           Tentar novamente
                        </Button>
                     </div>
                  )}
                  <div
                     className={clsx(
                        "transition-opacity",
                        isFetching && "pointer-events-none opacity-50"
                     )}
                  >
                     {/* Cards no dedo, tabela no mouse: em 390px as 7 colunas
                         só existiam atrás de rolagem lateral.
                         As duas árvores ficam montadas e só uma é exibida (o
                         `client` não tem hook de media query): com ~130 linhas o
                         custo extra de DOM é aceitável e evita o flash de
                         remontagem ao girar o aparelho. Se a lista crescer muito,
                         é aqui que entra virtualização. */}
                     <div className="md:hidden">
                        <CartoesSaudeCardList
                           data={sortedData}
                           onCardClick={handleRowClick}
                           hasActiveFilters={hasActiveFilters}
                           searchTerm={urlSearch}
                        />
                     </div>
                     {/* Regiao viva sempre montada: leitor de tela nao anuncia
                         `role="status"` que ja nasce com o texto. */}
                     <div role="status" className="hidden md:block">
                        {selectedOffView > 0 && (
                           <p className="px-4 py-2 text-xs text-slate-500">
                              {selectedOffView}{" "}
                              {selectedOffView === 1
                                 ? "selecionado fora do filtro atual"
                                 : "selecionados fora do filtro atual"}
                           </p>
                        )}
                     </div>
                     <div className="hidden md:block">
                        <CartoesSaudeTable
                           data={sortedData}
                           sortField={sortField}
                           sortDirection={sortDirection}
                           onSort={handleSort}
                           onRowClick={handleRowClick}
                           hasActiveFilters={hasActiveFilters}
                           searchTerm={urlSearch}
                           isSelected={cart.has}
                           onToggle={cart.toggle}
                           onSelectMany={cart.addMany}
                           onUnselectMany={cart.removeMany}
                        />
                     </div>
                  </div>
               </>
            )}
         </div>

         {/* `desktopOnly={false}`: a tabela (e a selecao) aparece ja em `md`,
             abaixo do `lg` padrao da barra. Nos cards nao ha checkbox; a barra
             so aparece abaixo de `md` se a selecao veio da tabela (aparelho
             girado), e por isso continua la para revisar ou exportar. */}
         <ExportCartBar
            cart={cart}
            getId={getUserId}
            getLabel={getCartLabel}
            onReview={() => setShowCartDrawer(true)}
            onExport={() => setShowExportModal(true)}
            noun={NOUN}
            desktopOnly={false}
            // Some tambem com o drawer de edicao aberto: por baixo do backdrop
            // ela ficaria escurecida e alcancavel pelo Tab.
            hidden={showCartDrawer || showExportModal || showDrawer}
         />

         <ExportCartDrawer
            show={showCartDrawer}
            onClose={() => setShowCartDrawer(false)}
            cart={cart}
            getId={getUserId}
            getLabel={(item) => ({
               primary: getCartLabel(item),
               secondary: item.user.nome_completo ?? undefined,
            })}
            onExport={() => {
               setShowCartDrawer(false);
               setShowExportModal(true);
            }}
            title="Militares selecionados"
            noun={NOUN}
         />

         <ExportColumnsModal
            show={showExportModal}
            onClose={() => setShowExportModal(false)}
            rows={exportRows}
            columns={CARTOES_SAUDE_EXPORT_COLUMNS}
            storageKey="export:cartoes-saude:columns"
            fileBaseName="cartoes_saude"
            sheetName="Cartões de Saúde"
         />

         {/* Edit Drawer */}
         {showDrawer && selectedItem && (
            <EditCartaoDrawer
               show={showDrawer}
               onClose={handleCloseDrawer}
               item={selectedItem}
            />
         )}
      </div>
   );
}
