import { useCallback } from "react";
import { useDeleteEstatMissao } from "@/hooks/queries/useEtapas";
import { useToast } from "@/app/context/toast";
import type { Dupla } from "../types";

/**
 * Ações de exclusão da feature (dupla), com toast e regras de negócio.
 * Mantém a página declarativa, sem mutations inline.
 */
export function useSimuladorActions() {
   const { push } = useToast();
   const deleteMissaoMutation = useDeleteEstatMissao();

   const deleteDupla = useCallback(
      async (dupla: Dupla) => {
         if (dupla.etapas.length > 0) {
            push({
               title: "Erro",
               message: "Exclua todas as sessões antes de remover a dupla",
               type: "error",
            });
            return;
         }

         try {
            const res = await deleteMissaoMutation.mutateAsync(dupla.missaoId);
            push({
               title: res.ok ? "Sucesso!" : "Erro",
               message: res.message ?? "Dupla excluída",
               type: res.ok ? "success" : "error",
            });
         } catch (err) {
            push({
               title: "Erro",
               message:
                  err instanceof Error ? err.message : "Erro ao excluir dupla",
               type: "error",
            });
         }
      },
      [deleteMissaoMutation, push]
   );

   return {
      deleteDupla,
      isDeletingDupla: deleteMissaoMutation.isPending,
   };
}
