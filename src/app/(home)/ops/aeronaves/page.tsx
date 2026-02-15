"use client";

import { useState } from "react";
import { Button, Spinner } from "flowbite-react";
import { HiPlus } from "react-icons/hi";
import { MdFlightTakeoff } from "react-icons/md";
import { useAeronaves } from "@/hooks/queries/useAeronaves";
import { AeronaveTable } from "./components/AeronaveTable";
import { AeronaveCard } from "./components/AeronaveCard";
import { AeronaveFormModal } from "./components/AeronaveFormModal";
import { SituacaoSummary } from "./components/SituacaoSummary";
import type { AeronavePublic } from "services/routes/aeronaves";

export default function AeronavesPage() {
   const [showFormModal, setShowFormModal] = useState(false);
   const [editingAeronave, setEditingAeronave] =
      useState<AeronavePublic | null>(null);
   const {
      data,
      isLoading: loading,
      isFetching,
   } = useAeronaves({ per_page: 100 });

   const aeronaves = data?.items ?? [];

   const handleEdit = (aeronave: AeronavePublic) => {
      setEditingAeronave(aeronave);
      setShowFormModal(true);
   };

   const handleOpenCreate = () => {
      setEditingAeronave(null);
      setShowFormModal(true);
   };

   const handleCloseFormModal = () => {
      setShowFormModal(false);
      setEditingAeronave(null);
   };

   return (
      <div className="h-full w-full overflow-auto p-1">
         {/* Header */}
         <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="rounded-lg bg-red-100 p-2">
                  <MdFlightTakeoff className="h-6 w-6 text-red-600" />
               </div>
               <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                     Aeronaves
                  </h1>
                  <p className="text-sm text-gray-500">
                     Gerenciamento da frota
                  </p>
               </div>
            </div>
            <Button
               color="red"
               onClick={handleOpenCreate}
               className="whitespace-nowrap"
            >
               <HiPlus className="mr-2 h-4 w-4" />
               Nova Aeronave
            </Button>
         </div>

         {/* Summary Cards */}
         {!loading && aeronaves.length > 0 && (
            <SituacaoSummary aeronaves={aeronaves} />
         )}

         {/* Content */}
         {loading ? (
            <div className="flex h-64 items-center justify-center rounded-lg bg-white shadow-md">
               <div className="flex flex-col items-center gap-3">
                  <Spinner size="lg" color="failure" />
                  <p className="text-sm text-gray-600">
                     Carregando aeronaves...
                  </p>
               </div>
            </div>
         ) : aeronaves.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-lg bg-white shadow-md">
               <div className="mb-4 rounded-full bg-gray-100 p-4">
                  <MdFlightTakeoff className="h-12 w-12 text-gray-400" />
               </div>
               <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Nenhuma aeronave cadastrada
               </h3>
               <p className="mb-4 text-sm text-gray-500">
                  Cadastre a primeira aeronave para começar
               </p>
               <Button color="red" onClick={handleOpenCreate} size="sm">
                  <HiPlus className="mr-2 h-4 w-4" />
                  Cadastrar Aeronave
               </Button>
            </div>
         ) : (
            <div
               className={`relative ${isFetching ? "opacity-60" : "opacity-100"} transition-opacity duration-200`}
            >
               {/* Desktop Table */}
               <AeronaveTable aeronaves={aeronaves} onEdit={handleEdit} />

               {/* Mobile Cards */}
               <div className="space-y-3 md:hidden">
                  {aeronaves.map((aeronave) => (
                     <AeronaveCard
                        key={aeronave.matricula}
                        aeronave={aeronave}
                        onEdit={handleEdit}
                     />
                  ))}
               </div>
            </div>
         )}

         {/* Modals */}
         <AeronaveFormModal
            show={showFormModal}
            onClose={handleCloseFormModal}
            editingAeronave={editingAeronave}
         />
      </div>
   );
}
