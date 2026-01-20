import {
   useQuery,
   useMutation,
   useQueryClient,
   keepPreviousData,
} from "@tanstack/react-query";
import {
   getDadosBancarios,
   createDadosBancarios,
   updateDadosBancarios,
   deleteDadosBancarios,
   GetDadosBancariosParams,
   DadosBancariosCreate,
   DadosBancariosUpdate,
} from "services/routes/cegep/dadosBancarios";
import { sortByAntiguidade } from "utils/sortByAntiguidade";

// ========================================
// Query Keys - Centralizadas
// ========================================

export const dadosBancariosKeys = {
   all: ["dadosBancarios"] as const,
   lists: () => [...dadosBancariosKeys.all, "list"] as const,
   list: (filters?: GetDadosBancariosParams) =>
      [...dadosBancariosKeys.lists(), filters] as const,
   details: () => [...dadosBancariosKeys.all, "detail"] as const,
   detail: (id: number) => [...dadosBancariosKeys.details(), id] as const,
};

// ========================================
// Queries
// ========================================

/**
 * Lista de dados bancários com filtros
 */
export function useDadosBancarios(params?: GetDadosBancariosParams) {
   return useQuery({
      queryKey: dadosBancariosKeys.list(params),
      queryFn: async ({ signal }) => {
         const data = await getDadosBancarios(params, signal);
         return sortByAntiguidade(data);
      },
      placeholderData: keepPreviousData,
      staleTime: 0,
   });
}

// ========================================
// Mutations
// ========================================

/**
 * Criar novos dados bancários
 */
export function useCreateDadosBancarios() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async (data: DadosBancariosCreate) => {
         const response = await createDadosBancarios(data);
         const json = await response.json();
         if (!response.ok) {
            throw new Error(json.detail || "Erro ao criar dados bancários");
         }
         return json;
      },
      onSuccess: () => {
         queryClient.invalidateQueries({
            queryKey: dadosBancariosKeys.lists(),
         });
      },
   });
}

/**
 * Atualizar dados bancários existentes
 */
export function useUpdateDadosBancarios() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async ({
         id,
         data,
      }: {
         id: number;
         data: DadosBancariosUpdate;
      }) => {
         const response = await updateDadosBancarios(id, data);
         const json = await response.json();
         if (!response.ok) {
            throw new Error(json.detail || "Erro ao atualizar dados bancários");
         }
         return json;
      },
      onSuccess: (_, { id }) => {
         queryClient.invalidateQueries({
            queryKey: dadosBancariosKeys.detail(id),
         });
         queryClient.invalidateQueries({
            queryKey: dadosBancariosKeys.lists(),
         });
      },
   });
}

/**
 * Deletar dados bancários
 */
export function useDeleteDadosBancarios() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async (id: number) => {
         const response = await deleteDadosBancarios(id);
         const json = await response.json();
         if (!response.ok) {
            throw new Error(json.detail || "Erro ao deletar dados bancários");
         }
         return json;
      },
      onSuccess: () => {
         queryClient.invalidateQueries({
            queryKey: dadosBancariosKeys.lists(),
         });
      },
   });
}
