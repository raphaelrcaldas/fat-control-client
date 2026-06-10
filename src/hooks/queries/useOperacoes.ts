import {
   useQuery,
   useMutation,
   useQueryClient,
   keepPreviousData,
} from "@tanstack/react-query";
import {
   getOperacoes,
   getOperacao,
   getOperacaoEtapas,
   getCandidatas,
   getPessoal,
   createOperacao,
   updateOperacao,
   deleteOperacao,
   associarEtapas,
   desassociarEtapa,
   addPessoal,
   updatePessoal,
   removePessoal,
   OperacaoFetchError,
   type GetOperacoesParams,
   type OperacaoCreate,
   type OperacaoUpdate,
   type OperacaoPessoalIn,
} from "services/routes/ops/operacoes";

export const operacaoKeys = {
   all: ["operacoes"] as const,
   lists: () => [...operacaoKeys.all, "list"] as const,
   list: (params?: GetOperacoesParams) =>
      [...operacaoKeys.lists(), params] as const,
   details: () => [...operacaoKeys.all, "detail"] as const,
   detail: (id: number) => [...operacaoKeys.details(), id] as const,
   etapas: (id: number) => [...operacaoKeys.detail(id), "etapas"] as const,
   candidatas: (id: number) =>
      [...operacaoKeys.detail(id), "candidatas"] as const,
   pessoal: (id: number) => [...operacaoKeys.detail(id), "pessoal"] as const,
};

// --------------------------------------------------------------------------- //
// Queries
// --------------------------------------------------------------------------- //
export function useOperacoes(params?: GetOperacoesParams) {
   return useQuery({
      queryKey: operacaoKeys.list(params),
      queryFn: ({ signal }) => getOperacoes(params, signal),
      placeholderData: keepPreviousData,
   });
}

export function useOperacao(id: number) {
   return useQuery({
      queryKey: operacaoKeys.detail(id),
      queryFn: ({ signal }) => getOperacao(id, signal),
      enabled: Number.isFinite(id) && id > 0,
      // 404 é definitivo (operação não existe nesta org) — sem retry
      retry: (failureCount, error) =>
         !(error instanceof OperacaoFetchError && error.status === 404) &&
         failureCount < 2,
   });
}

export function useOperacaoEtapas(id: number) {
   return useQuery({
      queryKey: operacaoKeys.etapas(id),
      queryFn: ({ signal }) => getOperacaoEtapas(id, signal),
      enabled: Number.isFinite(id) && id > 0,
   });
}

export function useCandidatas(id: number, enabled: boolean) {
   return useQuery({
      queryKey: operacaoKeys.candidatas(id),
      queryFn: ({ signal }) => getCandidatas(id, signal),
      enabled: enabled && Number.isFinite(id) && id > 0,
   });
}

export function usePessoal(id: number) {
   return useQuery({
      queryKey: operacaoKeys.pessoal(id),
      queryFn: ({ signal }) => getPessoal(id, signal),
      enabled: Number.isFinite(id) && id > 0,
   });
}

// --------------------------------------------------------------------------- //
// Mutations
// --------------------------------------------------------------------------- //
export function useCreateOperacao() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: (data: OperacaoCreate) => createOperacao(data),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: operacaoKeys.lists() });
      },
   });
}

export function useUpdateOperacao(id: number) {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: (data: OperacaoUpdate) => updateOperacao(id, data),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: operacaoKeys.lists() });
         queryClient.invalidateQueries({ queryKey: operacaoKeys.detail(id) });
      },
   });
}

export function useDeleteOperacao() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: (id: number) => deleteOperacao(id),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: operacaoKeys.lists() });
      },
   });
}

export function useAssociarEtapas(id: number) {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: (etapaIds: number[]) => associarEtapas(id, etapaIds),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: operacaoKeys.detail(id) });
         queryClient.invalidateQueries({ queryKey: operacaoKeys.lists() });
      },
   });
}

export function useDesassociarEtapa(id: number) {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: (etapaId: number) => desassociarEtapa(id, etapaId),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: operacaoKeys.detail(id) });
         queryClient.invalidateQueries({ queryKey: operacaoKeys.lists() });
      },
   });
}

export function useAddPessoal(id: number) {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: (data: OperacaoPessoalIn) => addPessoal(id, data),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: operacaoKeys.pessoal(id) });
      },
   });
}

export function useUpdatePessoal(id: number) {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: ({
         pessoalId,
         data,
      }: {
         pessoalId: number;
         data: OperacaoPessoalIn;
      }) => updatePessoal(id, pessoalId, data),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: operacaoKeys.pessoal(id) });
      },
   });
}

export function useRemovePessoal(id: number) {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: (pessoalId: number) => removePessoal(id, pessoalId),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: operacaoKeys.pessoal(id) });
      },
   });
}
