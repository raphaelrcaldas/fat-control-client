import {
   useQuery,
   useMutation,
   useQueryClient,
   keepPreviousData,
} from "@tanstack/react-query";
import {
   getCrewIndisps,
   getIndispByUser,
   addIndisp,
   updateIndisp,
   deleteIndisp,
   IndispType,
   IndispFilters,
} from "services/routes/indisps";

// ========================================
// Query Keys - Centralizadas
// ========================================

export const indispKeys = {
   all: ["indisps"] as const,
   lists: () => [...indispKeys.all, "list"] as const,
   list: (filters?: IndispFilters) => [...indispKeys.lists(), filters] as const,
   byFunc: (func: string) => [...indispKeys.all, "func", func] as const,
   byUser: (userId: number, filters?: IndispFilters) =>
      [...indispKeys.all, "user", userId, filters] as const,
};

// ========================================
// Queries
// ========================================

/**
 * Lista indisponibilidades por funcao e UAE
 * Usado na tabela principal (page.tsx)
 * - staleTime: 0 = dados sempre stale, refetch em toda mudanca
 * - placeholderData: keepPreviousData = mantem dados anteriores durante fetch
 * - refetchOnMount: 'always' = sempre refetch ao montar
 */
export function useCrewIndisps(func: string) {
   return useQuery({
      queryKey: indispKeys.byFunc(func),
      queryFn: ({ signal }) => getCrewIndisps(func, signal),
      staleTime: 0,
      refetchOnMount: "always",
      placeholderData: keepPreviousData,
   });
}

/**
 * Lista indisponibilidades de um usuario especifico com filtros
 * Usado no modal de tripulante (tripIndisp.tsx)
 * - staleTime: 0 = dados sempre stale, refetch em toda mudanca
 * - placeholderData: keepPreviousData = mantem dados anteriores durante fetch
 */
export function useUserIndisps(
   userId: number | null | undefined,
   filters?: IndispFilters,
   enabled: boolean = true
) {
   return useQuery({
      queryKey: indispKeys.byUser(userId!, filters),
      queryFn: ({ signal }) => getIndispByUser(userId!, filters, signal),
      enabled: !!userId && enabled,
      staleTime: 0,
      placeholderData: keepPreviousData,
   });
}

// ========================================
// Mutations
// ========================================

/**
 * Criar nova indisponibilidade
 */
export function useCreateIndisp() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: (data: IndispType) => addIndisp(data),
      onSuccess: () => {
         // Invalida todas as queries de indisps
         queryClient.invalidateQueries({ queryKey: indispKeys.all });
      },
   });
}

/**
 * Atualizar indisponibilidade existente
 */
export function useUpdateIndisp() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: (data: IndispType) => updateIndisp(data),
      onSuccess: () => {
         // Invalida todas as queries de indisps
         queryClient.invalidateQueries({ queryKey: indispKeys.all });
      },
   });
}

/**
 * Excluir indisponibilidade
 */
export function useDeleteIndisp() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: (id: number) => deleteIndisp(id),
      onSuccess: () => {
         // Invalida todas as queries de indisps
         queryClient.invalidateQueries({ queryKey: indispKeys.all });
      },
   });
}
