import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
   getOrganizacoes,
   createOrganizacao,
   updateOrganizacao,
   deleteOrganizacao,
   uploadBrasao,
   deleteBrasao,
   type OrganizacaoCreate,
   type OrganizacaoUpdate,
} from "services/routes/organizacoes";
import { tenantKeys } from "./useTenants";

// ========================================
// Query Keys
// ========================================

export const organizacaoKeys = {
   all: ["organizacoes"] as const,
   list: () => [...organizacaoKeys.all, "list"] as const,
};

// ========================================
// Queries
// ========================================

export function useOrganizacoes() {
   return useQuery({
      queryKey: organizacaoKeys.list(),
      queryFn: getOrganizacoes,
      // Diretório de organizações é dado de referência (muda raramente).
      // Mantém fresco pela sessão inteira; create/update/delete invalidam
      // a lista explicitamente, então a edição continua refletindo.
      staleTime: Infinity,
   });
}

// ========================================
// Mutations
// ========================================

export function useCreateOrganizacao() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: (data: OrganizacaoCreate) => createOrganizacao(data),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: organizacaoKeys.list() });
      },
   });
}

export function useUpdateOrganizacao() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: ({
         sigla,
         data,
      }: {
         sigla: string;
         data: OrganizacaoUpdate;
      }) => updateOrganizacao(sigla, data),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: organizacaoKeys.list() });
      },
   });
}

export function useDeleteOrganizacao() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: (sigla: string) => deleteOrganizacao(sigla),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: organizacaoKeys.list() });
      },
   });
}

// O brasão aparece tanto na lista de organizações quanto embutido em
// `tenant.organizacao`, então ambas as caches são invalidadas.
function invalidateOrgAndTenants(
   queryClient: ReturnType<typeof useQueryClient>
) {
   queryClient.invalidateQueries({ queryKey: organizacaoKeys.list() });
   queryClient.invalidateQueries({ queryKey: tenantKeys.list() });
}

export function useUploadBrasao() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: ({ sigla, file }: { sigla: string; file: File }) =>
         uploadBrasao(sigla, file),
      onSuccess: () => invalidateOrgAndTenants(queryClient),
   });
}

export function useDeleteBrasao() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: (sigla: string) => deleteBrasao(sigla),
      onSuccess: () => invalidateOrgAndTenants(queryClient),
   });
}
