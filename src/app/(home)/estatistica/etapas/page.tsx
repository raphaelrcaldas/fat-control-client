"use client";

import { Button, Badge } from "flowbite-react";
import { MdBarChart } from "react-icons/md";
import { HiFilter, HiPlus } from "react-icons/hi";
import { CiPaperplane } from "react-icons/ci";
import Link from "next/link";
import { useState, useMemo } from "react";
import { EtapasTable } from "./components/EtapasTable/EtapasTable";
import { EtapasTableSkeleton } from "./components/EtapasTable/EtapasTableSkeleton";
import { EtapasFilterPanel } from "./components/EtapasFilterPanel";
import { ActiveFilterTags } from "./components/ActiveFilterTags";
import { EtapasPendentesAlert } from "./components/EtapasPendentesAlert";
import { ExportColumnsModal } from "@/components/export/ExportColumnsModal";
import { EtapasSelectionBar } from "./components/EtapasSelectionBar";
import { ResultadosInfo } from "./components/ResultadosInfo";
import { useEtapasFilters } from "./hooks/useEtapasFilters";
import { useEtapaSelection } from "./hooks/useEtapaSelection";
import { etapasExportColumns, sortEtapasForExport } from "./exportColumns";
import clsx from "clsx";
import { PermBased } from "../../hooks/usePermBased";

