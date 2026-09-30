"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
   Button,
   Modal,
   ModalBody,
   ModalFooter,
   ModalHeader,
   Spinner,
} from "flowbite-react";
import { MdErrorOutline, MdLockOutline, MdSearchOff } from "react-icons/md";
import { EmptyState } from "@/components/ui/EmptyState";
import {
   feedbackKeys,
   TIPOS_AVISO_AUTOR,
   useEnviarMensagem,
   useMarcarConversaLida,
   useMeuFeedback,
} from "@/hooks/queries";
import type { FeedbackDetalhe } from "services/routes/feedbacks";
import { isConflictError, isNotFoundError } from "utils/apiErrors";
import { formatDateTime } from "utils/dateHandler";
import { STATUS_META, TIPO_META } from "@/components/feedback/feedbackMeta";
import { Balao, Conversa } from "./Conversa";
import { CampoMensagem } from "./CampoMensagem";
import { ConversaSkeleton, SkeletonBaloes } from "./ConversaSkeleton";

/**
 * Conversa de UM feedback do autor, em modal sobre "Meus feedbacks".
 *
 * Era uma rota própria (`/feedback/[id]`), trocada por modal em
 * 2026-09-26: na largura do client a conversa ocupava uma faixa estreita
 * de uma página inteira. O FatBird mantém a rota — no celular a conversa
 * É a tela. O `id` vive na query (`/feedback?id=<id>`), que é o que o
 * sino usa como deep-link (`notificacaoHref.ts`).
 *
 * Abrir marca como lidos os avisos desta conversa
 * (`useMarcarConversaLida`). O rodapé é o campo — ou, com o feedback
 * encerrado, o aviso de só leitura.
 */
