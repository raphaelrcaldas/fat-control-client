import {
   useQuery,
   useMutation,
   useQueryClient,
   keepPreviousData,
} from "@tanstack/react-query";
import {
   getEsfAerList,
   getEsfAerResumo,
   updateEsfAer,
   type EsfAerItem,
   type EsfAerResumoResponse,
   type EsfAerUpdateRequest,
} from "services/routes/estatistica/esfAer";

export const esfAerKeys = {
   all: ["esfAer"] as const,
   list: () => [...esfAerKeys.all, "list"] as const,
   resumo: (anoRef: number) => [...esfAerKeys.all, "resumo", anoRef] as const,
};

export function useEsfAerList() {
   return useQuery<EsfAerItem[]>({
      queryKey: esfAerKeys.list(),
      queryFn: ({ signal }) => getEsfAerList(signal),
   });
}

export function useEsfAerResumo(anoRef: number) {
   return useQuery<EsfAerResumoResponse>({
      queryKey: esfAerKeys.resumo(anoRef),
      queryFn: ({ signal }) => getEsfAerResumo(anoRef, signal),
      placeholderData: keepPreviousData,
   });
}

export function useUpdateEsfAer() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: (data: EsfAerUpdateRequest) => updateEsfAer(data),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: esfAerKeys.all });
      },
   });
}
