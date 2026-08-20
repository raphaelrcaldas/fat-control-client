import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
   getSubprogramas,
   createSubprograma,
   updateSubprograma,
   deleteSubprograma,
   type SubprogramaUpsert,
} from "services/routes/instrucao/subprogramas";
import { useAuth } from "@/app/context/auth";

// A org é implícita (org ativa do token) mas entra na key: o subprograma é
// escopado por unidade, e trocar no OrgSwitcher tem de trocar a lista.
export const subprogramasKeys = {
   all: ["subprogramas"] as const,
   list: (activeOrg: string | null) =>
      [...subprogramasKeys.all, "list", activeOrg ?? "sistema"] as const,
};

export function useSubprogramas() {
   const { activeOrg } = useAuth();

   return useQuery({
      queryKey: subprogramasKeys.list(activeOrg),
      queryFn: ({ signal }) => getSubprogramas(signal),
      enabled: !!activeOrg,
      staleTime: 5 * 60_000,
   });
}

function useSubprogramaMutation<TVars>(
   mutationFn: (vars: TVars) => Promise<{ ok: boolean; message?: string }>,
   erroPadrao: string
) {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async (vars: TVars) => {
         const result = await mutationFn(vars);
         if (!result.ok) {
            throw new Error(result.message || erroPadrao);
         }
         return result;
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: subprogramasKeys.all });
      },
   });
}

export function useCreateSubprograma() {
   return useSubprogramaMutation(
      (data: SubprogramaUpsert) => createSubprograma(data),
      "Erro ao cadastrar subprograma"
   );
}

export function useUpdateSubprograma() {
   return useSubprogramaMutation(
      ({ id, data }: { id: number; data: SubprogramaUpsert }) =>
         updateSubprograma(id, data),
      "Erro ao atualizar subprograma"
   );
}

export function useDeleteSubprograma() {
   return useSubprogramaMutation(
      (id: number) => deleteSubprograma(id),
      "Erro ao remover subprograma"
   );
}
