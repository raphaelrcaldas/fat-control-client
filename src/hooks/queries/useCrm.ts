import {
   useQuery,
   useMutation,
   useQueryClient,
   keepPreviousData,
} from "@tanstack/react-query";
import {
   getCrm,
   upsertCrm,
   deleteCrm,
   CrmUpsert,
   GetCrmParams,
} from "services/routes/seg-voo/crm";

export const crmKeys = {
   all: ["crm"] as const,
   lists: () => [...crmKeys.all, "list"] as const,
   list: (params?: GetCrmParams) => [...crmKeys.lists(), params] as const,
};

export function useCrm(params?: GetCrmParams) {
   return useQuery({
      queryKey: crmKeys.list(params),
      queryFn: ({ signal }) => getCrm(params, signal),
      placeholderData: keepPreviousData,
      staleTime: 5 * 60_000,
   });
}

export function useUpsertCrm() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async ({
         trip_id,
         data,
      }: {
         trip_id: number;
         data: CrmUpsert;
      }) => {
         const result = await upsertCrm(trip_id, data);
         if (!result.ok) {
            throw new Error(result.message || "Erro ao salvar CRM");
         }
         return result;
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: crmKeys.lists() });
      },
   });
}

export function useDeleteCrm() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async (trip_id: number) => {
         const result = await deleteCrm(trip_id);
         if (!result.ok) {
            throw new Error(result.message || "Erro ao remover CRM");
         }
         return result;
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: crmKeys.lists() });
      },
   });
}