export function ConversaModal({
   feedbackId,
   onClose,
   onNovoFeedback,
}: {
   /** `null` = fechado; id inválido na URL chega como não positivo e abre
    *  o "não encontrado" sem requisição. */
   feedbackId: number | null;
   onClose: () => void;
   /** Conversa encerrada oferece abrir um feedback novo. */
   onNovoFeedback: () => void;
}) {
   const queryClient = useQueryClient();
   const id = feedbackId !== null && feedbackId > 0 ? feedbackId : null;
   const {
      data: feedback,
      isLoading,
      isError,
      error,
      refetch,
      isFetching,
      isPlaceholderData,
   } = useMeuFeedback(id);
   useMarcarConversaLida(id, TIPOS_AVISO_AUTOR);
   const envio = useEnviarMensagem(id ?? 0);
   const { reset: resetEnvio } = envio;

   // O balão otimista (e o erro) de um envio pertence à conversa em que
   // foi feito: trocar de feedback, ou reabrir, começa limpo.
   useEffect(() => {
      resetEnvio();
   }, [id, resetEnvio]);

   // 409: a administração encerrou enquanto a pessoa escrevia. 404: o
   // feedback sumiu no meio do caminho (excluído). Os dois recarregam a
   // conversa para o modal assumir o estado atual; o balão otimista fica
   // como "não enviada" do jeito apropriado, sem botão de repetir.
   const encerradaNoEnvio = envio.isError && isConflictError(envio.error);
   const excluidoNoEnvio = envio.isError && isNotFoundError(envio.error);
   useEffect(() => {
      if ((encerradaNoEnvio || excluidoNoEnvio) && id !== null) {
         queryClient.invalidateQueries({
            queryKey: feedbackKeys.meDetail(id),
         });
      }
   }, [encerradaNoEnvio, excluidoNoEnvio, id, queryClient]);

   // 404 é definitivo mesmo com dado velho em cache: o cabeçalho não pode
   // continuar mostrando título/selo de um feedback que a API já disse não
   // existir mais para este usuário.
   const naoEncontrado = isNotFoundError(error);
   const visivel = naoEncontrado ? undefined : feedback;
   const status = visivel ? STATUS_META[visivel.status] : null;
   const tipo = visivel ? TIPO_META[visivel.tipo] : null;
   const meta = visivel
      ? `${tipo?.label} · enviado em ${formatDateTime(visivel.created_at)}` +
        (visivel.rota ? ` · tela ${visivel.rota}` : "")
      : "";

   const pendente =
      visivel && (envio.isPending || envio.isError) && envio.variables ? (
         <Balao
            evento={{
               id: -1,
               tipo: "mensagem",
               texto: envio.variables,
               status: null,
               autor: visivel.autor,
               do_autor: true,
               created_at: new Date().toISOString(),
            }}
            estado={
               envio.isPending
                  ? "enviando"
                  : excluidoNoEnvio
                    ? "excluido"
                    : encerradaNoEnvio
                      ? "encerrada"
                      : "falhou"
            }
            onRetry={() => envio.mutate(envio.variables!)}
         />
      ) : null;

   let corpo: React.ReactNode;
   if (isLoading) {
      corpo = <ConversaSkeleton />;
   } else if (naoEncontrado || (!isError && !feedback)) {
      // 404 único de propósito: não diz "é de outra pessoa" nem "é de
      // outro app". A sobra (sem erro e sem dado) é o id inválido na URL.
      corpo = (
         <EmptyState
            icon={MdSearchOff}
            title="Feedback não encontrado"
            description="Ele pode ter sido excluído pela administração, ou o link está incorreto."
         />
      );
   } else if (isError && !feedback) {
      // Falha sem NENHUM dado para mostrar. Nunca vira "não encontrado" —
      // a rede caiu, não o registro sumiu.
      corpo = (
         <div
            role="alert"
            className="flex flex-col items-center gap-3 p-6 text-center"
         >
            <MdErrorOutline className="h-8 w-8 text-red-600" aria-hidden />
            <div>
               <p className="font-semibold text-slate-900">
                  Não foi possível carregar este feedback
               </p>
               <p className="text-sm text-slate-500">
                  A consulta falhou — verifique a conexão e tente novamente.
               </p>
            </div>
            <Button
               color="light"
               onClick={() => refetch()}
               disabled={isFetching}
               aria-busy={isFetching}
            >
               {isFetching && (
                  <Spinner size="sm" color="primary" className="mr-2" />
               )}
               Tentar novamente
            </Button>
         </div>
      );
   } else {
      corpo = (
         <LinhaDoTempo
            key={feedbackId}
            feedback={feedback!}
            pendente={pendente}
            enviando={envio.isPending}
            isPlaceholderData={isPlaceholderData}
            falhaAoAtualizar={isError}
            atualizando={isFetching}
            onRetry={() => refetch()}
         />
      );
   }

   let rodape: React.ReactNode = null;
   if (visivel && status?.terminal) {
      rodape = (
         <div className="flex w-full flex-wrap items-center gap-3">
            <MdLockOutline
               aria-hidden
               className="size-4 shrink-0 text-slate-500"
            />
            <p className="min-w-0 flex-1 text-sm text-slate-700">
               Conversa encerrada — este feedback foi marcado como{" "}
               {status.label}.
            </p>
            <Button size="sm" color="light" onClick={onNovoFeedback}>
               Novo feedback
            </Button>
         </div>
      );
   } else if (visivel) {
      rodape = (
         <CampoMensagem
            key={feedbackId}
            onEnviar={(texto) => envio.mutate(texto)}
            enviando={envio.isPending}
            desabilitado={isPlaceholderData}
         />
      );
   }

   return (
      // `dismissible`: Esc, clique fora e o X (regra de todo modal do
      // projeto). Ancorado no topo (`items-start`): a conversa cresce ao
      // carregar e ao enviar, e centralizado o modal inteiro pularia.
      <Modal
         show={feedbackId !== null}
         onClose={onClose}
         size="3xl"
         dismissible
         className="items-start md:py-8"
      >
         {/* `min-w-0` no título: sem ele o `<h3>` do Flowbite não encolhe,
             o truncamento não acontece e o X de fechar é empurrado. */}
         <ModalHeader
            className="border-slate-200 p-4"
            theme={{ title: "min-w-0 flex-1" }}
         >
            <span className="flex min-w-0 items-center gap-2">
               <span
                  className="min-w-0 truncate text-base font-bold text-slate-900 sm:text-lg"
                  title={visivel?.titulo}
               >
                  {visivel?.titulo ?? "Feedback"}
               </span>
               {status && (
                  <span
                     className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${status.badge}`}
                  >
                     {status.label}
                  </span>
               )}
            </span>
            {meta && (
               <span
                  className="block truncate text-xs font-normal text-slate-500"
                  title={meta}
               >
                  {meta}
               </span>
            )}
         </ModalHeader>
         <ModalBody className="min-h-[40dvh] bg-slate-50 p-4">
            {corpo}
         </ModalBody>
         {rodape && (
            <ModalFooter className="border-t border-slate-200 p-3">
               {rodape}
            </ModalFooter>
         )}
      </Modal>
   );
}

/**
 * Conversa rolável, em componente próprio: o `Modal` do Flowbite monta o
 * conteúdo num `FloatingPortal` um ciclo depois do resto da árvore, e um
 * efeito de rolagem no componente PAI encontraria `fimRef.current ===
 * null` (mesma armadilha de `admin/feedback/.../TratarFeedbackModal.tsx`).
 * Aqui o efeito nasce junto do conteúdo, dentro do portal.
 *
 * Rola até o fim ao chegar o dado REAL (uma vez: rolar sobre o placeholder
 * deixaria a mensagem mais nova abaixo da dobra quando a conversa inteira
 * chegasse) e a cada envio.
 */
function LinhaDoTempo({
   feedback,
   pendente,
   enviando,
   isPlaceholderData,
   falhaAoAtualizar,
   atualizando,
   onRetry,
}: {
   feedback: FeedbackDetalhe;
   pendente: React.ReactNode;
   enviando: boolean;
   isPlaceholderData: boolean;
   falhaAoAtualizar: boolean;
   atualizando: boolean;
   onRetry: () => void;
}) {
   const fimRef = useRef<HTMLDivElement>(null);
   const rolouInicial = useRef(false);
   const totalEventos = feedback.eventos.length;

   useEffect(() => {
      if (isPlaceholderData) return;
      if (!rolouInicial.current || enviando) {
         rolouInicial.current = true;
         fimRef.current?.scrollIntoView({ block: "end" });
      }
   }, [isPlaceholderData, enviando, totalEventos]);

   return (
      <div className="space-y-2">
         {/* Dado em tela é de uma consulta anterior que falhou agora: a
             conversa continua montada, só um aviso discreto. */}
         {falhaAoAtualizar && (
            <p
               role="status"
               className="flex items-center gap-2 rounded border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500"
            >
               <MdErrorOutline aria-hidden className="size-3.5 shrink-0" />
               <span className="min-w-0 flex-1 truncate">
                  Não foi possível atualizar a conversa
               </span>
               <button
                  type="button"
                  onClick={onRetry}
                  disabled={atualizando}
                  className="min-h-[24px] shrink-0 font-semibold text-slate-900 underline underline-offset-2 disabled:opacity-50"
               >
                  Tentar novamente
               </button>
            </p>
         )}
         <Conversa feedback={feedback} pendente={pendente} />
         {/* Placeholder semeado pela lista: só a abertura é dado real.
             `eventos` ainda é `[]`, e mostrar isso como conversa completa
             faria a pessoa achar que não há histórico. */}
         {isPlaceholderData && <SkeletonBaloes />}
         <div ref={fimRef} />
      </div>
   );
}
