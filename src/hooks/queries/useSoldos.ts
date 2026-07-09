import {
   useQuery,
   useMutation,
   useQueryClient,
   keepPreviousData,
} from "@tanstack/react-query";
import {
   getSoldos,
   getSoldoStats,
   getSoldoById,
   createSoldo,
   updateSoldo,
   deleteSoldo,
   type SoldoPublic,
   type SoldoCreate,
   type SoldoUpdate,
} from "services/routes/admin/soldos";

// ========================================
// Query Keys - Centralizadas
// ========================================

export interface GetSoldosParams {
   circulo?: string;
   activeOnly?: boolean;
}

export const soldoKeys = {
   all: ["soldos"] as const,
   lists: () => [...soldoKeys.all, "list"] as const,
   list: (filters?: GetSoldosParams) =>
      [...soldoKeys.lists(), filters] as const,
   details: () => [...soldoKeys.all, "detail"] as const,
   detail: (id: number) => [...soldoKeys.details(), id] as const,
   stats: (circulo?: string) => [...soldoKeys.all, "stats", circulo] as const,
};

// ========================================
// Queries
// ========================================

/**
 * Lista de soldos com filtros
 */
export function useSoldos(params?: GetSoldosParams) {
   return useQuery({
      queryKey: soldoKeys.list(params),
      queryFn: () => getSoldos(params?.circulo, params?.activeOnly),
      placeholderData: keepPreviousData,
   });
}

/**
 * Estatisticas dos soldos
 */
export function useSoldoStats(circulo?: string) {
   return useQuery({
      queryKey: soldoKeys.stats(circulo),
      queryFn: () => getSoldoStats(circulo),
   });
}

/**
 * Detalhes de um soldo especifico
 */
export function useSoldo(id: number | null | undefined) {
   return useQuery({
      queryKey: soldoKeys.detail(id!),
      queryFn: () => getSoldoById(id!),
      enabled: !!id,
   });
}

// ========================================
// Mutations
// ========================================

/**
 * Criar novo soldo
 */
export function useCreateSoldo() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: (data: SoldoCreate) => createSoldo(data),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: soldoKeys.lists() });
         queryClient.invalidateQueries({ queryKey: soldoKeys.all });
      },
   });
}

/**
 * Atualizar soldo existente
 */
export function useUpdateSoldo() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: ({ id, data }: { id: number; data: SoldoUpdate }) =>
         updateSoldo(id, data),
      onSuccess: (_, { id }) => {
         queryClient.invalidateQueries({ queryKey: soldoKeys.detail(id) });
         queryClient.invalidateQueries({ queryKey: soldoKeys.lists() });
         queryClient.invalidateQueries({ queryKey: soldoKeys.all });
      },
   });
}

/**
 * Deletar soldo
 */
export function useDeleteSoldo() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: (id: number) => deleteSoldo(id),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: soldoKeys.lists() });
         queryClient.invalidateQueries({ queryKey: soldoKeys.all });
      },
   });
}
