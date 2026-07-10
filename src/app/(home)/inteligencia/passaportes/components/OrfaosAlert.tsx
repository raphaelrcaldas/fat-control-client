"use client";

import { useEffect, useMemo, useState } from "react";
import {
   Alert,
   Badge,
   Button,
   Checkbox,
   Modal,
   ModalHeader,
   ModalBody,
   ModalFooter,
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
   TableCell,
} from "flowbite-react";
import { HiExclamation, HiTrash } from "react-icons/hi";
import clsx from "clsx";
import type { PassaporteOrfao } from "services/routes/inteligencia/passaportes";
import { useToast } from "@/app/context/toast";
import {
   usePassaportesOrfaos,
   useDeletePassaportesOrfaos,
} from "@/hooks/queries";

interface CleanupModalProps {
   show: boolean;
   onClose: () => void;
   itens: PassaporteOrfao[];
}

function CleanupModal({ show, onClose, itens }: CleanupModalProps) {
   const { push } = useToast();
   const deleteMutation = useDeletePassaportesOrfaos();
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
            message: result.registros
               ? `${result.registros} registro(s) de passaporte removido(s)`
               : "Nada foi removido (lista pode estar desatualizada)",
            type: result.registros ? "success" : "info",
         });
         onClose();
      } catch (err: unknown) {
         push({
            title: "Erro",
            message:
               err instanceof Error
                  ? err.message
                  : "Erro ao limpar registros órfãos",
            type: "error",
         });
      }
   };

   return (
      <Modal show={show} onClose={onClose} size="3xl" dismissible>
         <ModalHeader>Limpar passaportes de militares inativos</ModalHeader>
         <ModalBody>
            <p className="mb-4 text-sm text-gray-600">
               Selecione os militares. A exclusão remove o registro de
               passaporte completo (dados e imagens) de militares atualmente
               inativos.
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
                        <TableHeadCell>Imagens</TableHeadCell>
                     </TableRow>
                  </TableHead>
                  <TableBody>
                     {itens.map((item) => (
                        <TableRow
                           key={item.user_id}
                           className={clsx(
                              "bg-white",
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
                           <TableCell className="font-medium whitespace-nowrap text-gray-900 uppercase">
                              {item.p_g} {item.nome_guerra}
                           </TableCell>
                           <TableCell>
                              <div className="flex gap-1.5">
                                 {item.tem_passaporte && (
                                    <Badge color="gray">Passaporte</Badge>
                                 )}
                                 {item.tem_visa && (
                                    <Badge color="gray">Visto</Badge>
                                 )}
                                 {!item.tem_passaporte && !item.tem_visa && (
                                    <span className="text-gray-400">—</span>
                                 )}
                              </div>
                           </TableCell>
                        </TableRow>
                     ))}
                  </TableBody>
               </Table>
            </div>
         </ModalBody>
         <ModalFooter>
            <div className="flex w-full items-center justify-between">
               <span className="text-sm text-gray-600">
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

/**
 * Alerta de limpeza: ao abrir a página, verifica se há registros de
 * passaporte pertencentes a militares inativos e oferece a exclusão
 * completa (dados + imagens). Só montado para quem tem `passaportes.delete`
 * (ver gate na página).
 */
export default function OrfaosAlert() {
   const { data: orfaos, isLoading } = usePassaportesOrfaos();
   const [showModal, setShowModal] = useState(false);

   if (isLoading || !orfaos || orfaos.total_registros === 0) {
      return null;
   }

   return (
      <>
         <Alert color="warning" icon={HiExclamation} withBorderAccent>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
               <span>
                  Existem <strong>{orfaos.total_registros}</strong> registro(s)
                  de passaporte de militar(es) inativo(s).
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
