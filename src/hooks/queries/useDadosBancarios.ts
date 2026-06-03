import {
   useQuery,
   useMutation,
   useQueryClient,
   keepPreviousData,
} from "@tanstack/react-query";
import {
   getDadosBancarios,
   getDadosBancariosOrfaos,
   createDadosBancarios,
   updateDadosBancarios,
   deleteDadosBancarios,
   deleteDadosBancariosOrfaos,
   syncRemuneracaoPortal,
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
   orfaos: () => [...dadosBancariosKeys.all, "orfaos"] as const,
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

/**
 * Lista de dados bancários órfãos (de militares desativados)
 */
export function useDadosBancariosOrfaos() {
   return useQuery({
      queryKey: dadosBancariosKeys.orfaos(),
      queryFn: async ({ signal }) => {
         const data = await getDadosBancariosOrfaos(signal);
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
         const result = await createDadosBancarios(data);
         if (!result.ok) {
            throw new Error(result.message || "Erro ao criar dados bancários");
         }
         return result;
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
         const result = await updateDadosBancarios(id, data);
         if (!result.ok) {
            throw new Error(
               result.message || "Erro ao atualizar dados bancários"
            );
         }
         return result;
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
 * Sincronizar remuneração com o Portal da Transparência
 * (apenas consulta — não persiste no banco)
 */
export function useSyncRemuneracaoPortal() {
   return useMutation({
      mutationFn: ({
         user_id,
         mes_ano,
      }: {
         user_id: number;
         mes_ano: string;
      }) => syncRemuneracaoPortal(user_id, mes_ano),
   });
}

/**
 * Remover em lote registros órfãos por seleção parcial
 */
export function useDeleteDadosBancariosOrfaos() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async (ids: number[]) => {
         const result = await deleteDadosBancariosOrfaos(ids);
         if (!result.ok) {
            throw new Error(
               result.message || "Erro ao limpar dados bancários órfãos"
            );
         }
         return result;
      },
      onSuccess: () => {
         queryClient.invalidateQueries({
            queryKey: dadosBancariosKeys.orfaos(),
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
         const result = await deleteDadosBancarios(id);
         if (!result.ok) {
            throw new Error(
               result.message || "Erro ao deletar dados bancários"
            );
         }
         return result;
      },
      onSuccess: () => {
         queryClient.invalidateQueries({
            queryKey: dadosBancariosKeys.lists(),
         });
      },
   });
}
