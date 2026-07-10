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
import { HiCheck, HiExclamation, HiTrash } from "react-icons/hi";
import clsx from "clsx";
import type { OrfaoAeromedicaPublic } from "services/routes/aeromedica/cartoesSaude";
import { useToast } from "@/app/context/toast";
import {
   useOrfaosAeromedica,
   useDeleteOrfaosAeromedica,
} from "@/hooks/queries";
import { formatSize } from "@/../utils/formatSize";

interface CleanupModalProps {
   show: boolean;
   onClose: () => void;
   itens: OrfaoAeromedicaPublic[];
}

function CleanupModal({ show, onClose, itens }: CleanupModalProps) {
   const { push } = useToast();
   const deleteMutation = useDeleteOrfaosAeromedica();
   const isDeleting = deleteMutation.isPending;

   const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

   // Resetar seleção sempre que o modal abrir
   useEffect(() => {
      if (show) {
         setSelectedIds(new Set());
      }
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

   const toggleOne = (userId: number) => {
      setSelectedIds((prev) => {
         const next = new Set(prev);
         if (next.has(userId)) {
            next.delete(userId);
         } else {
            next.add(userId);
         }
         return next;
      });
   };

   const handleCleanup = async () => {
      const userIds = Array.from(selectedIds);
      if (userIds.length === 0) return;

      try {
         const result = await deleteMutation.mutateAsync(userIds);
         const total = result.cartoes + result.atas;
         push({
            message: total
               ? `${result.cartoes} cartão(ões) e ${result.atas} ata(s) removido(s)`
               : "Nada foi removido (lista pode estar desatualizada)",
            type: total ? "success" : "info",
         });
         onClose();
      } catch (err: unknown) {
         push({
            title: "Erro",
            message:
               err instanceof Error
                  ? err.message
                  : "Erro ao limpar documentos órfãos",
            type: "error",
         });
      }
   };

   return (
      <Modal show={show} onClose={onClose} size="3xl" dismissible>
         <ModalHeader>Limpar documentos de militares inativos</ModalHeader>
         <ModalBody>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
               Selecione os militares. A exclusão remove o cartão de saúde e
               todas as atas de inspeção do militar de uma vez.
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
                        <TableHeadCell>Cartão</TableHeadCell>
                        <TableHeadCell>Atas</TableHeadCell>
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
                                 aria-label={`Selecionar documentos de ${item.nome_guerra}`}
                              />
                           </TableCell>
                           <TableCell className="font-medium whitespace-nowrap text-gray-900 uppercase dark:text-white">
                              {item.p_g} {item.nome_guerra}
                           </TableCell>
                           <TableCell className="whitespace-nowrap text-gray-700 dark:text-gray-300">
                              {item.tem_cartao ? (
                                 <HiCheck
                                    className="h-4 w-4 text-green-600"
                                    aria-label="Tem cartão"
                                 />
                              ) : (
                                 <span className="text-gray-400">—</span>
                              )}
                           </TableCell>
                           <TableCell className="whitespace-nowrap text-gray-700 dark:text-gray-300">
                              {item.total_atas > 0
                                 ? `${item.total_atas} (${formatSize(item.atas_size)})`
                                 : "—"}
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
   const { data: orfaos, isLoading } = useOrfaosAeromedica();
   const [showModal, setShowModal] = useState(false);

   if (isLoading || !orfaos || orfaos.total_militares === 0) {
      return null;
   }

   const partes = [];
   if (orfaos.total_cartoes > 0) {
      partes.push(`${orfaos.total_cartoes} cartão(ões) de saúde`);
   }
   if (orfaos.total_atas > 0) {
      partes.push(
         `${orfaos.total_atas} ata(s) ocupando ${formatSize(orfaos.atas_size)}`
      );
   }

   return (
      <>
         <Alert color="warning" icon={HiExclamation} withBorderAccent>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
               <span>
                  <strong>{orfaos.total_militares}</strong> militar(es)
                  inativo(s) com documentos aeromédicos: {partes.join(" e ")}.
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
