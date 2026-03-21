import {
   useQuery,
   useMutation,
   useQueryClient,
   keepPreviousData,
} from "@tanstack/react-query";
import {
   getIdiomas,
   upsertIdiomas,
   deleteIdiomas,
   IdiomasUpsert,
} from "services/routes/instrucao/idiomas";

export const idiomasKeys = {
   all: ["idiomas"] as const,
   lists: () => [...idiomasKeys.all, "list"] as const,
};

export function useIdiomas() {
   return useQuery({
      queryKey: idiomasKeys.lists(),
      queryFn: ({ signal }) => getIdiomas(signal),
      placeholderData: keepPreviousData,
      staleTime: 5 * 60_000,
   });
}

export function useUpsertIdiomas() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async ({
         trip_id,
         data,
      }: {
         trip_id: number;
         data: IdiomasUpsert;
      }) => {
         const result = await upsertIdiomas(trip_id, data);
         if (!result.ok) {
            throw new Error(result.message || "Erro ao salvar idiomas");
         }
         return result;
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: idiomasKeys.lists() });
      },
   });
}

export function useDeleteIdiomas() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async (trip_id: number) => {
         const result = await deleteIdiomas(trip_id);
         if (!result.ok) {
            throw new Error(result.message || "Erro ao remover idiomas");
         }
         return result;
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: idiomasKeys.lists() });
      },
   });
}
