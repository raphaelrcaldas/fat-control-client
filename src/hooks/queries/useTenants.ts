import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "services/Api";
import {
   getTenants,
   createTenant,
   updateTenant,
   deleteTenant,
   type TenantCreate,
   type TenantUpdate,
} from "services/routes/tenants";

// ========================================
// Query Keys
// ========================================

export const tenantKeys = {
   all: ["tenants"] as const,
   list: () => [...tenantKeys.all, "list"] as const,
};

// ========================================
// Queries
// ========================================

export function useTenants() {
   return useQuery({
      queryKey: tenantKeys.list(),
      queryFn: getTenants,
   });
}

// ========================================
// Mutations
// ========================================

export function useCreateTenant() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: async (data: TenantCreate) => {
         const result = await createTenant(data);
         if (!result.ok) {
            throw new ApiError(
               result.message ?? "Erro ao cadastrar tenant",
               result.errors
            );
         }
         return result;
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: tenantKeys.list() });
      },
   });
}

export function useUpdateTenant() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: async ({
         organizacaoId,
         data,
      }: {
         organizacaoId: string;
         data: TenantUpdate;
      }) => {
         const result = await updateTenant(organizacaoId, data);
         if (!result.ok) {
            throw new ApiError(
               result.message ?? "Erro ao atualizar tenant",
               result.errors
            );
         }
         return result;
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: tenantKeys.list() });
      },
   });
}

export function useDeleteTenant() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: async (organizacaoId: string) => {
         const result = await deleteTenant(organizacaoId);
         if (!result.ok) {
            throw new ApiError(
               result.message ?? "Erro ao excluir tenant",
               result.errors
            );
         }
         return result;
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: tenantKeys.list() });
      },
   });
}
