import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
   getCartoes,
   upsertCartao,
   deleteCartao,
   getCartoesOrfaos,
   deleteCartoesOrfaos,
   CartoesUpsert,
} from "services/routes/instrucao/cartoes";

export const cartoesKeys = {
   all: ["cartoes"] as const,
   lists: () => [...cartoesKeys.all, "list"] as const,
   orfaos: () => [...cartoesKeys.all, "orfaos"] as const,
};

export function useCartoes() {
   return useQuery({
      queryKey: cartoesKeys.lists(),
      queryFn: ({ signal }) => getCartoes(signal),
      staleTime: 5 * 60_000,
   });
}

export function useCartoesOrfaos() {
   return useQuery({
      queryKey: cartoesKeys.orfaos(),
      queryFn: ({ signal }) => getCartoesOrfaos(signal),
   });
}

export function useDeleteCartoesOrfaos() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async (user_ids: number[]) => deleteCartoesOrfaos(user_ids),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: cartoesKeys.orfaos() });
      },
   });
}

export function useUpsertCartao() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async ({
         trip_id,
         data,
      }: {
         trip_id: number;
         data: CartoesUpsert;
      }) => {
         const result = await upsertCartao(trip_id, data);
         if (!result.ok) {
            throw new Error(result.message || "Erro ao salvar cartão");
         }
         return result;
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: cartoesKeys.lists() });
      },
   });
}

export function useDeleteCartao() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async (trip_id: number) => {
         const result = await deleteCartao(trip_id);
         if (!result.ok) {
            throw new Error(result.message || "Erro ao remover cartão");
         }
         return result;
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: cartoesKeys.lists() });
      },
   });
}
