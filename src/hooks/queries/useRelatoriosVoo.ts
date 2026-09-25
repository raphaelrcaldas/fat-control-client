import {
   useQuery,
   useMutation,
   useQueryClient,
   keepPreviousData,
} from "@tanstack/react-query";
import {
   listarRelatoriosDoPeriodo,
   urlDoArquivo,
   atualizarObservacao,
   excluirRelatorio,
   enviarRelatorio,
   type ListarParams,
   type EnvioRelatorio,
} from "services/routes/estatistica/relatoriosVoo";
import { storageKeys } from "./useStorage";

export const relatoriosVooKeys = {
   all: ["relatorios-voo"] as const,
   periodos: () => [...relatoriosVooKeys.all, "periodo"] as const,
   periodo: (params: ListarParams) =>
      [...relatoriosVooKeys.periodos(), params] as const,
   arquivo: (id: number) => [...relatoriosVooKeys.all, "arquivo", id] as const,
};

export function useRelatoriosVooPeriodo(params: ListarParams) {
   return useQuery({
      queryKey: relatoriosVooKeys.periodo(params),
      queryFn: ({ signal }) => listarRelatoriosDoPeriodo(params, signal),
      placeholderData: keepPreviousData,
   });
}

/**
 * URL assinada expira em 15 min. `gcTime: 0` descarta a entrada assim que o
 * último observador desmonta (prévia fechada): reabrir sempre busca uma URL
 * nova, em vez de arriscar servir do cache uma URL já vencida. Enquanto a
 * prévia está aberta o PDF já carregou no `<iframe>`, então o `staleTime` de
 * 10 min só evita refetch redundante nesse intervalo (ex.: reabrir o mesmo
 * item sem desmontar o componente) — não é ele quem garante a URL fresca.
 */
export function useArquivoRelatorio(id: number | null) {
   return useQuery({
      queryKey: relatoriosVooKeys.arquivo(id ?? 0),
      queryFn: () => urlDoArquivo(id!),
      enabled: id !== null,
      staleTime: 10 * 60_000,
      gcTime: 0,
   });
}

export function useAtualizarObservacao() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: ({ id, obs }: { id: number; obs: string | null }) =>
         atualizarObservacao(id, obs),
      onSuccess: () =>
         queryClient.invalidateQueries({
            queryKey: relatoriosVooKeys.periodos(),
         }),
   });
}

export function useExcluirRelatorio() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: (id: number) => excluirRelatorio(id),
      // Devolve a Promise: no TanStack v5 o `mutateAsync` só resolve quando
      // `onSuccess` termina, e `invalidateQueries` só resolve quando o
      // refetch das queries ativas termina. Assim, quando a página recebe o
      // "excluído", a lista já veio sem o item. Sem o `return`, a tela
      // liberava a exclusão um instante antes de a lista e a soma de bytes
      // atualizarem, e o painel mostrava o relatório apagado nesse meio-tempo.
      onSuccess: () =>
         Promise.all([
            queryClient.invalidateQueries({
               queryKey: relatoriosVooKeys.periodos(),
            }),
            // Excluir tira bytes do bucket: atualiza /admin/storage.
            queryClient.invalidateQueries({ queryKey: storageKeys.all }),
         ]),
   });
}

/** Sem invalidação por envio: o modal invalida uma vez ao terminar o lote. */
export function useEnviarRelatorio() {
   return useMutation({
      mutationFn: (envio: EnvioRelatorio) => enviarRelatorio(envio),
   });
}

export function useInvalidarRelatoriosVoo() {
   const queryClient = useQueryClient();
   return () => {
      queryClient.invalidateQueries({ queryKey: relatoriosVooKeys.periodos() });
      queryClient.invalidateQueries({ queryKey: storageKeys.all });
   };
}
