"use client";

import { useMemo, useState } from "react";
import { Button } from "flowbite-react";
import { useSoldos } from "@/hooks/queries";
import { SoldoPublic } from "services/routes/admin/soldos";
import { SoldoFormData } from "./schemas/soldoSchema";
import { resolveMid, sortSoldosByAnt } from "./helpers/soldoHelpers";
import { useSoldosFilters } from "./hooks/useSoldosFilters";
import { useSoldoMutations } from "./hooks/useSoldoMutations";
import SoldosMasthead from "./components/SoldosMasthead";
import SoldosFilters from "./components/SoldosFilters";
import SoldoTable from "./components/SoldoTable";
import SoldoTableSkeleton from "./components/SoldoTableSkeleton";
import SoldoFormModal from "./components/SoldoFormModal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

export default function SoldosPage() {
   const { circulo, setCirculo, onlyActive, setOnlyActive, queryParams } =
      useSoldosFilters();
   const [showModal, setShowModal] = useState(false);
   const [editingSoldo, setEditingSoldo] = useState<SoldoPublic | null>(null);
   const [soldoParaExcluir, setSoldoParaExcluir] = useState<SoldoPublic | null>(
      null
   );

   const {
      data: soldosData,
      isLoading,
      isFetching,
      error,
      refetch,
   } = useSoldos(queryParams);
   const soldos = useMemo(() => soldosData ?? [], [soldosData]);
   const { save, remove, isSaving, isDeleting } = useSoldoMutations();

   const sortedSoldos = useMemo(() => sortSoldosByAnt(soldos), [soldos]);

   const handleOpenModal = (soldo: SoldoPublic | null = null) => {
      setEditingSoldo(soldo);
      setShowModal(true);
   };

   const handleCloseModal = () => {
      setShowModal(false);
      setEditingSoldo(null);
   };

   // Deixa a falha subir: o modal devolve o 422 aos campos e só fecha no
   // caminho feliz.
   const handleSubmit = async (formData: SoldoFormData): Promise<void> => {
      await save(formData, editingSoldo);
      handleCloseModal();
   };

   const handleConfirmDelete = async () => {
      if (!soldoParaExcluir) return;
      const ok = await remove(soldoParaExcluir);
      if (ok) setSoldoParaExcluir(null);
   };

   const errorMessage = error instanceof Error ? error.message : null;
   // Falha sem dado em tela: "Nenhum soldo encontrado" seria mentira
   const semDado = Boolean(error) && !soldosData;
   const hasFilters = Boolean(circulo) || onlyActive;

   return (
      <div className="space-y-2">
         <SoldosMasthead onCreate={() => handleOpenModal()} />

         {/* Refetch que falhou com a tabela em tela: mantém e avisa */}
         {error && soldosData && (
            <p
               role="status"
               className="flex items-center gap-2 rounded border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500"
            >
               <span className="min-w-0 flex-1 truncate">
                  {errorMessage ?? "Não foi possível atualizar os soldos"}
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

         <SoldosFilters
            circulo={circulo}
            onCirculoChange={setCirculo}
            onlyActive={onlyActive}
            onOnlyActiveChange={setOnlyActive}
            disabled={isLoading}
         />

         {!isLoading && !semDado && (
            <p className="text-xs font-medium text-slate-400">
               {sortedSoldos.length}{" "}
               {sortedSoldos.length === 1
                  ? "registro encontrado"
                  : "registros encontrados"}
            </p>
         )}

         {semDado ? (
            <div
               role="alert"
               className="space-y-3 rounded border border-red-300 bg-red-50 p-4"
            >
               <p className="text-sm text-red-800">
                  {errorMessage ??
                     "Erro ao carregar os soldos. Por favor, tente novamente."}
               </p>
               <Button
                  color="light"
                  size="xs"
                  onClick={() => refetch()}
                  disabled={isFetching}
               >
                  Tentar novamente
               </Button>
            </div>
         ) : (
            <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
               {isLoading ? (
                  <SoldoTableSkeleton />
               ) : sortedSoldos.length === 0 ? (
                  <div className="px-4 py-16 text-center">
                     <p className="text-sm font-semibold text-slate-600">
                        Nenhum soldo encontrado
                     </p>
                     <p className="mt-1 text-xs text-slate-400">
                        {hasFilters
                           ? "Não há registros para os filtros selecionados."
                           : "Comece adicionando o primeiro registro de soldo."}
                     </p>
                  </div>
               ) : (
                  <div
                     className={`transition-opacity ${
                        isFetching ? "pointer-events-none opacity-50" : ""
                     }`}
                  >
                     <SoldoTable
                        soldos={sortedSoldos}
                        onEdit={handleOpenModal}
                        onDelete={setSoldoParaExcluir}
                     />
                  </div>
               )}
            </div>
         )}

         <ConfirmModal
            show={soldoParaExcluir !== null}
            title="Excluir soldo"
            description={
               soldoParaExcluir
                  ? `O soldo de ${resolveMid(soldoParaExcluir)} será removido. As missões do período têm o custo recalculado.`
                  : undefined
            }
            confirmButtonText="Sim, excluir"
            isLoading={isDeleting}
            onClose={() => setSoldoParaExcluir(null)}
            onConfirm={handleConfirmDelete}
         />

         <SoldoFormModal
            show={showModal}
            editingSoldo={editingSoldo}
            submitting={isSaving}
            onClose={handleCloseModal}
            onSubmit={handleSubmit}
         />
      </div>
   );
}
