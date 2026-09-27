import { useEffect, useMemo, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "services/Api";
import {
   apagarNotificacao,
   getContadorNotificacoes,
   getNotificacoes,
   marcarNotificacaoLida,
   marcarTodasNotificacoesLidas,
   type GetNotificacoesParams,
} from "services/routes/notificacoes";

/**
 * A mensagem de falha é do call site, não do hook: só a tela sabe o que a
 * pessoa acabou de tentar fazer.
 */
type MutacaoOptions = { onError?: () => void };

export const notificacaoKeys = {
   all: ["notificacoes"] as const,
   contador: () => [...notificacaoKeys.all, "contador"] as const,
   list: (params?: GetNotificacoesParams) =>
      [...notificacaoKeys.all, "list", params ?? {}] as const,
};

/**
 * Contador do sino. SEM `refetchInterval` de propósito (decisão de
 * projeto, mesma do FatBird): a máquina do backend no Fly.io tem
 * `auto_stop` e dorme sem tráfego — polling a manteria acordada.
 *
 * O sino vive no layout persistente `(home)/layout.tsx`: navegar entre
 * páginas NÃO remonta o componente, e o `refetchOnWindowFocus` global do
 * client é `false` — sem gatilho próprio, este `staleTime` de 60 s faria o
 * contador ficar visivelmente desatualizado numa sessão longa. Por isso
 * `NotificacoesBell` força a atualização em dois pontos (sem virar
 * polling): invalida ao abrir o popover, e refaz por troca de rota só
 * quando a query já está stale (`queryClient.refetchQueries({..., stale:
 * true})`).
 */
export function useContadorNotificacoes() {
   return useQuery({
      queryKey: notificacaoKeys.contador(),
      queryFn: ({ signal }) => getContadorNotificacoes(signal),
      staleTime: 60_000,
   });
}

/** Lista do popover do sino — só busca com ele aberto (`enabled`). */
export function useNotificacoes(params: GetNotificacoesParams, enabled = true) {
   return useQuery({
      queryKey: notificacaoKeys.list(params),
      queryFn: ({ signal }) => getNotificacoes(params, signal),
      enabled,
   });
}

export function useMarcarNotificacaoLida(options?: MutacaoOptions) {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async (id: number) => {
         const result = await marcarNotificacaoLida(id);
         if (!result.ok) {
            throw new ApiError(
               result.message ?? "Erro ao marcar notificação como lida",
               result.errors
            );
         }
         return result.data;
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: notificacaoKeys.all });
      },
      onError: options?.onError,
   });
}

export function useMarcarTodasNotificacoesLidas(options?: MutacaoOptions) {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async () => {
         const result = await marcarTodasNotificacoesLidas();
         if (!result.ok) {
            throw new ApiError(
               result.message ?? "Erro ao marcar todas como lidas",
               result.errors
            );
         }
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: notificacaoKeys.all });
      },
      onError: options?.onError,
   });
}

export function useApagarNotificacao(options?: MutacaoOptions) {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async (id: number) => {
         const result = await apagarNotificacao(id);
         if (!result.ok) {
            throw new ApiError(
               result.message ?? "Erro ao apagar notificação",
               result.errors
            );
         }
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: notificacaoKeys.all });
      },
      onError: options?.onError,
   });
}

/** Consulta única dos avisos pendentes, compartilhada pelo selo das
 * listas de feedback (autor e admin) e pela marcação de lido ao abrir a
 * conversa — mesma chave, uma requisição só. A lista do popover pede
 * outra página (`per_page: 20`, sem filtro), então não a reaproveita. */
const PENDENTES: GetNotificacoesParams = {
   apenas_pendentes: true,
   per_page: 100,
};

/** Avisos da conversa para o AUTOR (a administração escreveu). */
export const TIPOS_AVISO_AUTOR = ["feedback.mensagem"] as const;
/** Avisos da conversa para a ADMINISTRAÇÃO (feedback novo, autor
 * escreveu) — o backend só os emite para admin de sistema. */
export const TIPOS_AVISO_ADMIN = [
   "feedback.recebido",
   "feedback.mensagem_autor",
] as const;
type TiposAviso = typeof TIPOS_AVISO_AUTOR | typeof TIPOS_AVISO_ADMIN;

/**
 * feedbackId → ids das notificações NÃO lidas dos `tipos` pedidos. Mesmo
 * contrato do FatBird (`useMensagensNaoLidas`): a checagem de `recurso_id`
 * é de VALOR, não de tipo — o dado vem de JSON. `tipos` é uma das
 * constantes acima (referência estável, entra na dependência do memo).
 */
export function useAvisosNaoLidosDeFeedback(
   tipos: TiposAviso
): Map<number, number[]> {
   const { data } = useNotificacoes(PENDENTES);

   return useMemo(() => {
      const aceitos: readonly string[] = tipos;
      const mapa = new Map<number, number[]>();
      for (const n of data?.data ?? []) {
         const id = n.recurso_id;
         if (!aceitos.includes(n.tipo) || n.read_at) continue;
         if (typeof id !== "number" || !Number.isInteger(id) || id <= 0) {
            continue;
         }
         mapa.set(id, [...(mapa.get(id) ?? []), n.id]);
      }
      return mapa;
   }, [data, tipos]);
}

/**
 * Abrir a conversa de um feedback marca como lidos os avisos dela — uma
 * vez por aviso (guarda em `useRef`, que também absorve o duplo efeito do
 * StrictMode; o backend é idempotente de qualquer forma), sem toast de
 * erro: a pessoa não fez gesto nenhum, e na falha o selo só continua
 * aceso. Mesma semântica do FatBird
 * (`fatbird/src/hooks/queries/useFeedbacks.ts:useMarcarConversaLida`).
 *
 * Chamado pelos dois modais de conversa: o do autor
 * (`(home)/feedback/components/ConversaModal.tsx`, `TIPOS_AVISO_AUTOR`) e
 * o da administração (`admin/feedback/components/TratarFeedbackModal.tsx`,
 * `TIPOS_AVISO_ADMIN`).
 */
export function useMarcarConversaLida(
   feedbackId: number | null,
   tipos: TiposAviso
) {
   const naoLidas = useAvisosNaoLidosDeFeedback(tipos);
   const marcarLida = useMarcarNotificacaoLida();
   const jaMarcadas = useRef(new Set<number>());
   const { mutate } = marcarLida;

   useEffect(() => {
      if (feedbackId === null) return;
      for (const notifId of naoLidas.get(feedbackId) ?? []) {
         if (jaMarcadas.current.has(notifId)) continue;
         jaMarcadas.current.add(notifId);
         mutate(notifId);
      }
   }, [feedbackId, naoLidas, mutate]);
}
