import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
   useDeleteEtapa,
   useDeleteEstatMissao,
} from "@/hooks/queries/useEtapas";
import { useToast } from "@/app/context/toast";
import type { EtapaItem } from "services/routes/estatistica/etapas";
import type { Dupla } from "../types";

interface UseSimuladorActionsArgs {
   selectedKey: string | null;
   setSelectedKey: Dispatch<SetStateAction<string | null>>;
   removePending: (missaoId: number) => void;
}

/**
 * Ações de exclusão da feature (sessão e dupla), com toast e regras de
 * negócio. Mantém a página declarativa, sem mutations inline.
 */
export function useSimuladorActions({
   selectedKey,
   setSelectedKey,
   removePending,
}: UseSimuladorActionsArgs) {
   const { push } = useToast();
   const deleteEtapaMutation = useDeleteEtapa();
   const deleteMissaoMutation = useDeleteEstatMissao();

   const deleteSessao = useCallback(
      async (etapa: EtapaItem): Promise<boolean> => {
         try {
            const res = await deleteEtapaMutation.mutateAsync(etapa.id);
            push({
               title: res.ok ? "Sucesso!" : "Erro",
               message: res.message ?? "Sessão excluída",
               type: res.ok ? "success" : "error",
            });
            return res.ok;
         } catch (err) {
            push({
               title: "Erro",
               message:
                  err instanceof Error ? err.message : "Erro ao excluir sessão",
               type: "error",
            });
            return false;
         }
      },
      [deleteEtapaMutation, push]
   );

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
            if (res.ok) {
               removePending(dupla.missaoId);
               if (selectedKey === dupla.key) setSelectedKey(null);
            }
         } catch (err) {
            push({
               title: "Erro",
               message:
                  err instanceof Error ? err.message : "Erro ao excluir dupla",
               type: "error",
            });
         }
      },
      [deleteMissaoMutation, push, selectedKey, setSelectedKey, removePending]
   );

   return { deleteSessao, deleteDupla };
}
