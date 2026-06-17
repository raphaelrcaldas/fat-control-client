"use client";

import { useMemo, useState } from "react";
import { Alert } from "flowbite-react";
import { HiExclamation } from "react-icons/hi";
import { useSoldos } from "@/hooks/queries";
import { SoldoPublic } from "services/routes/cegep/soldos";
import { SoldoFormData } from "./schemas/soldoSchema";
import { sortSoldosByAnt } from "./helpers/soldoHelpers";
import { useSoldosFilters } from "./hooks/useSoldosFilters";
import { useSoldoMutations } from "./hooks/useSoldoMutations";
import SoldosMasthead from "./components/SoldosMasthead";
import SoldosFilters from "./components/SoldosFilters";
import SoldoTable from "./components/SoldoTable";
import SoldoTableSkeleton from "./components/SoldoTableSkeleton";
import SoldoFormModal from "./components/SoldoFormModal";

export default function SoldosPage() {
   const { circulo, setCirculo, onlyActive, setOnlyActive, queryParams } =
      useSoldosFilters();
   const [showModal, setShowModal] = useState(false);
   const [editingSoldo, setEditingSoldo] = useState<SoldoPublic | null>(null);

   const {
      data: soldos = [],
      isLoading,
      isFetching,
      error,
   } = useSoldos(queryParams);
   const { save, remove, isSaving } = useSoldoMutations();

   const sortedSoldos = useMemo(() => sortSoldosByAnt(soldos), [soldos]);

   const handleOpenModal = (soldo: SoldoPublic | null = null) => {
      setEditingSoldo(soldo);
      setShowModal(true);
   };

   const handleCloseModal = () => {
      setShowModal(false);
      setEditingSoldo(null);
   };

   const handleSubmit = async (formData: SoldoFormData): Promise<boolean> => {
      const ok = await save(formData, editingSoldo);
      if (ok) handleCloseModal();
      return ok;
   };

   const errorMessage = error instanceof Error ? error.message : null;
   const hasFilters = Boolean(circulo) || onlyActive;

   return (
      <div className="space-y-4">
         <SoldosMasthead onCreate={() => handleOpenModal()} />

         {errorMessage && (
            <Alert color="failure" icon={HiExclamation}>
               <span className="font-medium">Erro!</span> {errorMessage}
            </Alert>
         )}

         <SoldosFilters
            circulo={circulo}
            onCirculoChange={setCirculo}
            onlyActive={onlyActive}
            onOnlyActiveChange={setOnlyActive}
            disabled={isLoading}
         />

         {!isLoading && (
            <p className="text-xs font-medium text-slate-400">
               {sortedSoldos.length}{" "}
               {sortedSoldos.length === 1
                  ? "registro encontrado"
                  : "registros encontrados"}
            </p>
         )}

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
                     onDelete={remove}
                  />
               </div>
            )}
         </div>

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
