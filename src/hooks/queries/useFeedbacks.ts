import {
   keepPreviousData,
   useMutation,
   useQuery,
   useQueryClient,
} from "@tanstack/react-query";
import { ApiError } from "services/Api";
import { isNotFoundError } from "utils/apiErrors";
import {
   addFeedback,
   deleteFeedback,
   enviarMensagem,
   enviarMensagemAdmin,
   getFeedback,
   getFeedbacks,
   getMeuFeedback,
   getMeusFeedbacks,
   updateFeedback,
   type Feedback,
   type FeedbackCreate,
   type FeedbackDetalhe,
   type FeedbackMensagemAdmin,
   type FeedbackUpdate,
   type GetFeedbacksParams,
} from "services/routes/feedbacks";

export const feedbackKeys = {
   all: ["feedbacks"] as const,
   lists: () => [...feedbackKeys.all, "list"] as const,
   list: (params?: GetFeedbacksParams) =>
      [...feedbackKeys.lists(), params] as const,
   detail: (id: number) => [...feedbackKeys.all, "detail", id] as const,
   // Lado do autor ("Meus feedbacks") — prefixo separado do admin, mas sob
   // o mesmo `all`: uma invalidação de `all` (ex.: `useEnviarMensagem` do
   // autor, ao enviar) alcança os dois lados. `useAddFeedback`, abaixo,
   // invalida `lists()` e `me()` explicitamente (não `all`), então não
   // dispara refetch do detalhe de ninguém à toa.
   me: () => [...feedbackKeys.all, "me"] as const,
   meDetail: (id: number) => [...feedbackKeys.all, "me", id] as const,
};

export function useFeedbacks(params?: GetFeedbacksParams) {
   return useQuery({
      queryKey: feedbackKeys.list(params),
      queryFn: ({ signal }) => getFeedbacks(params, signal),
      placeholderData: keepPreviousData,
      staleTime: 60_000,
   });
}

/** Conversa de um feedback. `staleTime: 0`: o modal abre para ler o que
 *  o autor acabou de escrever. Sem retry em 404: feedback inexistente não
 *  vira mais tentativa. */
export function useFeedback(id: number | null) {
   return useQuery({
      queryKey: feedbackKeys.detail(id!),
      queryFn: ({ signal }) => getFeedback(id!, signal),
      enabled: id !== null,
      staleTime: 0,
      retry: (count, error) => !isNotFoundError(error) && count < 1,
   });
}

export function useAddFeedback() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async (data: FeedbackCreate) => {
         const result = await addFeedback(data);
         if (!result.ok) {
            throw new Error(result.message || "Erro ao enviar feedback");
         }
         return result;
      },
      // Invalida a caixa do admin (quem trata pode estar com a lista aberta
      // noutra aba, e o envio do próprio admin apareceria só no refetch) e a
      // lista "Meus feedbacks" de quem enviou, para o item novo aparecer sem
      // precisar sair e voltar da tela.
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: feedbackKeys.lists() });
         queryClient.invalidateQueries({ queryKey: feedbackKeys.me() });
      },
   });
}

export function useEnviarMensagemAdmin() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async ({
         id,
         data,
      }: {
         id: number;
         data: FeedbackMensagemAdmin;
      }) => {
         const result = await enviarMensagemAdmin(id, data);
         if (!result.ok || !result.data) {
            throw new ApiError(
               result.message ?? "Erro ao enviar a mensagem",
               result.errors
            );
         }
         return result.data;
      },
      // Um GET do detalhe pode estar em voo quando a mensagem termina de
      // gravar; sem cancelar, ele pode responder depois e sobrescrever o
      // detalhe que acabamos de gravar com um dado mais velho.
      onMutate: ({ id }) =>
         queryClient.cancelQueries({ queryKey: feedbackKeys.detail(id) }),
      // Cancelar sem invalidar de volta deixa a query PRESA se a mutation
      // falhar: ninguém mais dispara um refetch dela.
      onError: (_e, { id }) =>
         queryClient.invalidateQueries({ queryKey: feedbackKeys.detail(id) }),
      onSuccess: (detalhe) => {
         queryClient.setQueryData(feedbackKeys.detail(detalhe.id), detalhe);
         queryClient.invalidateQueries({ queryKey: feedbackKeys.lists() });
      },
   });
}