export default function EtapasPage() {
   const [showFilters, setShowFilters] = useState(false);
   const [showExportModal, setShowExportModal] = useState(false);

   const filters = useEtapasFilters();
   const {
      cart,
      selectedIds,
      visibleSelectedCount,
      allSelected,
      toggleEtapa,
      toggleMissao,
      toggleAll,
   } = useEtapaSelection(filters.missoes);

   const etapasParaExportar = useMemo(
      () => sortEtapasForExport(cart.items),
      [cart.items]
   );

   // Erro só entra sem dado em tela: com dado anterior (keepPreviousData) a
   // lista continua e o aviso vira uma faixa acima dela — ver mais abaixo.
   const errorSemDados = filters.isError && filters.missoes.length === 0;
   const errorMessage =
      filters.error instanceof Error
         ? filters.error.message
         : "Erro desconhecido";

   return (
      // Reserva estavel para a barra: selecionar a primeira etapa nao deve
      // reduzir de repente a area util da listagem.
      <div className="flex flex-1 flex-col space-y-2 overflow-hidden pb-24">
         <div className="relative shrink-0 overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
            {/* Espinha vermelha — ecoa a espinha das linhas */}
            <span
               aria-hidden
               className="bg-primary-600 absolute top-0 left-0 h-full w-1"
            />

            {/* Só a linha de identidade/ações é o <header> canônico: o painel
                de filtros abre dentro do MESMO card, abaixo dela — por isso a
                moldura (borda/sombra/espinha) sobe para o card externo e só o
                padding fica na linha. */}
            <header className="relative flex flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-6 sm:py-5">
               <div className="flex min-w-0 items-center gap-4">
                  <div className="bg-primary-50 text-primary-600 ring-primary-100 grid h-12 w-12 shrink-0 place-items-center rounded-md ring-1 ring-inset">
                     <CiPaperplane className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                     <span className="text-primary-600 block font-mono text-[10px] font-bold tracking-[0.3em] uppercase">
                        Estatística
                     </span>
                     <h1 className="text-2xl leading-none font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                        Etapas
                     </h1>
                  </div>
               </div>
               <div className="flex items-center gap-2">
                  <PermBased
                     resource="estatistica.etapas"
                     requiredPerm="create"
                  >
                     {/* No mobile fica só o ícone, para a linha do masthead
                         caber sem quebrar. O rótulo continua no DOM sob
                         `sr-only`, e não removido: sem ele o botão perde o
                         nome acessível e o leitor de tela anuncia só "botão".
                         A margem do ícone acompanha — `mr-2` com o texto
                         escondido deixaria o glifo fora do eixo. */}
                     <Button
                        as={Link}
                        href="/estatistica/etapas/missao/nova"
                        color="primary"
                        size="sm"
                     >
                        <HiPlus className="h-4 w-4 sm:mr-2" />
                        <span className="sr-only sm:not-sr-only">Missão</span>
                     </Button>
                  </PermBased>
                  <Button
                     color="light"
                     size="sm"
                     onClick={() => setShowFilters((v) => !v)}
                     aria-expanded={showFilters}
                     aria-controls="filtros-panel"
                  >
                     <HiFilter className="h-4 w-4 sm:mr-2" />
                     <span className="sr-only sm:not-sr-only">Filtros</span>
                     {/* A contagem fica visível também no mobile: ela é o
                         único sinal de que há filtro ativo quando o painel
                         está fechado. */}
                     {filters.hasActiveFilters && (
                        <Badge color="primary" size="sm" className="ml-2">
                           {filters.activeFilterCount}
                        </Badge>
                     )}
                  </Button>
               </div>
            </header>

            <div className={clsx(showFilters ? "block" : "hidden")}>
               <EtapasFilterPanel
                  urlDataIni={filters.urlDataIni}
                  urlDataFim={filters.urlDataFim}
                  urlAnv={filters.urlAnv}
                  urlTipoMissao={filters.urlTipoMissao}
                  urlEsfAerId={filters.urlEsfAerId}
                  filterOrigem={filters.filterOrigem}
                  setFilterOrigem={filters.setFilterOrigem}
                  filterDestino={filters.filterDestino}
                  setFilterDestino={filters.setFilterDestino}
                  filterTrip={filters.filterTrip}
                  setFilterTrip={filters.setFilterTrip}
                  filterFuncao={filters.filterFuncao}
                  onFuncaoChange={filters.handleFuncaoChange}
                  onEsfAerChange={filters.handleEsfAerChange}
                  esfAerOptions={filters.esfAerOptions}
                  aeronaveOptions={filters.aeronaveOptions}
                  tipoMissaoOptions={filters.tipoMissaoOptions}
                  onDataIniChange={filters.handleDataIniChange}
                  onDataFimChange={filters.handleDataFimChange}
                  onMultiSelectChange={filters.handleMultiSelectChange}
               />
            </div>
         </div>

         {/* Só quem edita etapa pode resolver a pendência — para os demais o
             aviso seria ruído sem ação possível. O PermBased também é o que
             impede a busca de disparar (o componente nem monta). */}
         <PermBased resource="estatistica.etapas" requiredPerm="update">
            <EtapasPendentesAlert
               dataIni={filters.urlDataIni}
               dataFim={filters.urlDataFim}
            />
         </PermBased>

         <ActiveFilterTags
            hasActiveFilters={filters.hasActiveFilters}
            dataIniActive={filters.dataIniActive}
            dataFimActive={filters.dataFimActive}
            urlDataIni={filters.urlDataIni}
            urlDataFim={filters.urlDataFim}
            urlAnv={filters.urlAnv}
            urlOrigem={filters.urlOrigem}
            urlDestino={filters.urlDestino}
            urlTrip={filters.urlTrip}
            urlFuncao={filters.urlFuncao}
            urlEsfAerId={filters.urlEsfAerId}
            urlTipoMissao={filters.urlTipoMissao}
            esfAerOptions={filters.esfAerOptions}
            onRemoveDataIni={filters.resetDataIni}
            onRemoveDataFim={filters.resetDataFim}
            onRemoveAnv={() => filters.handleMultiSelectChange("anv", [])}
            onRemoveOrigem={() => {
               filters.setFilterOrigem("");
               filters.updateParams({ origem: undefined });
            }}
            onRemoveDestino={() => {
               filters.setFilterDestino("");
               filters.updateParams({ destino: undefined });
            }}
            onRemoveTrip={() => {
               filters.setFilterTrip("");
               filters.updateParams({ trip_search: undefined });
            }}
            onRemoveFuncao={() => filters.handleFuncaoChange("")}
            onRemoveEsfAer={() => filters.handleEsfAerChange("")}
            onRemoveTipoMissao={() =>
               filters.handleMultiSelectChange("tipo_missao_cod", [])
            }
            onClearAll={filters.clearFilters}
         />

         {/* Região viva PERSISTENTE (sempre montada, nunca condicional): NVDA/
             JAWS só garantem o anúncio se a região já existir no DOM antes do
             texto mudar — inserir a região já com conteúdo (ex.: dentro do
             ramo `periodoInvalido`) não é lido de forma confiável. */}
         <p role="status" className="sr-only">
            {filters.periodoInvalido
               ? "A data inicial é posterior à data final."
               : ""}
         </p>

         <div className="relative flex-1 overflow-auto">
            {filters.periodoInvalido ? (
               // Não é "nenhuma etapa encontrada": é entrada inválida (mesmo
               // 422 que o backend devolveria) — a query nem chega a disparar.
               // Sem role="status" aqui: o anúncio já é feito pela região viva
               // persistente acima — duplicar o role anunciaria duas vezes.
               <div className="flex h-64 flex-col items-center justify-center rounded border border-gray-200 bg-white">
                  <p className="mb-2 text-sm font-semibold text-gray-900">
                     A data inicial é posterior à data final.
                  </p>
                  <button
                     type="button"
                     onClick={filters.clearFilters}
                     className="text-primary-600 hover:text-primary-700 text-sm"
                  >
                     Limpar filtros
                  </button>
               </div>
            ) : filters.loading ||
              (filters.isRefetching && filters.missoes.length === 0) ? (
               <EtapasTableSkeleton />
            ) : errorSemDados ? (
               // Erro e vazio são estados diferentes: mostrar "nenhuma etapa"
               // quando a consulta falhou faz concluir, por engano, que não
               // há etapa — quando na verdade não se sabe.
               <div
                  role="alert"
                  className="flex h-64 flex-col items-center justify-center gap-1 rounded border border-gray-200 bg-white px-6 text-center"
               >
                  <p className="text-sm font-semibold text-red-800">
                     Não foi possível carregar as etapas
                  </p>
                  <p className="max-w-md text-xs text-slate-500">
                     {errorMessage}
                  </p>
                  <Button
                     color="light"
                     size="sm"
                     className="mt-3"
                     onClick={() => filters.refetch()}
                  >
                     Tentar novamente
                  </Button>
               </div>
            ) : filters.missoes.length === 0 ? (
               <div className="flex h-64 flex-col items-center justify-center rounded border border-gray-200 bg-white">
                  <div className="mb-4 rounded-full bg-gray-100 p-4">
                     <MdBarChart className="h-12 w-12 text-gray-400" />
                  </div>
                  <p className="mb-2 text-lg font-semibold text-gray-900">
                     {filters.hasActiveFilters
                        ? "Nenhuma etapa encontrada"
                        : "Nenhuma etapa disponível"}
                  </p>
                  <p className="max-w-md text-center text-sm text-gray-500">
                     {filters.hasActiveFilters
                        ? "Não foram encontrados resultados com os filtros aplicados."
                        : "Utilize os filtros para visualizar as etapas."}
                  </p>
                  {filters.hasActiveFilters && (
                     <button
                        type="button"
                        onClick={filters.clearFilters}
                        className="text-primary-600 hover:text-primary-700 mt-3 text-sm"
                     >
                        Limpar filtros
                     </button>
                  )}
               </div>
            ) : (
               <div className="space-y-2">
                  {filters.isError && (
                     // Refetch falhou mas há dado anterior em tela
                     // (keepPreviousData): mantém a lista e só avisa.
                     <div
                        role="alert"
                        className="flex flex-wrap items-center justify-between gap-2 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800"
                     >
                        <span>Não foi possível atualizar as etapas.</span>
                        <Button
                           color="light"
                           size="sm"
                           disabled={filters.isRefetching}
                           onClick={() => filters.refetch()}
                        >
                           Tentar novamente
                        </Button>
                     </div>
                  )}

                  <div
                     className={clsx(
                        "transition-opacity duration-200",
                        filters.isRefetching && "pointer-events-none opacity-50"
                     )}
                  >
                     <EtapasTable
                        missoes={filters.missoes}
                        selectedIds={selectedIds}
                        onToggleEtapa={toggleEtapa}
                        onToggleMissao={toggleMissao}
                        onToggleAll={toggleAll}
                        allSelected={allSelected}
                     />
                  </div>

                  <div
                     className={clsx(
                        "rounded border border-gray-200 bg-white px-4 py-3",
                        "transition-opacity duration-200",
                        filters.isRefetching && "pointer-events-none opacity-50"
                     )}
                  >
                     <ResultadosInfo
                        totalMissoes={filters.totalMissoes}
                        totalEtapas={filters.totalEtapas}
                     />
                  </div>
               </div>
            )}
         </div>

         <EtapasSelectionBar
            cart={cart}
            visibleSelectedCount={visibleSelectedCount}
            onExport={() => setShowExportModal(true)}
            hidden={showExportModal}
         />

         <ExportColumnsModal
            show={showExportModal}
            onClose={() => setShowExportModal(false)}
            rows={etapasParaExportar}
            columns={etapasExportColumns}
            storageKey="export:estatistica-etapas:columns"
            fileBaseName="etapas"
            sheetName="Etapas"
         />
      </div>
   );
}
