"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useToast } from "@/app/context/toast";
import { etapaKeys } from "@/hooks/queries/useEtapas";
import {
   createMissaoWithEtapas,
   type MissaoPublic,
} from "services/routes/estatistica/etapas";

import { buildMissaoPayload } from "../context/missaoPayload";
import type { MissaoDraft } from "../context/types";

export function useSaveMissaoDraft() {
   const queryClient = useQueryClient();
   const { push } = useToast();

   return useMutation<MissaoPublic, Error, MissaoDraft>({
      mutationFn: async (draft) => {
         const payload = buildMissaoPayload(draft);
         const result = await createMissaoWithEtapas(payload);
         if (!result.ok || !result.data) {
            throw new Error(result.message ?? "Falha ao salvar missão");
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
      onError: (err) => {
         push({
            type: "error",
            title: "Erro ao salvar",
            message: err.message ?? "Falha ao salvar missão",
         });
      },
   });
}