export function useUpdateFeedback() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async ({
         id,
         data,
      }: {
         id: number;
         data: FeedbackUpdate;
      }) => {
         const result = await updateFeedback(id, data);
         if (!result.ok) {
            throw new ApiError(
               result.message ?? "Erro ao atualizar feedback",
               result.errors
            );
         }
         return result;
      },
      onMutate: ({ id }) =>
         queryClient.cancelQueries({ queryKey: feedbackKeys.detail(id) }),
      // Mesmo motivo do onError de useEnviarMensagemAdmin: sem isto, uma
      // falha de PATCH deixa a query do detalhe presa em "cancelada".
      onError: (_e, { id }) =>
         queryClient.invalidateQueries({ queryKey: feedbackKeys.detail(id) }),
      onSuccess: (result) => {
         if (result.data) {
            queryClient.setQueryData(
               feedbackKeys.detail(result.data.id),
               result.data
            );
         }
         queryClient.invalidateQueries({ queryKey: feedbackKeys.lists() });
      },
   });
}

export function useDeleteFeedback() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async (id: number) => {
         const result = await deleteFeedback(id);
         if (!result.ok) {
            throw new Error(result.message || "Erro ao excluir feedback");
         }
         return result;
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: feedbackKeys.lists() });
      },
   });
}

// --- Lado do autor: "Meus feedbacks". Mesmas garantias do FatBird
// (fatbird/src/hooks/queries/useFeedbacks.ts), reproduzidas aqui sem o que
// depende de notificação (o client ainda não tem sino) — ver
// `docs/ai/notes/feedback-conversa.md`.

/**
 * Feedbacks do próprio usuário no client (o backend deriva autor e origem do
 * token; só volta `origem='client'`). `staleTime: 0`: o global é 60 s, e
 * voltar da conversa mostraria a lista de antes da mensagem.
 *
 * `refetchOnWindowFocus: true` só aqui e em `useMeuFeedback`: o default
 * global do client é `false` (`client/src/lib/queryClient.ts`), e sem
 * polling nem realtime (contrato do projeto), voltar para a aba é o único
 * gatilho de atualização — mesmo padrão do FatBird
 * (`fatbird/src/hooks/queries/useFeedbacks.ts`).
 */
export function useMeusFeedbacks() {
   return useQuery({
      queryKey: feedbackKeys.me(),
      queryFn: ({ signal }) => getMeusFeedbacks(signal),
      staleTime: 0,
      refetchOnWindowFocus: true,
   });
}

/**
 * Conversa de um feedback do autor.
 *
 * - `placeholderData`, NUNCA `initialData`, semeado pelo resumo da lista:
 *   com `initialData` o dado semeado entraria no cache e, se o refetch der
 *   404 (feedback excluído), a tela continuaria mostrando o feedback
 *   apagado.
 * - `refetchOnWindowFocus: true` (default do client é `false`): sem isso a
 *   conversa aberta nunca se atualiza sozinha — voltar para a aba é o único
 *   jeito de ver uma mensagem da administração chegar.
 * - 404 é resposta definitiva: não repete.
 */
export function useMeuFeedback(id: number | null) {
   const queryClient = useQueryClient();

   return useQuery({
      queryKey: feedbackKeys.meDetail(id!),
      queryFn: ({ signal }) => getMeuFeedback(id!, signal),
      enabled: id !== null,
      staleTime: 0,
      refetchOnWindowFocus: true,
      retry: (count, error) => !isNotFoundError(error) && count < 1,
      placeholderData: (): FeedbackDetalhe | undefined => {
         const resumo = queryClient
            .getQueryData<Feedback[]>(feedbackKeys.me())
            ?.find((f) => f.id === id);
         // Sem os eventos o placeholder mostraria uma conversa vazia que
         // "pisca" cheia; só a abertura (descrição) é segura de antecipar.
         return resumo ? { ...resumo, eventos: [] } : undefined;
      },
   });
}

/**
 * Envio de mensagem do autor. O balão otimista é desenhado pela TELA a
 * partir de `variables`/`isPending`/`isError` da mutação (padrão TanStack
 * v5), não inserido no cache: a falha mantém o texto no balão "Não enviada"
 * sem sujar a conversa real.
 *
 * No sucesso a mensagem entra no cache do detalhe ANTES da invalidação —
 * sem isso o balão otimista sumiria e a mensagem só voltaria no refetch.
 */
export function useEnviarMensagem(feedbackId: number) {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: (texto: string) => enviarMensagem(feedbackId, texto),
      onSuccess: (evento) => {
         queryClient.setQueryData<FeedbackDetalhe>(
            feedbackKeys.meDetail(feedbackId),
            (atual) =>
               // Um refetch concorrente pode já ter trazido este evento —
               // sem a guarda ele entraria duas vezes.
               atual && !atual.eventos.some((e) => e.id === evento.id)
                  ? { ...atual, eventos: [...atual.eventos, evento] }
                  : atual
         );
         queryClient.invalidateQueries({ queryKey: feedbackKeys.all });
      },
   });
}
