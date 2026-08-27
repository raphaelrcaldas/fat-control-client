import {
   useQuery,
   useMutation,
   useQueryClient,
   keepPreviousData,
} from "@tanstack/react-query";
import {
   getCartoesSaude,
   createCartaoSaude,
   updateCartaoSaude,
   deleteCartaoSaude,
   getOrfaosAeromedica,
   deleteOrfaosAeromedica,
   getCartaoSaudeHistorico,
   GetCartoesSaudeParams,
   CartaoSaudeCreate,
   CartaoSaudeUpdate,
} from "services/routes/aeromedica/cartoesSaude";
import { storageKeys } from "./useStorage";

// ========================================
// Query Keys - Centralizadas
// ========================================

export const cartoesSaudeKeys = {
   all: ["cartoesSaude"] as const,
   lists: () => [...cartoesSaudeKeys.all, "list"] as const,
   list: (filters?: GetCartoesSaudeParams) =>
      [...cartoesSaudeKeys.lists(), filters] as const,
   orfaos: () => [...cartoesSaudeKeys.all, "orfaos"] as const,
   historicos: () => [...cartoesSaudeKeys.all, "historico"] as const,
   historico: (userId: number) =>
      [...cartoesSaudeKeys.historicos(), userId] as const,
};

// ========================================
// Queries
// ========================================

/**
 * Lista de cartões de saúde com filtros
 */
export function useCartoesSaude(params?: GetCartoesSaudeParams) {
   return useQuery({
      // O backend já ordena por antiguidade (posto.ant, ult_promo, ant_rel,
      // id) com NULLS LAST — não reordenar no cliente para não divergir.
      queryKey: cartoesSaudeKeys.list(params),
      queryFn: ({ signal }) => getCartoesSaude(params, signal),
      placeholderData: keepPreviousData,
      staleTime: 5 * 60_000,
   });
}

/**
 * Trilha de auditoria (cartão + atas) de um militar.
 *
 * Quem segura o fetch é o render condicional da aba Histórico no drawer
 * (o componente só monta quando a aba está ativa): dado de saúde não se
 * busca por precaução ao abrir qualquer militar.
 */
export function useCartaoSaudeHistorico(userId: number | null | undefined) {
   return useQuery({
      queryKey: cartoesSaudeKeys.historico(userId ?? 0),
      queryFn: ({ signal }) => getCartaoSaudeHistorico(userId!, signal),
      enabled: !!userId,
      staleTime: 30_000,
   });
}

/**
 * Documentos aeromédicos (cartão + atas) de militares inativos
 */
export function useOrfaosAeromedica() {
   return useQuery({
      queryKey: cartoesSaudeKeys.orfaos(),
      queryFn: ({ signal }) => getOrfaosAeromedica(signal),
   });
}

// ========================================
// Mutations
// ========================================

/**
 * Criar novo cartão de saúde
 */
export function useCreateCartaoSaude() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async (data: CartaoSaudeCreate) => {
         const result = await createCartaoSaude(data);
         if (!result.ok) {
            throw new Error(result.message || "Erro ao criar cartão de saúde");
         }
         return result;
      },
      onSuccess: () => {
         queryClient.invalidateQueries({
            queryKey: cartoesSaudeKeys.lists(),
         });
         // A escrita virou evento de auditoria: a aba Histórico do drawer
         // continua aberta e mostraria a trilha sem o que acabou de mudar.
         queryClient.invalidateQueries({
            queryKey: cartoesSaudeKeys.historicos(),
         });
      },
   });
}

/**
 * Atualizar cartão de saúde existente
 */
export function useUpdateCartaoSaude() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async ({
         id,
         data,
      }: {
         id: number;
         data: CartaoSaudeUpdate;
      }) => {
         const result = await updateCartaoSaude(id, data);
         if (!result.ok) {
            throw new Error(
               result.message || "Erro ao atualizar cartão de saúde"
            );
         }
         return result;
      },
      onSuccess: () => {
         queryClient.invalidateQueries({
            queryKey: cartoesSaudeKeys.lists(),
         });
         // A escrita virou evento de auditoria: a aba Histórico do drawer
         // continua aberta e mostraria a trilha sem o que acabou de mudar.
         queryClient.invalidateQueries({
            queryKey: cartoesSaudeKeys.historicos(),
         });
      },
   });
}

/**
 * Deletar cartão de saúde
 */
export function useDeleteCartaoSaude() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async (id: number) => {
         const result = await deleteCartaoSaude(id);
         if (!result.ok) {
            throw new Error(
               result.message || "Erro ao deletar cartão de saúde"
            );
         }
         return result;
      },
      onSuccess: () => {
         queryClient.invalidateQueries({
            queryKey: cartoesSaudeKeys.lists(),
         });
         // A escrita virou evento de auditoria: a aba Histórico do drawer
         // continua aberta e mostraria a trilha sem o que acabou de mudar.
         queryClient.invalidateQueries({
            queryKey: cartoesSaudeKeys.historicos(),
         });
      },
   });
}

/**
 * Limpar documentos aeromédicos órfãos: apaga cartão E atas dos
 * militares inativos selecionados (PDFs saem do bucket junto).
 */
export function useDeleteOrfaosAeromedica() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async (user_ids: number[]) =>
         deleteOrfaosAeromedica(user_ids),
      onSuccess: () => {
         queryClient.invalidateQueries({
            queryKey: cartoesSaudeKeys.orfaos(),
         });
         // A remoção das atas libera bytes do bucket aeromedica.
         queryClient.invalidateQueries({
            queryKey: storageKeys.all,
         });
         // A limpeza apaga a trilha de auditoria desses militares junto com
         // os documentos — o cache do histórico ficaria servindo o que já
         // não existe mais no banco.
         queryClient.invalidateQueries({
            queryKey: cartoesSaudeKeys.historicos(),
         });
      },
   });
}
