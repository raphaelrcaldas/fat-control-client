import {
   useQuery,
   useMutation,
   useQueryClient,
   keepPreviousData,
   type QueryClient,
} from "@tanstack/react-query";
import {
   bulkUpdateEtapas,
   createEtapa,
   createMissao,
   createMissaoWithEtapas,
   deleteEtapa,
   deleteMissao,
   deleteMissaoComEtapas,
   getEtapas,
   getEtapasPendentes,
   updateEtapa,
   updateMissao,
   updateMissaoWithEtapas,
   type BulkUpdatePayload,
   type EtapaCreatePayload,
   type EtapaUpdatePayload,
   type GetEtapasParams,
   type MissaoComEtapasCreatePayload,
   type MissaoComEtapasUpdatePayload,
   type MissaoCreate,
   type MissaoUpdate,
} from "services/routes/estatistica/etapas";
import { esfAerKeys } from "./useEsfAer";
import { indicadoresKeys } from "./useIndicadores";
import { seboKeys } from "./useSebo";
import { indispKeys } from "./useIndisps";
import { escalaKeys } from "./useEscala";

// ========================================
// Query Keys - Centralizadas
// ========================================

export const etapaKeys = {
   all: ["etapas"] as const,
   lists: () => [...etapaKeys.all, "list"] as const,
   list: (filters?: GetEtapasParams) =>
      [...etapaKeys.lists(), filters] as const,
   // Sob `all` de propósito: toda mutação de etapa já invalida `all`, então
   // marcar SAGEM/Parte 1 rebaixa a contagem de pendências sem código extra.
   pendentes: (limit?: number, isSimulador = false) =>
      [...etapaKeys.all, "pendentes", limit, isSimulador] as const,
};

/**
 * Chave do detalhe de uma missao de ESTATISTICA (nao confundir com
 * `missaoKeys` de `useMissoes`, que e do cegep), usada pelos dois editores (estatistica e
 * simulador). Fica FORA de `etapaKeys` porque o prefixo e outro: `["missao",
 * id]` nao casa com `["etapas"]`, entao invalidar `etapaKeys.all` nunca
 * alcancou esta query. Ate aqui o detalhe so nao servia dado velho porque as
 * paginas usam `gcTime: 0` — protecao acidental, nao declarada.
 */
export const missaoEtpKeys = {
   all: ["missao"] as const,
   detail: (id: number) => [...missaoEtpKeys.all, id] as const,
};

function invalidateRestricoesOperacionais(queryClient: QueryClient) {
   queryClient.invalidateQueries({ queryKey: indispKeys.all });
   queryClient.invalidateQueries({ queryKey: escalaKeys.all });
}

// ========================================
// Queries
// ========================================

/**
 * Lista de missoes com etapas e filtros. Nao e paginada: a janela de datas
 * do filtro e o que limita o volume.
 */
export function useEtapas(params?: GetEtapasParams, enabled = true) {
   return useQuery({
      queryKey: etapaKeys.list(params),
      queryFn: ({ signal }) => getEtapas(params, signal),
      placeholderData: keepPreviousData,
      enabled,
   });
}

/**
 * Etapas pendentes de verificacao (sem SAGEM e/ou sem Parte 1) da org ativa.
 *
 * Nao recebe os filtros da tela: a rota varre todo o historico justamente
 * para pescar a missao antiga que ficou fora da janela de datas.
 */
export function useEtapasPendentes(
   limit?: number,
   enabled = true,
   isSimulador = false
) {
   return useQuery({
      queryKey: etapaKeys.pendentes(limit, isSimulador),
      queryFn: ({ signal }) => getEtapasPendentes(limit, signal, isSimulador),
      enabled,
   });
}

// ========================================
// Mutations - Missao CRUD
// ========================================

export function useCreateMissao() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: (data: MissaoCreate) => createMissao(data),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: etapaKeys.all });
         queryClient.invalidateQueries({ queryKey: missaoEtpKeys.all });
         invalidateRestricoesOperacionais(queryClient);
      },
   });
}

/**
 * Cria uma missao ja com suas etapas de forma atomica. Usado pelo simulador
 * para persistir a dupla apenas junto da primeira sessao (evita missao orfa).
 */
export function useCreateMissaoWithEtapas() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: (data: MissaoComEtapasCreatePayload) =>
         createMissaoWithEtapas(data),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: etapaKeys.all });
         queryClient.invalidateQueries({ queryKey: missaoEtpKeys.all });
         queryClient.invalidateQueries({ queryKey: esfAerKeys.all });
         queryClient.invalidateQueries({ queryKey: seboKeys.all });
         queryClient.invalidateQueries({ queryKey: indicadoresKeys.all });
         invalidateRestricoesOperacionais(queryClient);
      },
   });
}

export function useUpdateMissao() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: ({ id, data }: { id: number; data: MissaoUpdate }) =>
         updateMissao(id, data),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: etapaKeys.all });
         queryClient.invalidateQueries({ queryKey: missaoEtpKeys.all });
         invalidateRestricoesOperacionais(queryClient);
      },
   });
}

