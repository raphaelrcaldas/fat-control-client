import {
   useQuery,
   useMutation,
   useQueryClient,
   keepPreviousData,
} from "@tanstack/react-query";
import {
   getQuads,
   getQuadById,
   getQuadsType,
   addQuad,
   updateQuad,
   deleteQuad,
   QuadParams,
   Quad,
} from "services/routes/quads";

// ========================================
// Query Keys - Centralizadas
// ========================================

export const quadKeys = {
   all: ["quads"] as const,
   lists: () => [...quadKeys.all, "list"] as const,
   list: (filters?: QuadParams) => [...quadKeys.lists(), filters] as const,
   types: () => [...quadKeys.all, "types"] as const,
   type: (uae: string) => [...quadKeys.types(), uae] as const,
   details: () => [...quadKeys.all, "detail"] as const,
   detail: (tripId: number, typeId: number) =>
      [...quadKeys.details(), tripId, typeId] as const,
};

// ========================================
// Queries
// ========================================

/**
 * Lista de quads com filtros (função + tipo + uae + proj)
 */
export function useQuads(params?: QuadParams) {
   return useQuery({
      queryKey: quadKeys.list(params),
      queryFn: () => getQuads(params!),
      placeholderData: keepPreviousData,
      enabled: !!(params?.funcao && params?.tipo_quad),
      staleTime: 0,
   });
}

/**
 * Quads de um tripulante específico por tipo
 */
export function useQuadsByTrip(
   tripId: number | undefined,
   typeId: number | undefined,
   enabled: boolean = true
) {
   return useQuery({
      queryKey: quadKeys.detail(tripId!, typeId!),
      queryFn: () => getQuadById(tripId!, typeId!),
      enabled: enabled && !!tripId && !!typeId,
      staleTime: 0,
   });
}

/**
 * Tipos de quadrinhos disponíveis por UAE
 */
export function useQuadsTypes(uae: string) {
   return useQuery({
      queryKey: quadKeys.type(uae),
      queryFn: () => getQuadsType(uae),
      staleTime: 0,
   });
}

// ========================================
// Mutations
// ========================================

/**
 * Criar novo(s) quad(s)
 */
export function useCreateQuad() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: (data: Quad[]) => addQuad(data),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: quadKeys.lists() });
         queryClient.invalidateQueries({ queryKey: quadKeys.details() });
      },
   });
}

/**
 * Atualizar quad existente
 */
export function useUpdateQuad() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: (data: Quad) => updateQuad(data),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: quadKeys.lists() });
         queryClient.invalidateQueries({ queryKey: quadKeys.details() });
      },
   });
}

/**
 * Deletar quad(s) - aceita array de IDs para delete em lote
 */
export function useDeleteQuad() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: (ids: number[]) => deleteQuad(ids),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: quadKeys.lists() });
         queryClient.invalidateQueries({ queryKey: quadKeys.details() });
      },
   });
}
