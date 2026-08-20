import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
   getPaops,
   getPaop,
   createPaop,
   updatePaop,
   deletePaop,
   setPaopSubprogramas,
   setItemTripulantes,
   type PaopCreate,
   type PaopUpdate,
} from "services/routes/instrucao/paops";
import { useAuth } from "@/app/context/auth";
import type { ApiResult } from "@/types/api";

// O PAOP é escopado por unidade e a org é implícita no token: trocar no
// OrgSwitcher tem de trocar a lista, não reaproveitar a anterior.
export const paopKeys = {
   all: ["paops"] as const,
   list: (activeOrg: string | null) =>
      [...paopKeys.all, "list", activeOrg ?? "sistema"] as const,
   detail: (activeOrg: string | null, id: number) =>
      [...paopKeys.all, "detail", activeOrg ?? "sistema", id] as const,
};

export function usePaops() {
   const { activeOrg } = useAuth();

   return useQuery({
      queryKey: paopKeys.list(activeOrg),
      queryFn: ({ signal }) => getPaops(signal),
      enabled: !!activeOrg,
      staleTime: 5 * 60_000,
   });
}

export function usePaop(id: number | null) {
   const { activeOrg } = useAuth();
   // Id vem da URL: `/instrucao/paop/abc/1` viraria NaN e pediria o plano
   // "NaN" à API em vez de cair no estado de não encontrado.
   const valido = id !== null && Number.isFinite(id);

   return useQuery({
      queryKey: paopKeys.detail(activeOrg, id!),
      queryFn: ({ signal }) => getPaop(id!, signal),
      enabled: valido && !!activeOrg,
      staleTime: 60_000,
   });
}

function usePaopMutation<TVars, TData>(
   mutationFn: (vars: TVars) => Promise<ApiResult<TData>>,
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
      // Mexer no plano muda também os totais da listagem, então sai a
      // família inteira do cache.
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: paopKeys.all });
      },
   });
}

export function useCreatePaop() {
   return usePaopMutation(
      (data: PaopCreate) => createPaop(data),
      "Erro ao criar o PAOP"
   );
}

export function useUpdatePaop() {
   return usePaopMutation(
      ({ id, data }: { id: number; data: PaopUpdate }) => updatePaop(id, data),
      "Erro ao atualizar o PAOP"
   );
}

export function useDeletePaop() {
   return usePaopMutation(
      (id: number) => deletePaop(id),
      "Erro ao remover o PAOP"
   );
}

export function useSetPaopSubprogramas() {
   return usePaopMutation(
      ({ id, subprogramaIds }: { id: number; subprogramaIds: number[] }) =>
         setPaopSubprogramas(id, subprogramaIds),
      "Erro ao salvar os subprogramas do PAOP"
   );
}

export function useSetItemTripulantes() {
   return usePaopMutation(
      ({
         paopId,
         itemId,
         tripIds,
      }: {
         paopId: number;
         itemId: number;
         tripIds: number[];
      }) => setItemTripulantes(paopId, itemId, tripIds),
      "Erro ao salvar as matrículas"
   );
}
