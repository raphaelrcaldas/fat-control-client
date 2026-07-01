"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useToast } from "@/app/context/toast";
import { etapaKeys } from "@/hooks/queries/useEtapas";
import { ApiError } from "services/Api";
import {
   createMissaoWithEtapas,
   type MissaoPublic,
} from "services/routes/estatistica/etapas";

import { buildMissaoPayload } from "../context/missaoPayload";
import { formatSaveError } from "../context/saveErrors";
import type { MissaoDraft } from "../context/types";

export function useSaveMissaoDraft() {
   const queryClient = useQueryClient();
   const { push } = useToast();

   return useMutation<MissaoPublic, Error, MissaoDraft>({
      mutationFn: async (draft) => {
         const payload = buildMissaoPayload(draft);
         const result = await createMissaoWithEtapas(payload);
         if (!result.ok || !result.data) {
            throw new ApiError(
               result.message ?? "Falha ao salvar missão",
               result.errors
            );
         }
         return result.data;
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: etapaKeys.all });
         push({
            type: "success",
            title: "Sucesso",
            message: "Missão criada com sucesso",
         });
      },
      onError: (err, draft) => {
         const { title, message } = formatSaveError(err, draft);
         push({ type: "error", title, message, duration: 12000 });
      },
   });
}
