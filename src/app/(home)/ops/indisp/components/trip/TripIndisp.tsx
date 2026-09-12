"use client";

import clsx from "clsx";
import { HiOutlineUser, HiPlus } from "react-icons/hi";
import {
   Button,
   Modal,
   ModalBody,
   ModalFooter,
   ModalHeader,
} from "flowbite-react";
import { PermBased } from "@/app/(home)/hooks/usePermBased";
import { CrewIndispList } from "services/routes/indisps";
import { useUserIndisps } from "@/hooks/queries/useIndisps";
import { useIndispFilters } from "./hooks/useIndispFilters";
import { useIndispModalActions } from "../../context/indispModalContext";
import { CemalCard, UltVooCard } from "./TripStatusCards";
import { TripIndispFilters } from "./TripIndispFilters";
import { TripIndispTable } from "./TripIndispTable";
import { TripIndispTableSkeleton } from "./TripIndispTableSkeleton";

interface TripIndispProps {
   tripData: CrewIndispList;
   onClose: () => void;
}

/**
 * Lista completa de um tripulante.
 *
 * Modal controlado: quem abre é a coluna do trigrama na grade, via contexto
 * (ver `TripIndispHost`). Antes o gatilho morava aqui dentro, o que amarrava a
 * lista ao botão da célula e obrigava uma instância por linha.
 */
export const TripIndisp = ({ tripData, onClose }: TripIndispProps) => {
   const { trip, restricoes_derivadas, elegivel_desadaptacao } = tripData;
   const { openForm } = useIndispModalActions();
   const filters = useIndispFilters();
   const user = trip.user;

   // A query é a única fonte: o payload da grade traz só a janela visível, e
   // aqui a lista é filtrável por período próprio.
   const {
      data: indisps = [],
      isLoading,
      isError,
      isFetching,
      refetch,
   } = useUserIndisps(trip.user.id, filters.filters, true);

   const activeIndisps = indisps.filter((i) => !i.deleted_at);

   return (
      <Modal
         show
         size="3xl"
         onClose={onClose}
         dismissible
         className="h-dvh items-start"
         theme={{ content: { base: "h-auto" } }}
      >
         <ModalHeader
            as="h2"
            theme={{ title: "min-w-0", close: { base: "shrink-0" } }}
         >
            <span className="flex items-center gap-2 text-lg font-bold text-slate-800 uppercase">
               <HiOutlineUser
                  aria-hidden
                  className="h-5 w-5 shrink-0 text-slate-400"
               />
               <span
                  className="truncate"
                  title={`${user.posto.mid} ${user.nome_guerra}`}
               >
                  {user.posto.mid} {user.nome_guerra}
               </span>
            </span>
            <span className="block text-sm font-normal text-slate-500">
               Indisponibilidades
            </span>
         </ModalHeader>
         <ModalBody className="min-h-0 space-y-3 p-3 sm:min-h-80 sm:p-6">
            <div className="grid grid-cols-2 gap-2">
               <CemalCard
                  cemal={trip.cemal}
                  restricoesDerivadas={restricoes_derivadas}
               />
               <UltVooCard
                  dataUltVoo={trip.data_ult_voo}
                  elegivelDesadaptacao={elegivel_desadaptacao}
                  restricoesDerivadas={restricoes_derivadas}
               />
            </div>

            <TripIndispFilters
               filters={filters}
               isFetching={isFetching && !isLoading}
            />

            <div
               aria-busy={isFetching}
               className={clsx(
                  "transition-opacity duration-200",
                  isFetching && !isLoading && "opacity-50"
               )}
            >
               {isLoading ? (
                  <TripIndispTableSkeleton />
               ) : isError ? (
                  <div
                     role="alert"
                     className="space-y-3 rounded border border-red-200 bg-red-50 p-8 text-center"
                  >
                     <h3 className="text-base font-semibold text-red-700">
                        Não foi possível carregar as indisponibilidades
                     </h3>
                     <p className="text-sm text-slate-600">
                        Verifique a conexão e tente novamente.
                     </p>
                     <Button
                        color="light"
                        size="sm"
                        disabled={isFetching}
                        onClick={() => void refetch()}
                     >
                        {isFetching
                           ? "Tentando novamente…"
                           : "Tentar novamente"}
                     </Button>
                  </div>
               ) : activeIndisps.length > 0 ? (
                  <TripIndispTable indisps={activeIndisps} trip={trip} />
               ) : (
                  <div
                     role="status"
                     className="space-y-3 rounded border border-slate-200 bg-gray-50 p-8 text-center"
                  >
                     <p className="text-base text-gray-500">
                        {filters.hasCustomFilters
                           ? "Nenhuma indisponibilidade encontrada com os filtros aplicados"
                           : "Nenhuma indisponibilidade registrada"}
                     </p>
                     {filters.hasCustomFilters && (
                        <Button color="light" size="sm" onClick={filters.reset}>
                           Limpar filtros
                        </Button>
                     )}
                  </div>
               )}
            </div>
         </ModalBody>
         <ModalFooter className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-slate-200 bg-slate-50 p-3 sm:p-4">
            <PermBased requiredPerm="create" resource="ops.indisp">
               <Button
                  color="primary"
                  size="md"
                  onClick={() => openForm({ trip, indisp: null })}
               >
                  <HiPlus className="mr-2 h-4 w-4" aria-hidden />
                  Adicionar
               </Button>
            </PermBased>
            <Button color="light" size="md" onClick={onClose}>
               Fechar
            </Button>
         </ModalFooter>
      </Modal>
   );
};
