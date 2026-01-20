import {
   useQuery,
   useMutation,
   useQueryClient,
   keepPreviousData,
} from "@tanstack/react-query";
import {
   getDiariaValores,
   getDiariaValorById,
   createDiariaValor,
   updateDiariaValor,
   deleteDiariaValor,
   type DiariaValorPublic,
   type DiariaValorCreate,
   type DiariaValorUpdate,
} from "services/routes/cegep/diarias";

// ========================================
// Query Keys - Centralizadas
// ========================================

export interface GetDiariaValoresParams {
   grupoCid?: number;
   grupoPg?: number;
   activeOnly?: boolean;
}

export const diariaValorKeys = {
   all: ["diaria-valores"] as const,
   lists: () => [...diariaValorKeys.all, "list"] as const,
   list: (filters?: GetDiariaValoresParams) =>
      [...diariaValorKeys.lists(), filters] as const,
   details: () => [...diariaValorKeys.all, "detail"] as const,
   detail: (id: number) => [...diariaValorKeys.details(), id] as const,
};

// ========================================
// Queries
// ========================================

/**
 * Lista de valores de diarias com filtros
 */
export function useDiariaValores(params?: GetDiariaValoresParams) {
   return useQuery({
      queryKey: diariaValorKeys.list(params),
      queryFn: () =>
         getDiariaValores(params?.grupoCid, params?.grupoPg, params?.activeOnly),
      placeholderData: keepPreviousData,
   });
}

/**
 * Detalhes de um valor de diaria especifico
 */
export function useDiariaValor(id: number | null | undefined) {
   return useQuery({
      queryKey: diariaValorKeys.detail(id!),
      queryFn: () => getDiariaValorById(id!),
      enabled: !!id,
   });
}

// ========================================
// Mutations
// ========================================

/**
 * Criar novo valor de diaria
 */
export function useCreateDiariaValor() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: (data: DiariaValorCreate) => createDiariaValor(data),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: diariaValorKeys.lists() });
      },
   });
}

/**
 * Atualizar valor de diaria existente
 */
export function useUpdateDiariaValor() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: ({ id, data }: { id: number; data: DiariaValorUpdate }) =>
         updateDiariaValor(id, data),
      onSuccess: (_, { id }) => {
         queryClient.invalidateQueries({ queryKey: diariaValorKeys.detail(id) });
         queryClient.invalidateQueries({ queryKey: diariaValorKeys.lists() });
      },
   });
}

/**
 * Deletar valor de diaria
 */
export function useDeleteDiariaValor() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: (id: number) => deleteDiariaValor(id),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: diariaValorKeys.lists() });
      },
   });
}