export function useUpdateMissaoWithEtapas() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: ({
         id,
         data,
      }: {
         id: number;
         data: MissaoComEtapasUpdatePayload;
      }) => updateMissaoWithEtapas(id, data),
      onSuccess: (result, { id }) => {
         if (!result.ok) {
            // PUT recusado (ex.: 422 "Etapa(s) não pertencem à missão" porque
            // outra pessoa excluiu uma sessão): nada mudou no servidor, mas o
            // cache pode estar defasado e `refetchOnWindowFocus` está
            // desligado. Sem reler o detalhe, o editor nunca reconcilia e
            // todo novo save repete o mesmo erro.
            queryClient.invalidateQueries({
               queryKey: missaoEtpKeys.detail(id),
            });
            return;
         }
         if (result.data)
            queryClient.setQueryData(missaoEtpKeys.detail(id), result.data);
         queryClient.invalidateQueries({ queryKey: etapaKeys.all });
         queryClient.invalidateQueries({ queryKey: missaoEtpKeys.all });
         queryClient.invalidateQueries({ queryKey: esfAerKeys.all });
         queryClient.invalidateQueries({ queryKey: seboKeys.all });
         queryClient.invalidateQueries({ queryKey: indicadoresKeys.all });
         invalidateRestricoesOperacionais(queryClient);
      },
   });
}

export function useDeleteEstatMissao() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: (id: number) => deleteMissao(id),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: etapaKeys.all });
         queryClient.invalidateQueries({ queryKey: missaoEtpKeys.all });
         invalidateRestricoesOperacionais(queryClient);
      },
   });
}

/** Exclui a missão e suas etapas em uma única transação. */
export function useDeleteMissaoComEtapas() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: (id: number) => deleteMissaoComEtapas(id),
      onSuccess: (result, id) => {
         if (!result.ok) return;
         // O detalhe da missão excluída fica de fora: o editor segue montado
         // até o `router.push`, e refazer o GET devolveria 404, piscando
         // "Missão não encontrada" antes da navegação.
         queryClient.cancelQueries({ queryKey: missaoEtpKeys.detail(id) });
         queryClient.invalidateQueries({ queryKey: etapaKeys.all });
         queryClient.invalidateQueries({
            queryKey: missaoEtpKeys.all,
            predicate: (query) => query.queryKey[1] !== id,
         });
         queryClient.invalidateQueries({ queryKey: esfAerKeys.all });
         queryClient.invalidateQueries({ queryKey: seboKeys.all });
         queryClient.invalidateQueries({ queryKey: indicadoresKeys.all });
         invalidateRestricoesOperacionais(queryClient);
      },
   });
}

// ========================================
// Mutations - Etapa CRUD
// ========================================

export function useCreateEtapa() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: (data: EtapaCreatePayload) => createEtapa(data),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: etapaKeys.all });
         queryClient.invalidateQueries({ queryKey: missaoEtpKeys.all });
         queryClient.invalidateQueries({ queryKey: esfAerKeys.all });
         queryClient.invalidateQueries({ queryKey: seboKeys.all });
         queryClient.invalidateQueries({ queryKey: indicadoresKeys.all });
         invalidateRestricoesOperacionais(queryClient);
      },
   });
}

export function useUpdateEtapa() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: ({ id, data }: { id: number; data: EtapaUpdatePayload }) =>
         updateEtapa(id, data),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: etapaKeys.all });
         queryClient.invalidateQueries({ queryKey: missaoEtpKeys.all });
         queryClient.invalidateQueries({ queryKey: esfAerKeys.all });
         queryClient.invalidateQueries({ queryKey: seboKeys.all });
         queryClient.invalidateQueries({ queryKey: indicadoresKeys.all });
         invalidateRestricoesOperacionais(queryClient);
      },
   });
}

export function useBulkUpdateEtapas() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: (payload: BulkUpdatePayload) => bulkUpdateEtapas(payload),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: etapaKeys.all });
         queryClient.invalidateQueries({ queryKey: missaoEtpKeys.all });
         queryClient.invalidateQueries({ queryKey: esfAerKeys.all });
         queryClient.invalidateQueries({ queryKey: seboKeys.all });
         queryClient.invalidateQueries({ queryKey: indicadoresKeys.all });
         invalidateRestricoesOperacionais(queryClient);
      },
   });
}

/**
 * Exclui uma etapa. `notFound` (ver `deleteEtapa`) sinaliza 404: a etapa já
 * havia sido excluída por outra pessoa.
 *
 * Quando era a última etapa, o backend remove a missão junto e avisa em
 * `data.missao_removida`: o detalhe dela fica de fora da invalidação (o editor
 * segue montado até o `router.push`, e refazer o GET devolveria 404, piscando
 * "Missão não encontrada"). A decisão vem da resposta, não do que o cliente
 * acha que resta — a contagem local pode estar defasada.
 */
export function useDeleteEtapa() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: ({ id }: { id: number; missaoId: number }) => deleteEtapa(id),
      onSuccess: (result, { missaoId }) => {
         const missaoRemovida = result.data?.missao_removida === true;
         if (missaoRemovida) {
            queryClient.cancelQueries({
               queryKey: missaoEtpKeys.detail(missaoId),
            });
         }
         queryClient.invalidateQueries({ queryKey: etapaKeys.all });
         queryClient.invalidateQueries({
            queryKey: missaoEtpKeys.all,
            predicate: missaoRemovida
               ? (query) => query.queryKey[1] !== missaoId
               : undefined,
         });
         queryClient.invalidateQueries({ queryKey: esfAerKeys.all });
         queryClient.invalidateQueries({ queryKey: seboKeys.all });
         queryClient.invalidateQueries({ queryKey: indicadoresKeys.all });
         invalidateRestricoesOperacionais(queryClient);
      },
   });
}
