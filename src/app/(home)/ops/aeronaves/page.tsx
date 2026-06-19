"use client";

import { useState } from "react";
import { Button } from "flowbite-react";
import { HiPlus } from "react-icons/hi";
import { MdFlightTakeoff } from "react-icons/md";
import clsx from "clsx";
import { useAeronaves } from "@/hooks/queries/useAeronaves";
import { AeronaveTable } from "./components/AeronaveTable";
import { AeronaveCard } from "./components/AeronaveCard";
import { AeronaveFormModal } from "./components/AeronaveFormModal";
import { SituacaoSummary } from "./components/SituacaoSummary";
import { AeronaveListSkeleton } from "./components/AeronaveListSkeleton";
import type { AeronavePublic } from "services/routes/aeronaves";
import { PermBased } from "../../hooks/usePermBased";

export default function AeronavesPage() {
   const [showFormModal, setShowFormModal] = useState(false);
   const [editingAeronave, setEditingAeronave] =
      useState<AeronavePublic | null>(null);
   const { data, isLoading, isFetching } = useAeronaves({ per_page: 100 });

   const aeronaves = data?.items ?? [];
   const showSkeleton = isLoading || (isFetching && !data);

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
      <div className="space-y-2">
         {/* Masthead — referência canônica (ops/operacoes) */}
         <header className="relative overflow-hidden rounded border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6 sm:py-5">
            {/* Espinha vermelha — ecoa a espinha dos cards */}
            <span
               aria-hidden
               className="absolute top-0 left-0 h-full w-1 bg-red-600"
            />

            <div className="relative flex flex-wrap items-center justify-between gap-4">
               <div className="flex min-w-0 items-center gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-red-50 text-red-600 ring-1 ring-red-100 ring-inset">
                     <MdFlightTakeoff className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                     <span className="block font-mono text-[10px] font-bold tracking-[0.3em] text-red-500 uppercase">
                        Gestão Operacional
                     </span>
                     <h1 className="text-2xl leading-none font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                        Aeronaves
                     </h1>
                  </div>
               </div>

               <PermBased resource={"aeronaves"} requiredPerm={"create"}>
                  <Button
                     color="red"
                     onClick={handleOpenCreate}
                     className="font-semibold whitespace-nowrap"
                  >
                     <HiPlus className="mr-2 h-4 w-4" />
                     Nova Aeronave
                  </Button>
               </PermBased>
            </div>
         </header>

         {/* Content */}
         {showSkeleton ? (
            <AeronaveListSkeleton />
         ) : aeronaves.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded border border-slate-200 bg-white shadow-sm">
               <div className="mb-4 rounded-full bg-gray-100 p-4">
                  <MdFlightTakeoff className="h-12 w-12 text-gray-400" />
               </div>
               <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Nenhuma aeronave cadastrada
               </h3>
               <p className="mb-4 text-sm text-gray-500">
                  Cadastre a primeira aeronave para começar
               </p>

               <PermBased resource={"aeronaves"} requiredPerm={"create"}>
                  <Button color="red" onClick={handleOpenCreate} size="sm">
                     <HiPlus className="mr-2 h-4 w-4" />
                     Cadastrar Aeronave
                  </Button>
               </PermBased>
            </div>
         ) : (
            <div
               className={clsx(
                  "space-y-2 transition-opacity duration-200",
                  isFetching ? "opacity-50" : "opacity-100"
               )}
            >
               {/* Summary Cards */}
               <SituacaoSummary aeronaves={aeronaves} />

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
