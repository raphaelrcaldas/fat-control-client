import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "services/Api";
import {
   getTiposMissao,
   createTipoMissao,
   updateTipoMissao,
   deleteTipoMissao,
   type TipoMissaoCreate,
   type TipoMissaoUpdate,
} from "services/routes/estatistica/tiposMissao";

export const tipoMissaoKeys = {
   all: ["tiposMissao"] as const,
   list: () => [...tipoMissaoKeys.all, "list"] as const,
};

export function useTiposMissao() {
   return useQuery({
      queryKey: tipoMissaoKeys.list(),
      queryFn: ({ signal }) => getTiposMissao(signal),
      staleTime: 5 * 60 * 1000,
   });
}

// ========================================
// Mutations (admin de sistema)
// ========================================

/**
 * Lança `ApiError` (e não `Error`) para o `errors` do 422 chegar ao `catch`
 * do formulário. Invalida a família inteira: editor de etapa, simulador e
 * filtros leem a mesma lista.
 */
function useTipoMissaoMutation<TVars>(
   mutationFn: (vars: TVars) => Promise<{
      ok: boolean;
      message: string | null;
      errors: Record<string, unknown> | null;
   }>,
   erroPadrao: string
) {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async (vars: TVars) => {
         const result = await mutationFn(vars);
         if (!result.ok) {
            throw new ApiError(result.message || erroPadrao, result.errors);
         }
         return result;
      },
      // `onSettled`: um 404/409 também indica lista desatualizada (outro admin
      // mexeu nela). Devolver a promise faz o `mutateAsync` esperar o refetch,
      // senão a linha recém-removida fica na tela com os botões ativos.
      onSettled: () =>
         queryClient.invalidateQueries({ queryKey: tipoMissaoKeys.all }),
   });
}

export function useCreateTipoMissao() {
   return useTipoMissaoMutation(
      (data: TipoMissaoCreate) => createTipoMissao(data),
      "Erro ao criar tipo de missão"
   );
}

export function useUpdateTipoMissao() {
   return useTipoMissaoMutation(
      ({ id, data }: { id: number; data: TipoMissaoUpdate }) =>
         updateTipoMissao(id, data),
      "Erro ao atualizar tipo de missão"
   );
}

export function useDeleteTipoMissao() {
   return useTipoMissaoMutation(
      (id: number) => deleteTipoMissao(id),
      "Erro ao remover tipo de missão"
   );
}
