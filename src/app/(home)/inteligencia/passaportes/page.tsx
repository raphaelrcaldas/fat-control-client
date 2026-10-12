"use client";

import { useCallback, useMemo, useState } from "react";
import { FaPassport } from "react-icons/fa";
import clsx from "clsx";
import { Button } from "flowbite-react";
import { usePassaportes, usePassaportesOrfaos } from "@/hooks/queries";
import type { TripPassaporteOut } from "services/routes/inteligencia/passaportes";
import { usePassaportesFilters } from "./hooks/usePassaportesFilters";
import { usePassaportesView } from "./hooks/usePassaportesView";
import SummaryBar from "./components/SummaryBar";
import SummaryBarSkeleton from "./components/SummaryBarSkeleton";
import Filters from "./components/Filters";
import PassaportesTable from "./components/PassaportesTable";
import PassaportesTableSkeleton from "./components/PassaportesTableSkeleton";
import PassaportesCardList from "./components/PassaportesCardList";
import PassaportesCardListSkeleton from "./components/PassaportesCardListSkeleton";
import EditPassaporteModal from "./components/EditPassaporteModal";
import OrfaosAlert from "./components/OrfaosAlert";
import { PermBased, usePermBased } from "@/app/(home)/hooks/usePermBased";
import { useExportCart } from "@/components/export/useExportCart";
import { ExportCartBar } from "@/components/export/ExportCartBar";
import { ExportCartDrawer } from "@/components/export/ExportCartDrawer";
import { ExportColumnsModal } from "@/components/export/ExportColumnsModal";
import { PASSAPORTES_EXPORT_COLUMNS } from "./exportColumns";

// Fora do componente: identidade estavel, para o `toggle` do carrinho nao
// mudar a cada render e derrubar o `memo` das linhas.
const getTripId = (item: TripPassaporteOut) => item.trip_id;
const getCartLabel = (item: TripPassaporteOut) =>
   `${item.p_g} ${item.nome_guerra}`;
const NOUN = { one: "militar", many: "militares" };

