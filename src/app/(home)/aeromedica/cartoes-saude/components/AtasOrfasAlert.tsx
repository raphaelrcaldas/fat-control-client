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
import type { AtaOrfaPublic } from "services/routes/aeromedica/atas";
import { useToast } from "@/app/context/toast";
import { useAtasOrfas, useDeleteAtasOrfas } from "@/hooks/queries";
import { formatSize } from "@/../utils/formatSize";

interface CleanupModalProps {
   show: boolean;
   onClose: () => void;
   atas: AtaOrfaPublic[];
}

function CleanupModal({ show, onClose, atas }: CleanupModalProps) {
   const { push } = useToast();
   const deleteMutation = useDeleteAtasOrfas();
   const isDeleting = deleteMutation.isPending;

   const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

   // Resetar seleção sempre que o modal abrir
   useEffect(() => {
      if (show) {
         setSelectedIds(new Set());
      }
   }, [show]);

   const allSelected = useMemo(
      () => atas.length > 0 && selectedIds.size === atas.length,
      [atas.length, selectedIds.size]
   );

   const toggleAll = () => {
      setSelectedIds((prev) =>
         prev.size === atas.length ? new Set() : new Set(atas.map((a) => a.id))
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
         const deleted = result.deleted;
         push({
            message: deleted
               ? `${deleted} ata(s) removida(s)`
               : "Nenhuma ata foi removida (lista pode estar desatualizada)",
            type: deleted ? "success" : "info",
         });
         onClose();
      } catch (err: unknown) {
         push({
            title: "Erro",
            message:
               err instanceof Error ? err.message : "Erro ao limpar atas órfãs",
            type: "error",
         });
      }
   };

   return (
      <Modal show={show} onClose={onClose} size="3xl" dismissible>
         <ModalHeader>Limpar atas de usuários inativos</ModalHeader>
         <ModalBody>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
               Selecione as atas que deseja remover. Pertencem a militares
               atualmente inativos.
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
                              aria-label="Selecionar todas"
                           />
                        </TableHeadCell>
                        <TableHeadCell>Militar</TableHeadCell>
                        <TableHeadCell>Arquivo</TableHeadCell>
                        <TableHeadCell>Tamanho</TableHeadCell>
                     </TableRow>
                  </TableHead>
                  <TableBody>
                     {atas.map((ata) => (
                        <TableRow
                           key={ata.id}
                           className={clsx(
                              "bg-white dark:border-gray-700 dark:bg-gray-800",
                              isDeleting
                                 ? "cursor-not-allowed"
                                 : "cursor-pointer"
                           )}
                           onClick={() => !isDeleting && toggleOne(ata.id)}
                        >
                           <TableCell onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                 checked={selectedIds.has(ata.id)}
                                 onChange={() => toggleOne(ata.id)}
                                 disabled={isDeleting}
                                 aria-label={`Selecionar ata de ${ata.nome_guerra}`}
                              />
                           </TableCell>
                           <TableCell className="font-medium whitespace-nowrap text-gray-900 uppercase dark:text-white">
                              {ata.nome_guerra}
                           </TableCell>
                           <TableCell className="max-w-xs truncate text-gray-700 dark:text-gray-300">
                              {ata.file_name}
                           </TableCell>
                           <TableCell className="whitespace-nowrap text-gray-700 dark:text-gray-300">
                              {formatSize(ata.file_size)}
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
                  {selectedIds.size} de {atas.length} selecionada(s)
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
                     {isDeleting ? "Limpando..." : "Limpar selecionadas"}
                  </Button>
               </div>
            </div>
         </ModalFooter>
      </Modal>
   );
}

export default function AtasOrfasAlert() {
   const { data: orfas, isLoading } = useAtasOrfas();
   const [showModal, setShowModal] = useState(false);

   if (isLoading || !orfas || orfas.total_atas === 0) {
      return null;
   }

   return (
      <>
         <Alert color="warning" icon={HiExclamation} withBorderAccent>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
               <span>
                  Existem <strong>{orfas.total_atas}</strong> ata(s) de
                  usuário(s) inativo(s) ocupando{" "}
                  <strong>{formatSize(orfas.total_size)}</strong>.
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
            atas={orfas.atas}
         />
      </>
   );
}
