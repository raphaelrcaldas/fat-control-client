"use client";

import { useState, useEffect, useMemo } from "react";
import {
   Alert,
   Modal,
   ModalHeader,
   ModalBody,
   ModalFooter,
   Button,
   Checkbox,
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
   TableCell,
} from "flowbite-react";
import { HiExclamation, HiTrash } from "react-icons/hi";
import clsx from "clsx";
import { QuadsOrfaoEntry } from "services/routes/quads";
import { useToast } from "@/app/context/toast";
import { useQuadsOrfaos, useDeleteQuadsOrfaos } from "@/hooks/queries";

interface CleanupModalProps {
   show: boolean;
   onClose: () => void;
   orfaos: QuadsOrfaoEntry[];
}

function CleanupModal({ show, onClose, orfaos }: CleanupModalProps) {
   const { push } = useToast();
   const deleteMutation = useDeleteQuadsOrfaos();
   const isDeleting = deleteMutation.isPending;

   const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

   // Resetar seleção sempre que o modal abrir
   useEffect(() => {
      if (show) {
         setSelectedIds(new Set());
      }
   }, [show]);

   const allSelected = useMemo(
      () => orfaos.length > 0 && selectedIds.size === orfaos.length,
      [orfaos.length, selectedIds.size]
   );

   const toggleAll = () => {
      setSelectedIds((prev) =>
         prev.size === orfaos.length
            ? new Set()
            : new Set(orfaos.map((o) => o.trip.id))
      );
   };

   const toggleOne = (id: number) => {
      setSelectedIds((prev) => {
         const next = new Set(prev);
         if (next.has(id)) {
            next.delete(id);
         } else {
            next.add(id);
         }
         return next;
      });
   };

   const handleCleanup = async () => {
      const ids = Array.from(selectedIds);
      if (ids.length === 0) return;

      try {
         const result = await deleteMutation.mutateAsync(ids);
         const deleted = result.data?.deleted ?? 0;
         const trips = result.data?.trips ?? 0;
         push({
            message: deleted
               ? `${deleted} quadrinho(s) de ${trips} tripulante(s) removido(s)`
               : "Nenhum quadrinho foi removido (lista pode estar desatualizada)",
            type: deleted ? "success" : "info",
         });
         onClose();
      } catch (err: unknown) {
         push({
            title: "Erro",
            message:
               err instanceof Error
                  ? err.message
                  : "Erro ao limpar quadrinhos órfãos",
            type: "error",
         });
      }
   };

   return (
      <Modal show={show} onClose={onClose} size="3xl" dismissible>
         <ModalHeader>Limpar quadrinhos de tripulantes desativados</ModalHeader>
         <ModalBody>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
               Selecione os tripulantes cujos quadrinhos deseja remover. Estes
               estão atualmente desativados.
            </p>
            <div className="overflow-x-auto rounded border border-slate-200 shadow">
               <Table hoverable>
                  <TableHead>
                     <TableRow>
                        <TableHeadCell className="w-12">
                           <Checkbox
                              checked={allSelected}
                              onChange={toggleAll}
                              disabled={isDeleting}
                              aria-label="Selecionar todos"
                           />
                        </TableHeadCell>
                        <TableHeadCell>Tripulante</TableHeadCell>
                        <TableHeadCell>Quadrinhos</TableHeadCell>
                     </TableRow>
                  </TableHead>
                  <TableBody>
                     {orfaos.map((orfao) => {
                        const tripId = orfao.trip.id;
                        return (
                           <TableRow
                              key={tripId}
                              className={clsx(
                                 "bg-white dark:border-gray-700 dark:bg-gray-800",
                                 isDeleting
                                    ? "cursor-not-allowed"
                                    : "cursor-pointer"
                              )}
                              onClick={() => !isDeleting && toggleOne(tripId)}
                           >
                              <TableCell onClick={(e) => e.stopPropagation()}>
                                 <Checkbox
                                    checked={selectedIds.has(tripId)}
                                    onChange={() => toggleOne(tripId)}
                                    disabled={isDeleting}
                                    aria-label={`Selecionar ${orfao.trip.user.nome_guerra}`}
                                 />
                              </TableCell>
                              <TableCell className="font-medium whitespace-nowrap text-gray-900 uppercase dark:text-white">
                                 {orfao.trip.user.posto.short}{" "}
                                 {orfao.trip.user.nome_guerra}{" "}
                                 <span className="text-gray-500 dark:text-gray-400">
                                    ({orfao.trip.trig})
                                 </span>
                              </TableCell>
                              <TableCell className="text-gray-700 dark:text-gray-300">
                                 {orfao.quads_count}
                              </TableCell>
                           </TableRow>
                        );
                     })}
                  </TableBody>
               </Table>
            </div>
         </ModalBody>
         <ModalFooter>
            <div className="flex w-full items-center justify-between">
               <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedIds.size} de {orfaos.length} selecionado(s)
               </span>
               <div className="flex gap-2">
                  <Button color="gray" onClick={onClose} disabled={isDeleting}>
                     Cancelar
                  </Button>
                  <Button
                     color="red"
                     onClick={handleCleanup}
                     disabled={selectedIds.size === 0 || isDeleting}
                  >
                     <HiTrash className="mr-2 h-4 w-4" />
                     {isDeleting ? "Limpando..." : "Limpar selecionados"}
                  </Button>
               </div>
            </div>
         </ModalFooter>
      </Modal>
   );
}

export function QuadsOrfaosAlert() {
   const { data: orfaos = [] } = useQuadsOrfaos();
   const [showModal, setShowModal] = useState(false);

   if (orfaos.length === 0) {
      return null;
   }

   return (
      <>
         <Alert
            color="warning"
            icon={HiExclamation}
            withBorderAccent
            className="mb-2"
         >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
               <span>
                  Existem <strong>{orfaos.length}</strong> tripulante(s)
                  desativado(s) com quadrinhos registrados.
               </span>
               <Button
                  color="yellow"
                  size="xs"
                  onClick={() => setShowModal(true)}
               >
                  Revisar e limpar
               </Button>
            </div>
         </Alert>

         <CleanupModal
            show={showModal}
            onClose={() => setShowModal(false)}
            orfaos={orfaos}
         />
      </>
   );
}
