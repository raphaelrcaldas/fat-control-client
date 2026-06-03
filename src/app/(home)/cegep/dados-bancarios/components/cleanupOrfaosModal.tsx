"use client";

import { useState, useEffect, useMemo } from "react";
import {
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
import { HiTrash } from "react-icons/hi";
import clsx from "clsx";
import { DadosBancariosWithUser } from "services/routes/cegep/dadosBancarios";
import { useToast } from "@/app/context/toast";
import { useDeleteDadosBancariosOrfaos } from "@/hooks/queries";

interface CleanupOrfaosModalProps {
   show: boolean;
   onClose: () => void;
   orfaos: DadosBancariosWithUser[];
}

export default function CleanupOrfaosModal({
   show,
   onClose,
   orfaos,
}: CleanupOrfaosModalProps) {
   const { push } = useToast();
   const deleteMutation = useDeleteDadosBancariosOrfaos();
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
            : new Set(orfaos.map((d) => d.id))
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
         push({
            message: `${result.data?.deleted ?? 0} registro(s) de dados bancários removido(s) com sucesso`,
            type: "success",
         });
         onClose();
      } catch (err: unknown) {
         push({
            title: "Erro",
            message:
               err instanceof Error
                  ? err.message
                  : "Erro ao limpar dados bancários órfãos",
            type: "error",
         });
      }
   };

   return (
      <Modal show={show} onClose={onClose} size="3xl" dismissible>
         <ModalHeader>
            Limpar dados bancários de militares desativados
         </ModalHeader>
         <ModalBody>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
               Selecione os registros que deseja remover. Estes pertencem a
               militares atualmente desativados.
            </p>
            <div className="overflow-x-auto rounded-md border border-slate-200 shadow">
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
                        <TableHeadCell>Banco</TableHeadCell>
                        <TableHeadCell>Agência</TableHeadCell>
                        <TableHeadCell>Conta</TableHeadCell>
                     </TableRow>
                  </TableHead>
                  <TableBody>
                     {orfaos.map((dado) => (
                        <TableRow
                           key={dado.id}
                           className={clsx(
                              "bg-white dark:border-gray-700 dark:bg-gray-800",
                              isDeleting
                                 ? "cursor-not-allowed"
                                 : "cursor-pointer"
                           )}
                           onClick={() => !isDeleting && toggleOne(dado.id)}
                        >
                           <TableCell onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                 checked={selectedIds.has(dado.id)}
                                 onChange={() => toggleOne(dado.id)}
                                 disabled={isDeleting}
                                 aria-label={`Selecionar ${dado.user.nome_guerra}`}
                              />
                           </TableCell>
                           <TableCell className="font-medium whitespace-nowrap text-gray-900 uppercase dark:text-white">
                              {dado.user.posto.short} {dado.user.nome_guerra}
                           </TableCell>
                           <TableCell className="text-gray-700 dark:text-gray-300">
                              {dado.banco}{" "}
                              <span className="text-gray-500 dark:text-gray-400">
                                 ({dado.codigo_banco})
                              </span>
                           </TableCell>
                           <TableCell className="text-gray-700 dark:text-gray-300">
                              {dado.agencia}
                           </TableCell>
                           <TableCell className="text-gray-700 dark:text-gray-300">
                              {dado.conta}
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
