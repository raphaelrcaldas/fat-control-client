import {
   useQuery,
   useMutation,
   useQueryClient,
   keepPreviousData,
} from "@tanstack/react-query";
import {
   getPropostas,
   getProposta,
   createProposta,
   updateProposta,
   deleteProposta,
   GetPropostasParams,
   PropostaCreatePayload,
   PropostaUpdatePayload,
} from "services/routes/cegep/propostas";
import { ApiError } from "services/Api";

// ========================================
// Query Keys - Centralizadas
// ========================================

export const propostaKeys = {
   all: ["propostas"] as const,
   lists: () => [...propostaKeys.all, "list"] as const,
   list: (params?: GetPropostasParams) =>
      [...propostaKeys.lists(), params] as const,
   details: () => [...propostaKeys.all, "detail"] as const,
   detail: (id: number) => [...propostaKeys.details(), id] as const,
};

// ========================================
// Queries
// ========================================

/** Lista de propostas (aba Propostas), filtrável por exercício. */
export function usePropostas(params?: GetPropostasParams) {
   return useQuery({
      queryKey: propostaKeys.list(params),
      queryFn: ({ signal }) => getPropostas(params, signal),
      placeholderData: keepPreviousData,
   });
}

/**
 * Baseline de uma proposta para o sandbox.
 *
 * `staleTime: Infinity` + `refetchOnWindowFocus: false` são deliberados: o
 * draft em edição é inicializado a partir daqui, e um refetch em background
 * atropelaria alterações não salvas. Depois de salvar, quem re-sincroniza é o
 * `setQueryData` de `useUpdateProposta` — nunca um invalidate.
 */
export function useProposta(id: number | null | undefined) {
   return useQuery({
      queryKey: propostaKeys.detail(id!),
      queryFn: ({ signal }) => getProposta(id!, signal),
      enabled: !!id,
      staleTime: Infinity,
      refetchOnWindowFocus: false,
   });
}

// ========================================
// Mutations
// ========================================

/** Criar proposta (nome + exercício). */
export function useCreateProposta() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async (payload: PropostaCreatePayload) => {
         const result = await createProposta(payload);
         if (!result.ok) {
            throw new ApiError(
               result.message ?? "Erro ao criar a proposta",
               result.errors
            );
         }
         return result;
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: propostaKeys.lists() });
      },
   });
}

/**
 * Salvar a proposta inteira (nome, exercício e cenários).
 *
 * O eco da resposta (com os ids recém-atribuídos) entra no cache via
 * `setQueryData`; invalidar o detail dispararia um refetch capaz de atropelar
 * o draft ainda montado na tela.
 */
export function useUpdateProposta() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async ({
         id,
         payload,
      }: {
         id: number;
         payload: PropostaUpdatePayload;
      }) => {
         const result = await updateProposta(id, payload);
         if (!result.ok) {
            throw new ApiError(
               result.message ?? "Erro ao salvar a proposta",
               result.errors
            );
         }
         return result;
      },
      onSuccess: (result, vars) => {
         if (result.data) {
            queryClient.setQueryData(propostaKeys.detail(vars.id), result.data);
         }
         queryClient.invalidateQueries({ queryKey: propostaKeys.lists() });
      },
   });
}

/** Excluir proposta. */
export function useDeleteProposta() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async (id: number) => {
         const result = await deleteProposta(id);
         if (!result.ok) {
            throw new ApiError(
               result.message ?? "Erro ao excluir a proposta",
               result.errors
            );
         }
         return result;
      },
      onSuccess: (_result, id) => {
         queryClient.invalidateQueries({ queryKey: propostaKeys.lists() });
         queryClient.removeQueries({ queryKey: propostaKeys.detail(id) });
      },
   });
}
