"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useToast } from "@/app/context/toast";
import { etapaKeys } from "@/hooks/queries/useEtapas";
import { ApiError } from "services/Api";
import {
   updateMissaoWithEtapas,
   type MissaoComEtapasDetail,
} from "services/routes/estatistica/etapas";

import { buildUpdatePayload } from "../context/missaoPayload";
import { formatSaveError } from "../context/saveErrors";
import type { MissaoDraft } from "../context/types";

type UpdateContext = { missaoId: number };

export function useUpdateMissaoDraft() {
   const queryClient = useQueryClient();
   const { push } = useToast();

   return useMutation<
      MissaoComEtapasDetail | null,
      Error,
      MissaoDraft,
      UpdateContext
   >({
      mutationFn: async (draft) => {
         if (!draft.serverId) {
            throw new Error("ID da missão necessário para edição");
         }
         const result = await updateMissaoWithEtapas(
            draft.serverId,
            buildUpdatePayload(draft)
         );
         if (!result.ok) {
            throw new ApiError(
               result.message ?? "Falha ao salvar missão",
               result.errors
            );
         }
         return result.data ?? null;
      },
      onSuccess: (data, draft) => {
         if (data && draft.serverId) {
            queryClient.setQueryData(["missao", draft.serverId], data);
         }
         queryClient.invalidateQueries({ queryKey: etapaKeys.all });
         push({
            type: "success",
            title: "Sucesso",
            message: "Missão atualizada com sucesso",
         });
      },
      onError: (err, draft) => {
         const { title, message } = formatSaveError(err, draft);
         push({ type: "error", title, message, duration: 12000 });
      },
   });
}
