"use client";

import { useState } from "react";
import {
   Button,
   Modal,
   ModalBody,
   ModalFooter,
   ModalHeader,
} from "flowbite-react";
import { PermBased } from "@/app/(home)/hooks/usePermBased";
import { CrewIndisp, IndispType } from "services/routes/indisps";
import { useUserIndisps } from "@/hooks/queries";
import { useIndispFilters } from "../hooks/useIndispFilters";
import { useIndispModalActions } from "../context/indispModalContext";
import { CemalCard, UltVooCard } from "./TripStatusCards";
import { TripIndispFilters } from "./TripIndispFilters";
import { TripIndispTable } from "./TripIndispTable";
import { TripIndispTableSkeleton } from "./TripIndispTableSkeleton";

interface TripIndispProps {
   trip: CrewIndisp;
   indisps: IndispType[];
}

export const TripIndisp = ({
   trip,
   indisps: initialIndisps,
}: TripIndispProps) => {
   const [isOpen, setIsOpen] = useState(false);
   const { openForm } = useIndispModalActions();
   const filters = useIndispFilters();
   const user = trip.user;

   const {
      data: indisps = initialIndisps,
      isLoading,
      isFetching,
   } = useUserIndisps(trip.user.id, filters.filters, isOpen);

   const activeIndisps = indisps.filter((i) => !i.deleted_at);

   return (
      <>
         <Button
            color="light"
            className="h-10 w-14 overflow-visible p-0 text-sm font-medium uppercase transition-shadow hover:shadow-md"
            onClick={() => setIsOpen(true)}
            aria-label={`Ver indisponibilidades de ${trip.trig}`}
         >
            {trip.trig}
            {trip.func.oper === "in" && (
               <div
                  className="absolute -inset-e-1 -top-1 size-3 rounded-full bg-red-400"
                  aria-label="Instrutor"
               />
            )}
         </Button>

         {isOpen && (
            <Modal
               show={isOpen}
               size="3xl"
               onClose={() => setIsOpen(false)}
               dismissible
            >
               <ModalHeader>
                  <span className="text-lg font-bold">Indisponibilidades</span>
               </ModalHeader>
               <ModalBody className="max-h-160 min-h-160 overflow-y-scroll">
                  <div className="mb-1 p-1">
                     <h3 className="text-center text-lg font-bold text-gray-900 uppercase">
                        {user.posto.mid} {user.nome_guerra}
                     </h3>
                  </div>

                  <div className="mb-4 grid grid-cols-2 gap-3">
                     <CemalCard cemal={trip.cemal} />
                     <UltVooCard dataUltVoo={trip.data_ult_voo} trip={trip} />
                  </div>

                  <TripIndispFilters
                     filters={filters}
                     isFetching={isFetching && !isLoading}
                  />

                  {isLoading ? (
                     <TripIndispTableSkeleton />
                  ) : activeIndisps.length > 0 ? (
                     <TripIndispTable indisps={activeIndisps} trip={trip} />
                  ) : (
                     <div className="rounded border border-slate-200 bg-gray-50 p-8 text-center">
                        <p className="text-base text-gray-500">
                           {filters.hasCustomFilters
                              ? "Nenhuma indisponibilidade encontrada com os filtros aplicados"
                              : "Nenhuma indisponibilidade registrada"}
                        </p>
                        {filters.hasCustomFilters && (
                           <button
                              onClick={filters.reset}
                              className="mt-3 text-sm font-medium text-red-600 hover:underline"
                           >
                              Limpar filtros
                           </button>
                        )}
                     </div>
                  )}
               </ModalBody>
               <ModalFooter className="flex justify-center gap-3 bg-gray-50">
                  <PermBased requiredPerm="create" resource="indisp_trips">
                     <Button
                        color="red"
                        size="md"
                        onClick={() => openForm({ trip, indisp: null })}
                     >
                        + Adicionar Indisponibilidade
                     </Button>
                  </PermBased>
                  <Button
                     color="gray"
                     size="md"
                     onClick={() => setIsOpen(false)}
                  >
                     Fechar
                  </Button>
               </ModalFooter>
            </Modal>
         )}
      </>
   );
};
