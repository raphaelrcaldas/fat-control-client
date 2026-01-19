import {
   useQuery,
   useMutation,
   useQueryClient,
   keepPreviousData,
} from "@tanstack/react-query";
import {
   getFragMissoes,
   createUpdateFragMis,
   deleteFragMis,
   MissoesRequest,
   Missao,
} from "services/routes/cegep/missoes";

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

// ========================================
// Mutations
// ========================================

/**
 * Criar ou atualizar missao (unificado conforme API backend)
 */
export function useCreateUpdateMissao() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: (data: Missao) => createUpdateFragMis(data),
      onSuccess: async (response) => {
         // Invalida todas as listas de missoes
         queryClient.invalidateQueries({ queryKey: missaoKeys.lists() });
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
      mutationFn: (id: number) => deleteFragMis(id),
      onSuccess: () => {
         // Invalida todas as listas de missoes
         queryClient.invalidateQueries({ queryKey: missaoKeys.lists() });
      },
   });
}
