import {
   useQuery,
   useMutation,
   useQueryClient,
   keepPreviousData,
} from "@tanstack/react-query";
import {
   createEtapa,
   createMissao,
   deleteEtapa,
   deleteMissao,
   getEtapaDetail,
   getEtapas,
   updateEtapa,
   updateMissao,
   type EtapaCreatePayload,
   type EtapaUpdatePayload,
   type GetEtapasParams,
   type MissaoCreate,
   type MissaoUpdate,
} from "services/routes/estatistica/etapas";

// ========================================
// Query Keys - Centralizadas
// ========================================

export const etapaKeys = {
   all: ["etapas"] as const,
   lists: () => [...etapaKeys.all, "list"] as const,
   list: (filters?: GetEtapasParams) =>
      [...etapaKeys.lists(), filters] as const,
   details: () => [...etapaKeys.all, "detail"] as const,
   detail: (id: number) => [...etapaKeys.details(), id] as const,
};

// ========================================
// Queries
// ========================================

/**
 * Lista paginada de missoes com etapas e filtros
 */
export function useEtapas(params?: GetEtapasParams) {
   return useQuery({
      queryKey: etapaKeys.list(params),
      queryFn: ({ signal }) => getEtapas(params, signal),
      placeholderData: keepPreviousData,
   });
}

/**
 * Detalhe completo de uma etapa (com tripulantes)
 */
export function useEtapaDetail(id: number | null) {
   return useQuery({
      queryKey: etapaKeys.detail(id!),
      queryFn: ({ signal }) => getEtapaDetail(id!, signal),
      enabled: !!id,
      gcTime: 0,
   });
}

// ========================================
// Mutations - Missao CRUD
// ========================================

export function useCreateMissao() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: (data: MissaoCreate) => createMissao(data),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: etapaKeys.lists() });
      },
   });
}

export function useUpdateMissao() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: ({ id, data }: { id: number; data: MissaoUpdate }) =>
         updateMissao(id, data),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: etapaKeys.lists() });
      },
   });
}

export function useDeleteEstatMissao() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: (id: number) => deleteMissao(id),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: etapaKeys.lists() });
      },
   });
}

// ========================================
// Mutations - Etapa CRUD
// ========================================

export function useCreateEtapa() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: (data: EtapaCreatePayload) => createEtapa(data),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: etapaKeys.lists() });
      },
   });
}

export function useUpdateEtapa() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: ({ id, data }: { id: number; data: EtapaUpdatePayload }) =>
         updateEtapa(id, data),
      onSuccess: (_, { id }) => {
         queryClient.invalidateQueries({ queryKey: etapaKeys.lists() });
         queryClient.invalidateQueries({ queryKey: etapaKeys.detail(id) });
      },
   });
}

export function useDeleteEtapa() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: (id: number) => deleteEtapa(id),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: etapaKeys.lists() });
      },
   });
}
