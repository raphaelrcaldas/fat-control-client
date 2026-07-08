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
   GetCartoesSaudeParams,
   CartaoSaudeCreate,
   CartaoSaudeUpdate,
} from "services/routes/aeromedica/cartoesSaude";

// ========================================
// Query Keys - Centralizadas
// ========================================

export const cartoesSaudeKeys = {
   all: ["cartoesSaude"] as const,
   lists: () => [...cartoesSaudeKeys.all, "list"] as const,
   list: (filters?: GetCartoesSaudeParams) =>
      [...cartoesSaudeKeys.lists(), filters] as const,
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
      },
   });
}
