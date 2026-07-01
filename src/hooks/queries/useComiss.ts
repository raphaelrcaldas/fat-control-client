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
   getComissSummary,
   ComissFilters,
   Comiss,
} from "services/routes/cegep/comiss";
import { ApiError } from "services/Api";

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
      mutationFn: async (data: Comiss) => {
         const result = await createCmto(data);
         if (!result.ok) {
            throw new ApiError(
               result.message ?? "Erro ao salvar o comissionamento",
               result.errors
            );
         }
         return result;
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: comissKeys.lists() });
         queryClient.invalidateQueries({
            queryKey: [...comissKeys.all, "summary"],
         });
      },
   });
}

/**
 * Atualizar comissionamento existente
 */
export function useUpdateComiss() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async (data: Comiss) => {
         const result = await updateCmto(data);
         if (!result.ok) {
            throw new ApiError(
               result.message ?? "Erro ao salvar o comissionamento",
               result.errors
            );
         }
         return result;
      },
      onSuccess: (_, data) => {
         if (data.id) {
            queryClient.invalidateQueries({
               queryKey: comissKeys.detail(data.id),
            });
         }
         queryClient.invalidateQueries({ queryKey: comissKeys.lists() });
         queryClient.invalidateQueries({
            queryKey: [...comissKeys.all, "summary"],
         });
      },
   });
}

/**
 * Excluir comissionamento (2 etapas)
 * Sem confirm: retorna preview com missoes vinculadas
 * Com confirm: executa exclusao em cascata
 */
export function useDeleteComiss() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async ({
         id,
         confirm,
      }: {
         id: number;
         confirm?: boolean;
      }) => {
         const result = await deleteCmto(id, confirm);
         if (!result.ok) {
            throw new ApiError(
               result.message ?? "Erro ao excluir comissionamento",
               result.errors
            );
         }
         return result;
      },
      onSuccess: (result) => {
         if (!result.data) {
            queryClient.invalidateQueries({ queryKey: comissKeys.lists() });
            queryClient.invalidateQueries({
               queryKey: [...comissKeys.all, "summary"],
            });
         }
      },
   });
}

/**
 * Retorna os totais e as listagens para a dashboard financeira de comissionamentos
 */
export function useComissSummary(ano: number) {
   return useQuery({
      queryKey: [...comissKeys.all, "summary", ano] as const,
      queryFn: ({ signal }) => getComissSummary(ano, signal),
      enabled: !!ano,
   });
}
