import {
   useQuery,
   useMutation,
   useQueryClient,
   keepPreviousData,
} from "@tanstack/react-query";
import {
   getTrips,
   addTrip,
   updateTrip,
   addCrewFunc,
   updateCrewFunc,
   deleteCrewFunc,
   GetTripsParams,
   CreateTripData,
   UpdateTripData,
} from "services/routes/trips";
import { CreateCrewFunc } from "services/routes/funcs";

// ========================================
// Query Keys - Centralizadas
// ========================================

export const tripKeys = {
   all: ["trips"] as const,
   lists: () => [...tripKeys.all, "list"] as const,
   list: (filters?: GetTripsParams) => [...tripKeys.lists(), filters] as const,
   details: () => [...tripKeys.all, "detail"] as const,
   detail: (id: number) => [...tripKeys.details(), id] as const,
};

// ========================================
// Queries
// ========================================

/**
 * Lista paginada de tripulantes com filtros
 */
export function useTrips(params?: GetTripsParams) {
   return useQuery({
      queryKey: tripKeys.list(params),
      queryFn: ({ signal }) => getTrips(params ?? {}, signal),
      placeholderData: keepPreviousData,
      staleTime: 0,
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

/**
 * Adicionar funcao a um tripulante
 */
export function useAddCrewFunc() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: ({
         tripId,
         data,
      }: {
         tripId: number;
         data: CreateCrewFunc;
      }) => addCrewFunc(tripId, data),
      onSuccess: (_, { tripId }) => {
         queryClient.invalidateQueries({ queryKey: tripKeys.detail(tripId) });
         queryClient.invalidateQueries({ queryKey: tripKeys.lists() });
      },
   });
}

/**
 * Atualizar funcao de tripulante
 */
export function useUpdateCrewFunc() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: ({
         funcId,
         data,
      }: {
         funcId: number;
         data: CreateCrewFunc;
      }) => updateCrewFunc(funcId, data),
      onSuccess: () => {
         // Invalida todas as listas pois nao sabemos qual trip foi afetado
         queryClient.invalidateQueries({ queryKey: tripKeys.lists() });
      },
   });
}

/**
 * Deletar funcao de tripulante
 */
export function useDeleteCrewFunc() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: (funcId: number) => deleteCrewFunc(funcId),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: tripKeys.lists() });
      },
   });
}
