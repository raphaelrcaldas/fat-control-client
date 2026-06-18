import {
   keepPreviousData,
   useMutation,
   useQuery,
   useQueryClient,
} from "@tanstack/react-query";
import {
   addUserRole,
   deleteUserRole,
   getRoles,
   getUsersRoles,
   updateUserRole,
} from "services/routes/security/roles";
import { sortByAntiguidade } from "utils/sortByAntiguidade";

// ========================================
// Query Keys
// ========================================

export const roleKeys = {
   all: ["roles"] as const,
   list: () => [...roleKeys.all, "list"] as const,
   usersRoles: () => [...roleKeys.all, "users"] as const,
};

// ========================================
// Queries
// ========================================

export function useUsersRoles() {
   return useQuery({
      queryKey: roleKeys.usersRoles(),
      queryFn: getUsersRoles,
      // Ordena por antiguidade sem mutar o cache (cópia nova)
      select: sortByAntiguidade,
      placeholderData: keepPreviousData,
   });
}

export function useRoles() {
   return useQuery({
      queryKey: roleKeys.list(),
      queryFn: getRoles,
   });
}

// ========================================
// Mutations
// ========================================

interface UserRoleVars {
   roleId: number;
   userId: number;
   organizacaoId: string | null;
}

export function useAddUserRole() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: ({ roleId, userId, organizacaoId }: UserRoleVars) =>
         addUserRole(roleId, userId, organizacaoId),
      onSuccess: (result) => {
         if (result.ok) {
            queryClient.invalidateQueries({ queryKey: roleKeys.usersRoles() });
         }
      },
   });
}

export function useUpdateUserRole() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: ({ roleId, userId, organizacaoId }: UserRoleVars) =>
         updateUserRole(roleId, userId, organizacaoId),
      onSuccess: (result) => {
         if (result.ok) {
            queryClient.invalidateQueries({ queryKey: roleKeys.usersRoles() });
         }
      },
   });
}

export function useDeleteUserRole() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: ({ roleId, userId, organizacaoId }: UserRoleVars) =>
         deleteUserRole(roleId, userId, organizacaoId),
      onSuccess: (result) => {
         if (result.ok) {
            queryClient.invalidateQueries({ queryKey: roleKeys.usersRoles() });
         }
      },
   });
}
