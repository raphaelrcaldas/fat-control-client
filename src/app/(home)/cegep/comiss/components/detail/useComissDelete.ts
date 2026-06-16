"use client";

import { useState } from "react";
import { ComissWithMiss, DeletePreview } from "services/routes/cegep/comiss";
import { useDeleteComiss } from "@/hooks/queries";
import { useToast } from "@/app/context/toast";

/**
 * Máquina de estados da exclusão de um comissionamento, em duas fases:
 * 1ª submissão (sem `confirm`) pode retornar um preview das missões afetadas;
 * a 2ª submissão (`confirm: true`) efetiva a exclusão. O componente de modal
 * só precisa chamar `submit()` — o hook decide a fase.
 */
export function useComissDelete(comiss: ComissWithMiss, onDeleted: () => void) {
   const { push } = useToast();
   const [isOpen, setIsOpen] = useState(false);
   const [deletePreview, setDeletePreview] = useState<DeletePreview | null>(
      null
   );

   const deleteMutation = useDeleteComiss();
   const isDeleting = deleteMutation.isPending;

   const open = () => setIsOpen(true);

   const cancel = () => {
      if (isDeleting) return;
      setIsOpen(false);
      setDeletePreview(null);
   };

   const submit = () => {
      if (!comiss?.id) return;
      const confirm = !!deletePreview;

      deleteMutation.mutate(
         confirm ? { id: comiss.id, confirm: true } : { id: comiss.id },
         {
            onSuccess: (result) => {
               if (!result.ok) {
                  push({
                     title: "Erro",
                     message:
                        result.message || "Erro ao excluir comissionamento",
                     type: "error",
                  });
                  return;
               }

               // 1ª fase: backend devolveu preview das missões afetadas.
               if (!confirm && result.data) {
                  setDeletePreview(result.data);
                  return;
               }

               push({
                  message:
                     result.message || "Comissionamento excluido com sucesso",
                  type: "success",
               });
               setIsOpen(false);
               setDeletePreview(null);
               onDeleted();
            },
            onError: (err: Error) => {
               push({
                  title: "Erro",
                  message: err?.message || "Erro ao excluir comissionamento",
                  type: "error",
               });
            },
         }
      );
   };

   return { isOpen, isDeleting, deletePreview, open, cancel, submit };
}