export default function PassaportesPage() {
   const filters = usePassaportesFilters();

   const {
      data: passaportesData = [],
      isLoading,
      isFetching,
      isError,
      error,
      refetch,
   } = usePassaportes(filters.queryParams);

   const { sortedData, passaporteStats, visaStats } = usePassaportesView(
      passaportesData,
      filters
   );

   // Snapshot estável do item ao abrir — desacopla o modal de passaportesData,
   // evitando que um refetch em background desmonte o modal ou resete o form.
   const [selectedItem, setSelectedItem] = useState<TripPassaporteOut | null>(
      null
   );
   const [showModal, setShowModal] = useState(false);

   const handleRowClick = useCallback((item: TripPassaporteOut) => {
      setSelectedItem(item);
      setShowModal(true);
   }, []);

   const handleCloseModal = useCallback(() => {
      setShowModal(false);
      setSelectedItem(null);
   }, []);

   // Carrinho de exportacao. A planilha sai so do que a listagem ja traz —
   // sem hidratacao por `POST /users/export`, porque nenhuma coluna de PII e
   // oferecida aqui.
   const cart = useExportCart<TripPassaporteOut>(getTripId);
   const [showCartDrawer, setShowCartDrawer] = useState(false);
   const [showExportModal, setShowExportModal] = useState(false);

   // O carrinho guarda o retrato do clique; um passaporte editado depois
   // sairia com a validade antiga. Na hora de exportar, cada item e trocado
   // pela linha atual da listagem — o retrato so fica para quem saiu dela
   // (filtro de P/G ou funcao, que e server-side).
   const exportRows = useMemo(() => {
      const atual = new Map(passaportesData.map((p) => [p.trip_id, p]));
      return cart.items.map((item) => atual.get(item.trip_id) ?? item);
   }, [cart.items, passaportesData]);

   // O que esta marcado e o filtro esconde: sem isso, o contador da barra
   // parece nao bater com a lista.
   const selectedOffView =
      cart.count - sortedData.filter((item) => cart.has(item.trip_id)).length;

   // O alerta de órfãos entra em cima da página; se ele resolver depois dos
   // passaportes, a inserção empurra o resumo + lista já pintados (CLS > 0.1 no
   // mobile). Por isso o boot espera as duas queries e troca skeleton →
   // conteúdo num único commit. Só o alerta, o resumo e a lista esperam: os
   // Filters ficam sempre montados no mesmo ponto da árvore (como em
   // cartoes-saude e crm), com a barra de contagem em skeleton durante o boot.
   const { hasPerm } = usePermBased();
   const canCleanOrfaos = hasPerm("inteligencia.passaportes", "delete");
   const orfaosQuery = usePassaportesOrfaos(canCleanOrfaos);
   const booting = isLoading || (canCleanOrfaos && orfaosQuery.isLoading);

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
                     <FaPassport className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                     <span className="text-primary-600 block font-mono text-[10px] font-bold tracking-[0.3em] uppercase">
                        Inteligência
                     </span>
                     <h1 className="text-2xl leading-none font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                        Passaportes
                     </h1>
                  </div>
               </div>
            </div>
         </header>

         {booting ? (
            <SummaryBarSkeleton />
         ) : (
            <>
               {/* Limpeza de registros de militares inativos (só quem pode remover) */}
               <PermBased
                  resource="inteligencia.passaportes"
                  requiredPerm="delete"
               >
                  <OrfaosAlert />
               </PermBased>

               {/* Resumo por documento — também é o filtro de status */}
               {passaportesData.length > 0 && (
                  <div
                     className={clsx(
                        "transition-opacity",
                        isFetching && "opacity-50"
                     )}
                  >
                     <SummaryBar
                        passaporteStats={passaporteStats}
                        visaStats={visaStats}
                        validadeFilter={filters.validadeFilter}
                        onValidadeFilterChange={filters.setValidadeFilter}
                     />
                  </div>
               )}
            </>
         )}

         {/* Filtros + lista (cards no mobile, tabela no desktop) */}
         <div className="relative overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
            <Filters
               search={filters.search}
               onSearchChange={filters.setSearch}
               filterPG={filters.filterPG}
               onFilterPGChange={filters.setFilterPG}
               filterFunc={filters.filterFunc}
               onFilterFuncChange={filters.setFilterFunc}
               statusFilter={filters.statusFilter}
               onStatusFilterChange={filters.setStatusFilter}
               totalCount={passaportesData.length}
               filteredCount={sortedData.length}
               isLoading={booting}
               hasActiveFilters={filters.hasActiveFilters}
               onClearFilters={filters.clearFilters}
            />

            {booting ? (
               <>
                  <div className="md:hidden">
                     <PassaportesCardListSkeleton />
                  </div>
                  <div className="hidden md:block">
                     <PassaportesTableSkeleton />
                  </div>
               </>
            ) : isError && passaportesData.length === 0 ? (
               <div
                  role="alert"
                  className="flex flex-col items-center justify-center gap-1 px-6 py-12 text-center"
               >
                  <p className="text-sm font-semibold text-red-800">
                     Não foi possível carregar os passaportes
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
                           Não foi possível atualizar os passaportes. Exibindo a
                           última consulta.
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
                     <div className="md:hidden">
                        <PassaportesCardList
                           data={sortedData}
                           onCardClick={handleRowClick}
                           hasActiveFilters={filters.hasActiveFilters}
                           onClearFilters={filters.clearFilters}
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
                        <PassaportesTable
                           data={sortedData}
                           sortField={filters.sortField}
                           sortDirection={filters.sortDirection}
                           onSort={filters.handleSort}
                           onRowClick={handleRowClick}
                           hasActiveFilters={filters.hasActiveFilters}
                           onClearFilters={filters.clearFilters}
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
            getId={getTripId}
            getLabel={getCartLabel}
            onReview={() => setShowCartDrawer(true)}
            onExport={() => setShowExportModal(true)}
            noun={NOUN}
            desktopOnly={false}
            // Some tambem com o modal de edicao aberto: por baixo do backdrop
            // ela ficaria escurecida e alcancavel pelo Tab.
            hidden={showCartDrawer || showExportModal || showModal}
         />

         <ExportCartDrawer
            show={showCartDrawer}
            onClose={() => setShowCartDrawer(false)}
            cart={cart}
            getId={getTripId}
            getLabel={(item) => ({
               primary: getCartLabel(item),
               secondary: item.nome_completo ?? undefined,
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
            columns={PASSAPORTES_EXPORT_COLUMNS}
            storageKey="export:passaportes:columns"
            fileBaseName="passaportes"
            sheetName="Passaportes"
         />

         {/* Edit Modal */}
         {showModal && selectedItem && (
            <EditPassaporteModal
               show={showModal}
               onClose={handleCloseModal}
               item={selectedItem}
            />
         )}
      </div>
   );
}
