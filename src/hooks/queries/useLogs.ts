import {
   keepPreviousData,
   useMutation,
   useQuery,
   useQueryClient,
} from "@tanstack/react-query";
import { deleteUserActionLog, getUserActionLogs } from "services/routes/logs";

interface UserActionLogFilters {
   user_id?: number;
   resource?: string;
   resource_id?: number;
   action?: string;
   start?: string;
   end?: string;
}

// ========================================
// Query Keys
// ========================================

export const logKeys = {
   all: ["logs"] as const,
   userActions: (filters?: UserActionLogFilters) =>
      [...logKeys.all, "user-actions", filters] as const,
};

// ========================================
// Queries
// ========================================

/**
 * Logs de ações de usuário sobre um recurso.
 * Usado no histórico de alterações (ex.: IndispForm).
 */
export function useUserActionLogs(
   filters: UserActionLogFilters,
   enabled: boolean = true
) {
   return useQuery({
      queryKey: logKeys.userActions(filters),
      queryFn: () => getUserActionLogs(filters),
      enabled,
      staleTime: 30_000,
      placeholderData: keepPreviousData,
   });
}

// ========================================
// Mutations
// ========================================

/**
 * Exclui um log de ação de usuário e invalida a listagem.
 */
export function useDeleteUserActionLog() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: (id: number) => deleteUserActionLog(id),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: logKeys.all });
      },
   });
}
