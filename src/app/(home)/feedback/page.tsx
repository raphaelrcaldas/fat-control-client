"use client";

import { useState } from "react";
import { Button } from "flowbite-react";
import { HiPlus } from "react-icons/hi";
import { MdErrorOutline, MdOutlineRateReview } from "react-icons/md";
import { EmptyState } from "@/components/ui/EmptyState";
import { EnviarFeedbackModal } from "@/components/feedback/EnviarFeedbackModal";
import {
   TIPOS_AVISO_AUTOR,
   useAvisosNaoLidosDeFeedback,
   useMeusFeedbacks,
} from "@/hooks/queries";
import { useSearchParamsUpdater } from "@/hooks/useSearchParamsState";
import { ConversaModal } from "./components/ConversaModal";
import { FeedbackCard } from "./components/FeedbackCard";
import { FeedbackListSkeleton } from "./components/FeedbackListSkeleton";

/**
 * "Meus feedbacks" — contrapartida do autor no client (o FatBird já tem a
 * mesma tela). Sem item na sidebar (RBAC filtra o menu, e esta rota não é um
 * recurso permissionado): o acesso é pelo link do `EnviarFeedbackModal` e
 * pelo sino. Ver `docs/ai/notes/feedback-conversa.md`.
 *
 * A conversa abre em modal (`ConversaModal`), com o `id` na query
 * (`?id=<id>`): é o deep-link do sino, e recarregar a página reabre a
 * mesma conversa. Abrir e fechar usam `replace` — o modal não é uma
 * página, e voltar não deve reabrir conversas já fechadas.
 */
export default function MeusFeedbacksPage() {
   const [novoAberto, setNovoAberto] = useState(false);
   const { searchParams, setParams } = useSearchParamsUpdater();
   const idParam = searchParams.get("id") ?? "";
   // Só inteiro positivo vira requisição; o resto abre o "não encontrado"
   // do modal (a query fica desligada e não há dado).
   const conversaId = idParam
      ? /^[1-9]\d*$/.test(idParam)
         ? Number(idParam)
         : -1
      : null;
   const naoLidas = useAvisosNaoLidosDeFeedback(TIPOS_AVISO_AUTOR);
   const {
      data: feedbacks = [],
      isLoading,
      isError,
      isFetching,
      refetch,
   } = useMeusFeedbacks();

   return (
      <div className="space-y-2">
         {/* Masthead — padrão canônico de `ops/operacoes/page.tsx`. */}
         <header className="relative overflow-hidden rounded border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6 sm:py-5">
            <span
               aria-hidden
               className="bg-primary-600 absolute top-0 left-0 h-full w-1"
            />
            <div className="relative flex flex-wrap items-center justify-between gap-4">
               <div className="flex min-w-0 items-center gap-4">
                  <div className="bg-primary-50 text-primary-600 ring-primary-100 grid h-12 w-12 shrink-0 place-items-center rounded-md ring-1 ring-inset">
                     <MdOutlineRateReview className="h-6 w-6" aria-hidden />
                  </div>
                  <div className="min-w-0">
                     <span className="text-primary-600 block font-mono text-[10px] font-bold tracking-[0.3em] uppercase">
                        Suporte
                     </span>
                     <h1 className="text-2xl leading-none font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                        Meus feedbacks
                     </h1>
                  </div>
               </div>
               <Button
                  color="primary"
                  onClick={() => setNovoAberto(true)}
                  className="font-semibold whitespace-nowrap"
               >
                  <HiPlus className="mr-2 h-4 w-4" aria-hidden />
                  Novo feedback
               </Button>
            </div>
         </header>

         {isLoading && <FeedbackListSkeleton />}

         {/* Falha de carga SEM nada em tela é dita como falha: "nada
             enviado" quando a requisição quebrou faria a pessoa mandar tudo
             de novo. Com dado (stale) já carregado, um refetch que falha
             (ex.: `refetchOnWindowFocus`) não pode derrubar a lista por
             cima do que já se sabe — vira aviso discreto, abaixo. */}
         {isError && feedbacks.length === 0 && (
            <div
               role="alert"
               className="flex flex-col items-center gap-3 rounded border border-red-200 bg-white p-8 text-center shadow-sm"
            >
               <MdErrorOutline className="h-8 w-8 text-red-600" aria-hidden />
               <div>
                  <p className="font-semibold text-slate-900">
                     Não foi possível carregar seus feedbacks
                  </p>
                  <p className="text-sm text-slate-500">
                     Verifique a conexão e tente novamente.
                  </p>
               </div>
               <Button color="light" onClick={() => refetch()}>
                  Tentar novamente
               </Button>
            </div>
         )}

         {!isLoading && !isError && feedbacks.length === 0 && (
            <EmptyState
               icon={MdOutlineRateReview}
               title="Você ainda não enviou nada"
               description="Achou um problema ou tem uma ideia para o sistema? Conte para a gente."
               action={
                  <Button color="primary" onClick={() => setNovoAberto(true)}>
                     <HiPlus className="mr-2 h-4 w-4" aria-hidden />
                     Enviar feedback
                  </Button>
               }
            />
         )}

         {feedbacks.length > 0 && (
            <>
               {isError && (
                  <p
                     role="status"
                     className="flex items-center gap-2 rounded border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500"
                  >
                     <MdErrorOutline
                        aria-hidden
                        className="size-3.5 shrink-0"
                     />
                     <span className="min-w-0 flex-1 truncate">
                        Não foi possível atualizar a lista
                     </span>
                     <button
                        type="button"
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="min-h-[24px] shrink-0 font-semibold text-slate-900 underline underline-offset-2 disabled:opacity-50"
                     >
                        Tentar novamente
                     </button>
                  </p>
               )}
               <div className="space-y-3">
                  {feedbacks.map((feedback) => (
                     <FeedbackCard
                        key={feedback.id}
                        feedback={feedback}
                        novaMensagem={naoLidas.has(feedback.id)}
                        onAbrir={(id) => setParams({ id: String(id) })}
                     />
                  ))}
               </div>
            </>
         )}

         <ConversaModal
            feedbackId={conversaId}
            onClose={() => setParams({ id: undefined })}
            onNovoFeedback={() => {
               setParams({ id: undefined });
               setNovoAberto(true);
            }}
         />

         {/* Sem `rota`: aberto daqui, o feedback é sobre o sistema em geral. */}
         <EnviarFeedbackModal
            show={novoAberto}
            onClose={() => setNovoAberto(false)}
         />
      </div>
   );
}
