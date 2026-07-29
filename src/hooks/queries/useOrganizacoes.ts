import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "services/Api";
import {
   getOrganizacoes,
   createOrganizacao,
   updateOrganizacao,
   deleteOrganizacao,
   type OrganizacaoCreate,
   type OrganizacaoUpdate,
} from "services/routes/organizacoes";

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

/**
 * Cadastrar organização.
 *
 * Falha vira `ApiError` para preservar o dict `errors` do 422 (campo →
 * mensagem), consumido em `organizacaoErrors` para marcar os inputs do
 * formulário.
 */
export function useCreateOrganizacao() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: async (data: OrganizacaoCreate) => {
         const result = await createOrganizacao(data);
         if (!result.ok) {
            throw new ApiError(
               result.message ?? "Erro ao criar organização",
               result.errors
            );
         }
         return result;
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: organizacaoKeys.list() });
      },
   });
}

/** Atualizar organização (ver useCreateOrganizacao sobre o erro). */
export function useUpdateOrganizacao() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: async ({
         sigla,
         data,
      }: {
         sigla: string;
         data: OrganizacaoUpdate;
      }) => {
         const result = await updateOrganizacao(sigla, data);
         if (!result.ok) {
            throw new ApiError(
               result.message ?? "Erro ao atualizar organização",
               result.errors
            );
         }
         return result;
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: organizacaoKeys.list() });
      },
   });
}

/** Excluir organização (ver useCreateOrganizacao sobre o erro). */
export function useDeleteOrganizacao() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: async (sigla: string) => {
         const result = await deleteOrganizacao(sigla);
         if (!result.ok) {
            throw new ApiError(
               result.message ?? "Erro ao excluir organização",
               result.errors
            );
         }
         return result;
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: organizacaoKeys.list() });
      },
   });
}
