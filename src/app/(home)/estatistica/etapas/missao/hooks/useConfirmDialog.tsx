"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useMissaoDraftDispatch } from "../context/MissaoDraftContext";
import type { useMissaoActions } from "./useMissaoActions";

export type ConfirmDialog =
   | { kind: "cancel" }
   | { kind: "revert" }
   | { kind: "removeEtapa"; localId: string }
   | { kind: "deleteMissao" };

interface UseConfirmDialogArgs {
   deleteMutation: ReturnType<typeof useMissaoActions>["deleteMutation"];
}

/**
 * Maquina de estado dos dialogos de confirmacao do editor (sair, reverter,
 * remover etapa, excluir missao): mantem o dialogo aberto, executa a acao
 * confirmada e deriva o texto exibido no ConfirmModal.
 */
export function useConfirmDialog({ deleteMutation }: UseConfirmDialogArgs) {
   const router = useRouter();
   const dispatch = useMissaoDraftDispatch();
   const [dialog, setDialog] = useState<ConfirmDialog | null>(null);

   const open = useCallback((next: ConfirmDialog) => setDialog(next), []);

   const close = useCallback(() => {
      if (deleteMutation.isPending) return;
      setDialog(null);
   }, [deleteMutation.isPending]);

   const confirm = useCallback(() => {
      if (!dialog) return;
      if (dialog.kind === "cancel") {
         setDialog(null);
         router.back();
         return;
      }
      if (dialog.kind === "revert") {
         dispatch({ type: "REVERT_DRAFT" });
         setDialog(null);
         return;
      }
      if (dialog.kind === "removeEtapa") {
         dispatch({
            type: "REMOVE_ETAPA",
            payload: { localId: dialog.localId },
         });
         setDialog(null);
         return;
      }
      if (dialog.kind === "deleteMissao") {
         deleteMutation.mutate(undefined, {
            onSettled: () => setDialog(null),
         });
      }
   }, [dialog, dispatch, router, deleteMutation]);

   const config = useMemo(() => {
      if (!dialog) return null;
      if (dialog.kind === "cancel") {
         return {
            title: "Sair sem salvar?",
            message: (
               <>
                  <p>Há mudanças não salvas nesta missão.</p>
                  <p className="mt-1 text-sm font-medium text-red-600">
                     Se sair agora, todas as alterações serão perdidas.
                  </p>
               </>
            ),
            confirmLabel: "Sair sem salvar",
         };
      }
      if (dialog.kind === "revert") {
         return {
            title: "Desfazer alterações?",
            message: (
               <>
                  <p>
                     Todas as alterações feitas desde a última carga serão
                     descartadas.
                  </p>
                  <p className="mt-1 text-sm font-medium text-red-600">
                     Esta ação não pode ser desfeita.
                  </p>
               </>
            ),
            confirmLabel: "Desfazer",
         };
      }
      if (dialog.kind === "removeEtapa") {
         return {
            title: "Remover etapa?",
            message: (
               <>
                  <p>Esta etapa será removida da missão.</p>
                  <p className="mt-1 text-sm font-medium text-red-600">
                     Esta ação não pode ser desfeita.
                  </p>
               </>
            ),
            confirmLabel: "Remover",
         };
      }
      return {
         title: "Excluir missão?",
         message: (
            <>
               <p>A missão e TODAS as suas etapas serão excluídas.</p>
               <p className="mt-1 text-sm font-medium text-red-600">
                  Esta ação não pode ser desfeita.
               </p>
            </>
         ),
         confirmLabel: "Excluir",
      };
   }, [dialog]);

   return { dialog, open, close, confirm, config };
}
