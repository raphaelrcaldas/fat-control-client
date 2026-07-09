import {
   useQuery,
   useMutation,
   useQueryClient,
   keepPreviousData,
} from "@tanstack/react-query";
import {
   getTrips,
   getTripUserIds,
   addTrip,
   updateTrip,
   GetTripsParams,
   CreateTripData,
   UpdateTripData,
} from "services/routes/trips";

// ========================================
// Query Keys - Centralizadas
// ========================================

export const tripKeys = {
   all: ["trips"] as const,
   lists: () => [...tripKeys.all, "list"] as const,
   list: (filters?: GetTripsParams) => [...tripKeys.lists(), filters] as const,
   userIds: () => [...tripKeys.all, "user-ids"] as const,
   details: () => [...tripKeys.all, "detail"] as const,
   detail: (id: number) => [...tripKeys.details(), id] as const,
};

// ========================================
// Queries
// ========================================

/**
 * Lista paginada de tripulantes com filtros
 */
export function useTrips(params?: GetTripsParams, enabled = true) {
   return useQuery({
      queryKey: tripKeys.list(params),
      queryFn: ({ signal }) => getTrips(params ?? {}, signal),
      placeholderData: keepPreviousData,
      staleTime: 0,
      enabled,
   });
}

/**
 * Busca de tripulantes por função para comboboxes.
 * Ativada apenas com 2+ caracteres; mantém resultados anteriores
 * durante o refetch para evitar flicker do dropdown.
 */
export function useTripSearch(funcao: string, search: string) {
   const term = search.trim();

   return useQuery({
      queryKey: tripKeys.list({ func: [funcao], search: term }),
      queryFn: ({ signal }) =>
         getTrips({ func: [funcao], search: term }, signal),
      enabled: term.length >= 2,
      staleTime: 60_000,
      placeholderData: keepPreviousData,
   });
}

/**
 * IDs de usuários que já são tripulantes na org ativa (do token)
 */
export function useTripUserIds() {
   return useQuery({
      queryKey: tripKeys.userIds(),
      queryFn: () => getTripUserIds(),
   });
}

// ========================================
// Mutations
// ========================================

/**
 * Criar novo tripulante
 */
export function useCreateTrip() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: (data: CreateTripData) => addTrip(data),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: tripKeys.lists() });
         queryClient.invalidateQueries({ queryKey: tripKeys.all });
      },
   });
}

/**
 * Atualizar tripulante existente
 */
export function useUpdateTrip() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: ({ id, data }: { id: number; data: UpdateTripData }) =>
         updateTrip(id, data),
      onSuccess: (_, { id }) => {
         queryClient.invalidateQueries({ queryKey: tripKeys.detail(id) });
         queryClient.invalidateQueries({ queryKey: tripKeys.lists() });
      },
   });
}
