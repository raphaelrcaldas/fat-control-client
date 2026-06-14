import { useQuery } from "@tanstack/react-query";
import { getUserActionLogs } from "services/routes/logs";

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
   });
}
