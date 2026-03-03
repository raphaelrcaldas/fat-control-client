"use client";

import { useCallback } from "react";
import { Modal, ModalHeader, ModalBody, Button, Spinner } from "flowbite-react";
import { HiExclamationCircle } from "react-icons/hi";
import { useDeleteEstatMissao } from "@/hooks/queries/useEtapas";
import { useToast } from "@/app/context/toast";
import type { MissaoComEtapas } from "services/routes/estatistica/etapas";

interface MissaoDeleteModalProps {
   show: boolean;
   onClose: () => void;
   missao: MissaoComEtapas | null;
}

export function MissaoDeleteModal({
   show,
   onClose,
   missao,
}: MissaoDeleteModalProps) {
   const { push } = useToast();
   const deleteMutation = useDeleteEstatMissao();
   const isSubmitting = deleteMutation.isPending;

   const handleDelete = useCallback(async () => {
      if (!missao) return;

      try {
         const res = await deleteMutation.mutateAsync(missao.id);

         push({
            title: "Sucesso!",
            message: res.message || "Missao excluida com sucesso",
            type: res.ok ? "success" : "error",
         });

         if (res.ok) onClose();
      } catch (err: unknown) {
         push({
            title: "Erro",
            message:
               err instanceof Error ? err.message : "Erro ao excluir missao",
            type: "error",
         });
      }
   }, [missao, deleteMutation, onClose, push]);

   return (
      <Modal show={show} onClose={onClose} size="md" popup>
         <ModalHeader>Excluir Missao</ModalHeader>
         <ModalBody>
            <div className="text-center">
               <HiExclamationCircle className="mx-auto mb-4 h-14 w-14 text-amber-400" />
               <p className="mb-2 text-base text-gray-600">
                  Tem certeza que deseja excluir a missao{" "}
                  <span className="font-bold">
                     {missao?.titulo || `#${missao?.id}`}
                  </span>
                  ?
               </p>
               <p className="text-sm font-medium text-red-600">
                  Esta acao nao pode ser desfeita.
               </p>
               <div className="flex justify-center gap-3 pt-4">
                  <Button
                     color="gray"
                     onClick={onClose}
                     disabled={isSubmitting}
                  >
                     Cancelar
                  </Button>
                  <Button
                     color="red"
                     onClick={handleDelete}
                     disabled={isSubmitting}
                  >
                     {isSubmitting ? (
                        <div className="flex items-center gap-2">
                           <Spinner size="sm" color="failure" />
                           <span>Excluindo...</span>
                        </div>
                     ) : (
                        "Excluir"
                     )}
                  </Button>
               </div>
            </div>
         </ModalBody>
      </Modal>
   );
}
