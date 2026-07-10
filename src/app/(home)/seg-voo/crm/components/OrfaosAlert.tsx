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
import type { CrmOrfaoPublic } from "services/routes/seg-voo/crm";
import { useToast } from "@/app/context/toast";
import { useCrmOrfaos, useDeleteCrmOrfaos } from "@/hooks/queries";

interface CleanupModalProps {
   show: boolean;
   onClose: () => void;
   itens: CrmOrfaoPublic[];
}

function CleanupModal({ show, onClose, itens }: CleanupModalProps) {
   const { push } = useToast();
   const deleteMutation = useDeleteCrmOrfaos();
   const isDeleting = deleteMutation.isPending;

   const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

   useEffect(() => {
      if (show) setSelectedIds(new Set());
   }, [show]);

   const allSelected = useMemo(
      () => itens.length > 0 && selectedIds.size === itens.length,
      [itens.length, selectedIds.size]
   );

   const toggleAll = () => {
      setSelectedIds((prev) =>
         prev.size === itens.length
            ? new Set()
            : new Set(itens.map((i) => i.user_id))
      );
   };

   const toggleOne = (id: number) => {
      setSelectedIds((prev) => {
         const next = new Set(prev);
         if (next.has(id)) next.delete(id);
         else next.add(id);
         return next;
      });
   };

   const handleCleanup = async () => {
      const ids = Array.from(selectedIds);
      if (ids.length === 0) return;

      try {
         const result = await deleteMutation.mutateAsync(ids);
         push({
            message: result.deleted
               ? `${result.deleted} certificado(s) CRM removido(s)`
               : "Nada foi removido (lista pode estar desatualizada)",
            type: result.deleted ? "success" : "info",
         });
         onClose();
      } catch (err: unknown) {
         push({
            title: "Erro",
            message:
               err instanceof Error ? err.message : "Erro ao limpar CRM órfãos",
            type: "error",
         });
      }
   };

   return (
      <Modal show={show} onClose={onClose} size="2xl" dismissible>
         <ModalHeader>Limpar CRM de militares inativos</ModalHeader>
         <ModalBody>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
               Selecione os militares. A exclusão remove o certificado CRM de
               militares atualmente inativos.
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
                        <TableHeadCell>Militar</TableHeadCell>
                     </TableRow>
                  </TableHead>
                  <TableBody>
                     {itens.map((item) => (
                        <TableRow
                           key={item.user_id}
                           className={clsx(
                              "bg-white dark:border-gray-700 dark:bg-gray-800",
                              isDeleting
                                 ? "cursor-not-allowed"
                                 : "cursor-pointer"
                           )}
                           onClick={() =>
                              !isDeleting && toggleOne(item.user_id)
                           }
                        >
                           <TableCell onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                 checked={selectedIds.has(item.user_id)}
                                 onChange={() => toggleOne(item.user_id)}
                                 disabled={isDeleting}
                                 aria-label={`Selecionar ${item.nome_guerra}`}
                              />
                           </TableCell>
                           <TableCell className="font-medium whitespace-nowrap text-gray-900 uppercase dark:text-white">
                              {item.p_g} {item.nome_guerra}
                           </TableCell>
                        </TableRow>
                     ))}
                  </TableBody>
               </Table>
            </div>
         </ModalBody>
         <ModalFooter>
            <div className="flex w-full items-center justify-between">
               <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedIds.size} de {itens.length} selecionado(s)
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

export default function OrfaosAlert() {
   const { data: orfaos, isLoading } = useCrmOrfaos();
   const [showModal, setShowModal] = useState(false);

   if (isLoading || !orfaos || orfaos.total_registros === 0) {
      return null;
   }

   return (
      <>
         <Alert color="warning" icon={HiExclamation} withBorderAccent>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
               <span>
                  <strong>{orfaos.total_registros}</strong> certificado(s) CRM
                  de militar(es) inativo(s).
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
            itens={orfaos.itens}
         />
      </>
   );
}
