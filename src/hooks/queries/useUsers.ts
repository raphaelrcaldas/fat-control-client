import {
   useQuery,
   useMutation,
   useQueryClient,
   keepPreviousData,
} from "@tanstack/react-query";
import {
   getUsers,
   getUserById,
   addUser,
   updateUser,
   resetPassword,
   GetUsersParams,
   UserSchema,
} from "services/routes/users";
import { getUserActionLogs } from "services/routes/logs";

// ========================================
// Query Keys - Centralizadas
// ========================================

export const userKeys = {
   all: ["users"] as const,
   lists: () => [...userKeys.all, "list"] as const,
   list: (filters?: GetUsersParams) => [...userKeys.lists(), filters] as const,
   details: () => [...userKeys.all, "detail"] as const,
   detail: (id: number) => [...userKeys.details(), id] as const,
   logs: (id: number) => [...userKeys.detail(id), "logs"] as const,
};

// ========================================
// Queries
// ========================================

/**
 * Lista paginada de usuários com filtros
 */
export function useUsers(params?: GetUsersParams) {
   return useQuery({
      queryKey: userKeys.list(params),
      queryFn: ({ signal }) => getUsers(params, signal),
      placeholderData: keepPreviousData,
   });
}

/**
 * Detalhes completos de um usuário
 */
export function useUser(id: number | null | undefined) {
   return useQuery({
      queryKey: userKeys.detail(id!),
      queryFn: () => getUserById(id!),
      enabled: !!id,
   });
}

/**
 * Logs de auditoria de um usuário
 */
export function useUserLogs(id: number | null | undefined) {
   return useQuery({
      queryKey: userKeys.logs(id!),
      queryFn: () =>
         getUserActionLogs({
            resource: "user",
            resource_id: id!,
         }),
      enabled: !!id,
   });
}

// ========================================
// Mutations
// ========================================

/**
 * Criar novo usuário
 */
export function useCreateUser() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: (data: UserSchema) => addUser(data),
      onSuccess: () => {
         // Invalida todas as listas de usuários
         queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      },
   });
}

/**
 * Atualizar usuário existente
 */
export function useUpdateUser() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: ({ id, data }: { id: number; data: Partial<UserSchema> }) =>
         updateUser(id, data),
      onSuccess: (_, { id }) => {
         // Invalida o detalhe específico, lista e logs
         queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
         queryClient.invalidateQueries({ queryKey: userKeys.lists() });
         queryClient.invalidateQueries({ queryKey: userKeys.logs(id) });
      },
   });
}

/**
 * Resetar senha de usuário
 */
export function useResetPassword() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: (userId: number) => resetPassword(userId),
      onSuccess: (_, userId) => {
         // Invalida logs pois reset de senha gera log
         queryClient.invalidateQueries({ queryKey: userKeys.logs(userId) });
      },
   });
}
