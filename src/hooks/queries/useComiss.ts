import {
   useQuery,
   useMutation,
   useQueryClient,
   keepPreviousData,
} from "@tanstack/react-query";
import {
   getCmtos,
   getCmtoById,
   createCmto,
   updateCmto,
   deleteCmto,
   ComissFilters,
   Comiss,
} from "services/routes/cegep/comiss";

// ========================================
// Query Keys - Centralizadas
// ========================================

export const comissKeys = {
   all: ["comiss"] as const,
   lists: () => [...comissKeys.all, "list"] as const,
   list: (filters?: ComissFilters) => [...comissKeys.lists(), filters] as const,
   details: () => [...comissKeys.all, "detail"] as const,
   detail: (id: number) => [...comissKeys.details(), id] as const,
};

// ========================================
// Queries
// ========================================

/**
 * Lista de comissionamentos com filtros
 * Usa keepPreviousData para transicao suave entre filtros
 */
export function useComissList(filters?: ComissFilters) {
   return useQuery({
      queryKey: comissKeys.list(filters),
      queryFn: ({ signal }) => getCmtos(filters, signal),
      placeholderData: keepPreviousData,
   });
}

/**
 * Detalhes de um comissionamento com missoes
 * gcTime: 0 remove cache ao fechar, forcando novo fetch ao reabrir
 * Ideal para trabalho colaborativo
 */
export function useComissDetail(id: number | null | undefined) {
   return useQuery({
      queryKey: comissKeys.detail(id!),
      queryFn: ({ signal }) => getCmtoById(id!, signal),
      enabled: !!id,
      gcTime: 0,
   });
}

// ========================================
// Mutations
// ========================================

/**
 * Criar novo comissionamento
 */
export function useCreateComiss() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: (data: Comiss) => createCmto(data),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: comissKeys.lists() });
      },
   });
}

/**
 * Atualizar comissionamento existente
 */
export function useUpdateComiss() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: (data: Comiss) => updateCmto(data),
      onSuccess: (_, data) => {
         if (data.id) {
            queryClient.invalidateQueries({
               queryKey: comissKeys.detail(data.id),
            });
         }
         queryClient.invalidateQueries({ queryKey: comissKeys.lists() });
      },
   });
}

/**
 * Excluir comissionamento
 */
export function useDeleteComiss() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: (id: number) => deleteCmto(id),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: comissKeys.lists() });
      },
   });
}
