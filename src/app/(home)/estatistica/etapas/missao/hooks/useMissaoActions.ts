"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useToast } from "@/app/context/toast";
import { usePermBased } from "@/app/(home)/hooks/usePermBased";
import { etapaKeys } from "@/hooks/queries/useEtapas";
import { deleteMissaoComEtapas } from "services/routes/estatistica/etapas";

import { useMissaoDraftDispatch } from "../context/MissaoDraftContext";
import type { MissaoDraft } from "../context/types";
import { useSaveMissaoDraft } from "./useSaveMissaoDraft";
import { useUpdateMissaoDraft } from "./useUpdateMissaoDraft";

interface UseMissaoActionsArgs {
   draft: MissaoDraft;
   mode: "new" | "edit";
}

/**
 * Orquestra as mutations da missao (criar / atualizar / excluir), incluindo a
 * checagem de permissao, o RECOMPUTE_SNAPSHOT pos-salvar e a navegacao de volta
 * para a lista. Expoe as mutations cruas para que o componente leia os estados
 * de pending (header, guard de mudancas, atalho).
 */
export function useMissaoActions({ draft, mode }: UseMissaoActionsArgs) {
   const router = useRouter();
   const { push } = useToast();
   const dispatch = useMissaoDraftDispatch();
   const { hasPerm } = usePermBased();
   const canSave = hasPerm("etp_mis", "create");

   const queryClient = useQueryClient();
   const saveMutation = useSaveMissaoDraft();
   const updateMutation = useUpdateMissaoDraft();

   const deleteMutation = useMutation({
      mutationFn: () => deleteMissaoComEtapas(draft.serverId!),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: etapaKeys.all });
         router.push("/estatistica/etapas");
      },
      onError: (err: Error) => {
         push({
            type: "error",
            title: "Erro ao excluir",
            message: err.message ?? "Falha ao excluir missão",
         });
      },
   });

   const handleSave = useCallback(() => {
      if (!canSave) {
         push({
            title: "Sem permissão",
            message: "Você não tem permissão para salvar missões.",
            type: "warning",
         });
         return;
      }
      if (draft.etapas.length === 0) {
         push({
            title: "Erro",
            message: "A missão precisa ter pelo menos 1 etapa.",
            type: "error",
         });
         return;
      }
      // Salvar uma etapa fora de "ok" descartaria OIs incompletas e
      // zeraria específicos inválidos silenciosamente (ver buildEtapaNested).
      // Bloqueia e aponta quais etapas revisar.
      const invalidas = draft.etapas
         .map((e, i) => ({ num: i + 1, status: e.status }))
         .filter((e) => e.status !== "ok");
      if (invalidas.length > 0) {
         push({
            title: "Etapas incompletas",
            message:
               `Revise a(s) etapa(s) ${invalidas
                  .map((e) => e.num)
                  .join(", ")} antes de salvar. Confira dados do voo, ` +
               "soma das OIs e campos dos específicos.",
            type: "error",
         });
         return;
      }
      const onSuccess = () => {
         dispatch({ type: "RECOMPUTE_SNAPSHOT" });
         router.push("/estatistica/etapas");
      };
      if (mode === "edit") {
         updateMutation.mutate(draft, { onSuccess });
         return;
      }
      saveMutation.mutate(draft, { onSuccess });
   }, [
      canSave,
      draft,
      mode,
      push,
      dispatch,
      router,
      saveMutation,
      updateMutation,
   ]);

   return { saveMutation, updateMutation, deleteMutation, handleSave };
}
