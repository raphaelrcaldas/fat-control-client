import {
   useQuery,
   useMutation,
   useQueryClient,
   keepPreviousData,
} from "@tanstack/react-query";
import {
   getPassaportes,
   upsertPassaporte,
   deletePassaporte,
   PassaporteUpsert,
   GetPassaportesParams,
} from "services/routes/inteligencia/passaportes";

export const passaportesKeys = {
   all: ["passaportes"] as const,
   lists: () => [...passaportesKeys.all, "list"] as const,
   list: (params?: GetPassaportesParams) =>
      [...passaportesKeys.lists(), params] as const,
};

export function usePassaportes(params?: GetPassaportesParams) {
   return useQuery({
      queryKey: passaportesKeys.list(params),
      queryFn: ({ signal }) => getPassaportes(params, signal),
      placeholderData: keepPreviousData,
      staleTime: 5 * 60_000,
   });
}

export function useUpsertPassaporte() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async ({
         trip_id,
         data,
      }: {
         trip_id: number;
         data: PassaporteUpsert;
      }) => {
         const result = await upsertPassaporte(trip_id, data);
         if (!result.ok) {
            throw new Error(result.message || "Erro ao salvar passaporte");
         }
         return result;
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: passaportesKeys.lists() });
      },
   });
}

export function useDeletePassaporte() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async (trip_id: number) => {
         const result = await deletePassaporte(trip_id);
         if (!result.ok) {
            throw new Error(result.message || "Erro ao remover passaporte");
         }
         return result;
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: passaportesKeys.lists() });
      },
   });
}
