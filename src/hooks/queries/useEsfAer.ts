import {
   useQuery,
   useMutation,
   useQueryClient,
   keepPreviousData,
} from "@tanstack/react-query";
import {
   getEsfAerHistorico,
   getEsfAerList,
   getEsfAerResumo,
   updateEsfAer,
   type EsfAerHistorico,
   type EsfAerItem,
   type EsfAerResumoResponse,
   type EsfAerUpdateRequest,
} from "services/routes/estatistica/esfAer";

export const esfAerKeys = {
   all: ["esfAer"] as const,
   list: () => [...esfAerKeys.all, "list"] as const,
   resumo: (anoRef: number, simulador: boolean) =>
      [...esfAerKeys.all, "resumo", anoRef, simulador] as const,
   historico: (anoRef: number) =>
      [...esfAerKeys.all, "historico", anoRef] as const,
};

export function useEsfAerList() {
   return useQuery<EsfAerItem[]>({
      queryKey: esfAerKeys.list(),
      queryFn: ({ signal }) => getEsfAerList(signal),
      // Esforço aéreo é dado de referência: raramente muda e
      // useUpdateEsfAer invalida esfAerKeys.all em mutations.
      staleTime: Infinity,
   });
}

export function useEsfAerResumo(anoRef: number, simulador: boolean) {
   return useQuery<EsfAerResumoResponse>({
      queryKey: esfAerKeys.resumo(anoRef, simulador),
      queryFn: ({ signal }) => getEsfAerResumo(anoRef, simulador, signal),
      placeholderData: keepPreviousData,
   });
}

export function useEsfAerHistorico(anoRef: number) {
   return useQuery<EsfAerHistorico>({
      queryKey: esfAerKeys.historico(anoRef),
      queryFn: ({ signal }) => getEsfAerHistorico(anoRef, signal),
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
