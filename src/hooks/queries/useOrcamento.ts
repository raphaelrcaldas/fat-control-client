import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
   getOrcamento,
   getOrcamentoLogs,
   createOrcamento,
   updateOrcamento,
   OrcamentoAnualPayload,
} from "services/routes/cegep/orcamento";
import { comissKeys } from "./useComiss";

export const orcamentoKeys = {
   all: ["orcamento"] as const,
   byAno: (ano: number) => [...orcamentoKeys.all, "ano", ano] as const,
   logs: (id: number) => [...orcamentoKeys.all, "logs", id] as const,
};

export function useOrcamento(ano: number) {
   return useQuery({
      queryKey: orcamentoKeys.byAno(ano),
      queryFn: ({ signal }) => getOrcamento(ano, signal),
      enabled: !!ano,
   });
}

export function useOrcamentoLogs(id: number | null | undefined) {
   return useQuery({
      queryKey: orcamentoKeys.logs(id!),
      queryFn: ({ signal }) => getOrcamentoLogs(id!, signal),
      enabled: !!id,
   });
}

export function useCreateOrcamento() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: (payload: OrcamentoAnualPayload) => createOrcamento(payload),
      onSuccess: (_result, payload) => {
         queryClient.invalidateQueries({
            queryKey: orcamentoKeys.byAno(payload.ano_ref),
         });
         queryClient.invalidateQueries({
            queryKey: [...comissKeys.all, "summary"],
         });
      },
   });
}

export function useUpdateOrcamento() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: ({
         id,
         payload,
      }: {
         id: number;
         payload: OrcamentoAnualPayload;
         previousAnoRef?: number;
      }) => updateOrcamento(id, payload),
      onSuccess: (_result, vars) => {
         queryClient.invalidateQueries({
            queryKey: orcamentoKeys.byAno(vars.payload.ano_ref),
         });
         if (
            vars.previousAnoRef !== undefined &&
            vars.previousAnoRef !== vars.payload.ano_ref
         ) {
            queryClient.invalidateQueries({
               queryKey: orcamentoKeys.byAno(vars.previousAnoRef),
            });
         }
         queryClient.invalidateQueries({
            queryKey: orcamentoKeys.logs(vars.id),
         });
         queryClient.invalidateQueries({
            queryKey: [...comissKeys.all, "summary"],
         });
      },
   });
}
