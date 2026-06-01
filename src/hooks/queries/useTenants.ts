import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
      mutationFn: (data: TenantCreate) => createTenant(data),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: tenantKeys.list() });
      },
   });
}

export function useUpdateTenant() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: ({
         organizacaoId,
         data,
      }: {
         organizacaoId: string;
         data: TenantUpdate;
      }) => updateTenant(organizacaoId, data),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: tenantKeys.list() });
      },
   });
}

export function useDeleteTenant() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: (organizacaoId: string) => deleteTenant(organizacaoId),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: tenantKeys.list() });
      },
   });
}
