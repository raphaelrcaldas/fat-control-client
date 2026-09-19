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
   getEtapas,
   getEtapasPendentes,
   updateEtapa,
   updateMissao,
   type BulkUpdatePayload,
   type EtapaCreatePayload,
   type EtapaUpdatePayload,
   type GetEtapasParams,
   type MissaoComEtapasCreatePayload,
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
   pendentes: (limit?: number) =>
      [...etapaKeys.all, "pendentes", limit] as const,
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
export function useEtapasPendentes(limit?: number, enabled = true) {
   return useQuery({
      queryKey: etapaKeys.pendentes(limit),
      queryFn: ({ signal }) => getEtapasPendentes(limit, signal),
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

export function useDeleteEtapa() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: (id: number) => deleteEtapa(id),
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
