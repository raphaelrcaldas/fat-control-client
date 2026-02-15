import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
   getResources,
   getPermissions,
   createResource,
   updateResource,
   deleteResource,
   createPermission,
   updatePermission,
   deletePermission,
   type ResourceCreate,
   type ResourceUpdate,
   type PermissionCreate,
   type PermissionUpdate,
} from "services/routes/security/resources";
import {
   getRoles,
   addRolePermission,
   removeRolePermission,
} from "services/routes/security/roles";

// ========================================
// Query Keys
// ========================================

export const securityKeys = {
   all: ["security"] as const,
   resources: () => [...securityKeys.all, "resources"] as const,
   permissions: () => [...securityKeys.all, "permissions"] as const,
   roles: () => [...securityKeys.all, "roles"] as const,
};

// ========================================
// Queries
// ========================================

export function useResources() {
   return useQuery({
      queryKey: securityKeys.resources(),
      queryFn: getResources,
   });
}

export function usePermissions() {
   return useQuery({
      queryKey: securityKeys.permissions(),
      queryFn: () => getPermissions(),
   });
}

export function useRoles() {
   return useQuery({
      queryKey: securityKeys.roles(),
      queryFn: getRoles,
   });
}

// ========================================
// Resource Mutations
// ========================================

export function useCreateResource() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: (data: ResourceCreate) => createResource(data),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: securityKeys.resources() });
      },
   });
}

export function useUpdateResource() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: ({ id, data }: { id: number; data: ResourceUpdate }) =>
         updateResource(id, data),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: securityKeys.resources() });
      },
   });
}

export function useDeleteResource() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: (id: number) => deleteResource(id),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: securityKeys.resources() });
      },
   });
}

// ========================================
// Permission Mutations
// ========================================

export function useCreatePermission() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: (data: PermissionCreate) => createPermission(data),
      onSuccess: () => {
         queryClient.invalidateQueries({
            queryKey: securityKeys.permissions(),
         });
      },
   });
}

export function useUpdatePermission() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: ({ id, data }: { id: number; data: PermissionUpdate }) =>
         updatePermission(id, data),
      onSuccess: () => {
         queryClient.invalidateQueries({
            queryKey: securityKeys.permissions(),
         });
      },
   });
}

export function useDeletePermission() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: (id: number) => deletePermission(id),
      onSuccess: () => {
         queryClient.invalidateQueries({
            queryKey: securityKeys.permissions(),
         });
      },
   });
}

// ========================================
// Role-Permission Mutations
// ========================================

export function useAddRolePermission() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: ({
         roleId,
         permissionId,
      }: {
         roleId: number;
         permissionId: number;
      }) => addRolePermission(roleId, permissionId),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: securityKeys.roles() });
      },
   });
}

export function useRemoveRolePermission() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: ({
         roleId,
         permissionId,
      }: {
         roleId: number;
         permissionId: number;
      }) => removeRolePermission(roleId, permissionId),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: securityKeys.roles() });
      },
   });
}
