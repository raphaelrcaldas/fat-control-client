import {
   useQuery,
   useMutation,
   useQueryClient,
   keepPreviousData,
} from "@tanstack/react-query";
import {
   getFragMissoes,
   getFragMissao,
   createUpdateFragMis,
   deleteFragMis,
   MissoesRequest,
   Missao,
} from "services/routes/cegep/missoes";
import { ApiError } from "services/Api";
import { comissKeys } from "./useComiss";

// ========================================
// Query Keys - Centralizadas
// ========================================

export const missaoKeys = {
   all: ["missoes-cegep"] as const,
   lists: () => [...missaoKeys.all, "list"] as const,
   list: (filters?: Partial<MissoesRequest>) =>
      [...missaoKeys.lists(), filters] as const,
   details: () => [...missaoKeys.all, "detail"] as const,
   detail: (id: number) => [...missaoKeys.details(), id] as const,
};

// ========================================
// Queries
// ========================================

/**
 * Lista paginada de missoes com filtros
 * Usa keepPreviousData para paginacao suave
 */
export function useMissoes(filters?: Partial<MissoesRequest>) {
   return useQuery({
      queryKey: missaoKeys.list(filters),
      queryFn: ({ signal }) => getFragMissoes(filters, signal),
      placeholderData: keepPreviousData,
   });
}

/**
 * Buscar uma missão específica por ID
 */
export function useMissao(id: number) {
   return useQuery({
      queryKey: missaoKeys.detail(id),
      queryFn: ({ signal }) => getFragMissao(id, signal),
      enabled: !!id && id > 0,
   });
}

// ========================================
// Mutations
// ========================================

/**
 * Criar ou atualizar missao (unificado conforme API backend)
 */
export function useCreateUpdateMissao() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async (data: Missao) => {
         const result = await createUpdateFragMis(data);
         if (!result.ok) {
            throw new ApiError(
               result.message ?? "Erro ao salvar missão",
               result.errors
            );
         }
         return result;
      },
      onSuccess: async (response, data) => {
         queryClient.invalidateQueries({ queryKey: missaoKeys.lists() });
         queryClient.invalidateQueries({
            queryKey: [...comissKeys.all, "summary"],
         });
         // Invalida o detalhe (inclui logs) ao editar uma missão existente
         if (data.id) {
            queryClient.invalidateQueries({
               queryKey: missaoKeys.detail(data.id),
            });
         }
         return response;
      },
   });
}

/**
 * Excluir missao
 */
export function useDeleteMissao() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async (id: number) => {
         const result = await deleteFragMis(id);
         if (!result.ok) {
            throw new ApiError(
               result.message ?? "Erro ao deletar missão",
               result.errors
            );
         }
         return result;
      },
      onSuccess: () => {
         // Invalida todas as listas de missoes
         queryClient.invalidateQueries({ queryKey: missaoKeys.lists() });
         queryClient.invalidateQueries({
            queryKey: [...comissKeys.all, "summary"],
         });
      },
   });
}
