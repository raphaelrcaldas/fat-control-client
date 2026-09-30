"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "flowbite-react";
import { MdErrorOutline, MdOutlineRateReview, MdReply } from "react-icons/md";
import clsx from "clsx";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/app/context/toast";
import {
   TIPOS_AVISO_ADMIN,
   useAvisosNaoLidosDeFeedback,
   useDeleteFeedback,
   useFeedbacks,
} from "@/hooks/queries";
import { useSearchParamsUpdater } from "@/hooks/useSearchParamsState";
import { useTenants } from "@/hooks/queries/useTenants";
import { isOrgTheme, type OrgTheme } from "@/lib/orgTheme";
import type { Feedback, FeedbackStatus } from "services/routes/feedbacks";
import { FeedbackCard } from "./components/FeedbackCard";
import { FeedbacksSkeleton } from "./components/FeedbacksSkeleton";
import { TratarFeedbackModal } from "./components/TratarFeedbackModal";
import {
   STATUS_META,
   STATUS_ORDEM,
   aguardandoResposta,
} from "@/components/feedback/feedbackMeta";

/** Filtro da caixa: um status, ou o recorte de triagem "aguardando". */
type Filtro = FeedbackStatus | "aguardando" | null;

/**
 * Caixa de feedbacks da administração de sistema. A conversa abre em modal
 * com o `id` na query (`?id=<id>`) — é o deep-link do sino (aviso de
 * feedback novo ou de mensagem do autor, `notificacaoHref.ts`) e sobrevive
 * ao recarregar.
 */
export default function FeedbackPage() {
   // A caixa inteira vem numa consulta e o filtro é local: são os
   // contadores por status que orientam o trabalho ("3 abertos"), e eles
   // exigem o conjunto completo. O endpoint aceita `status`/`tipo`/`uae`
   // para quem consultar de fora — a tela não precisa deles.
   const {
      data: feedbacksData,
      isLoading,
      isError,
      isFetching,
      refetch,
   } = useFeedbacks();
   const feedbacks = feedbacksData ?? [];
   // Falha SEM caixa em tela é dita como falha; com a caixa já carregada, um
   // refetch que falha vira aviso e a lista continua
   const semDado = isError && !feedbacksData;
   const tenantsQuery = useTenants();
   const { push } = useToast();
   const deleteMutation = useDeleteFeedback();

   const naoLidos = useAvisosNaoLidosDeFeedback(TIPOS_AVISO_ADMIN);
   const { searchParams, setParams } = useSearchParamsUpdater();

   const [filtro, setFiltro] = useState<Filtro>(null);
   const [paraExcluir, setParaExcluir] = useState<Feedback | null>(null);

   // A conversa aberta é a da URL, resolvida na lista (o modal precisa do
   // resumo para o cabeçalho). Id que a caixa não tem — excluído, ou link
   // velho — avisa e limpa a URL, em vez de deixar a tela num estado
   // "aberto" sem modal.
   const idParam = searchParams.get("id");
   const selecionado = idParam
      ? (feedbacks.find((f) => String(f.id) === idParam) ?? null)
      : null;
   const idInexistente =
      idParam !== null && !isLoading && !isError && selecionado === null;
   useEffect(() => {
      if (!idInexistente) return;
      push({
         type: "error",
         message: "Feedback não encontrado — ele pode ter sido excluído.",
      });
      setParams({ id: undefined });
   }, [idInexistente, push, setParams]);

   const handleExcluir = async () => {
      if (!paraExcluir) return;
      try {
         await deleteMutation.mutateAsync(paraExcluir.id);
         push({ message: "Feedback excluído", type: "success" });
         setParaExcluir(null);
         // Excluído com a conversa aberta atrás: não sobra `?id=` órfão.
         if (idParam === String(paraExcluir.id)) setParams({ id: undefined });
      } catch (err: unknown) {
         const message =
            err instanceof Error ? err.message : "Erro ao excluir feedback";
         push({ title: "Erro", message, type: "error" });
      }
   };

   // sigla -> tema, para pintar o dot da unidade de origem de cada cartão
   const orgTemas = useMemo(() => {
      const map: Record<string, OrgTheme> = {};
      for (const tenant of tenantsQuery.data ?? []) {
         if (isOrgTheme(tenant.tema)) map[tenant.organizacao_id] = tenant.tema;
      }
      return map;
   }, [tenantsQuery.data]);

   const contagem = useMemo(() => {
      const mapa = {} as Record<FeedbackStatus, number>;
      for (const f of feedbacks) {
         mapa[f.status] = (mapa[f.status] ?? 0) + 1;
      }
      return mapa;
   }, [feedbacks]);
   const totalAguardando = useMemo(
      () => feedbacks.filter(aguardandoResposta).length,
      [feedbacks]
   );

   const visiveis =
      filtro === "aguardando"
         ? feedbacks.filter(aguardandoResposta)
         : filtro
           ? feedbacks.filter((f) => f.status === filtro)
           : feedbacks;

   const chip = (ativo: boolean, cor: string) =>
      clsx(
         "min-h-[24px] rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
         ativo
            ? cor
            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
      );

   return (
      <div className="flex flex-col space-y-2">
         {/* Masthead — chrome slate neutro: escopo de admin de SISTEMA,
             cross-tenant, sem a cor de marca de nenhuma org */}
         <header className="relative overflow-hidden rounded border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6 sm:py-5">
            <span
               aria-hidden
               className="absolute top-0 left-0 h-full w-1 bg-slate-600"
            />
            <div className="relative flex flex-wrap items-center justify-between gap-4">
               <div className="flex min-w-0 items-center gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-600 ring-1 ring-slate-200 ring-inset">
                     <MdOutlineRateReview className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                     <span className="block font-mono text-[10px] font-bold tracking-[0.3em] text-slate-600 uppercase">
                        Administração
                     </span>
                     <h1 className="text-2xl leading-none font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                        Feedbacks
                     </h1>
                  </div>
               </div>
            </div>
         </header>

         {/* Filtro — os contadores SÃO o filtro. "Aguardando resposta"
             vem primeiro: é a fila de trabalho; os status vêm depois. */}
         {!isLoading && feedbacks.length > 0 && (
            <div className="flex flex-wrap gap-2 rounded border border-slate-200 bg-white p-2 shadow-sm">
               <button
                  type="button"
                  onClick={() => setFiltro(null)}
                  aria-pressed={filtro === null}
                  className={chip(
                     filtro === null,
                     "border-slate-400 bg-slate-100 text-slate-800"
                  )}
               >
                  Todos ({feedbacks.length})
               </button>
               {(totalAguardando > 0 || filtro === "aguardando") && (
                  <button
                     type="button"
                     onClick={() =>
                        setFiltro(filtro === "aguardando" ? null : "aguardando")
                     }
                     aria-pressed={filtro === "aguardando"}
                     className={clsx(
                        chip(
                           filtro === "aguardando",
                           "border-slate-800 bg-slate-800 text-white"
                        ),
                        "inline-flex items-center gap-1"
                     )}
                  >
                     <MdReply className="size-3.5" aria-hidden />
                     Aguardando resposta ({totalAguardando})
                  </button>
               )}
               {STATUS_ORDEM.filter((s) => contagem[s]).map((s) => (
                  <button
                     key={s}
                     type="button"
                     onClick={() => setFiltro(filtro === s ? null : s)}
                     aria-pressed={filtro === s}
                     className={chip(filtro === s, STATUS_META[s].badge)}
                  >
                     {STATUS_META[s].label} ({contagem[s]})
                  </button>
               ))}
            </div>
         )}

         {isLoading && <FeedbacksSkeleton />}

         {/* Falha de carga não é caixa vazia: dizer "nenhum feedback" quando
             a consulta quebrou esconde trabalho pendente. */}
         {semDado && (
            <div
               role="alert"
               className="flex flex-col items-center gap-3 rounded border border-red-200 bg-white p-8 text-center shadow-sm"
            >
               <MdErrorOutline className="h-8 w-8 text-red-600" aria-hidden />
               <div>
                  <p className="font-semibold text-slate-900">
                     Não foi possível carregar os feedbacks
                  </p>
                  <p className="text-sm text-slate-500">
                     Verifique a conexão e tente novamente.
                  </p>
               </div>
               <Button
                  color="light"
                  onClick={() => refetch()}
                  disabled={isFetching}
               >
                  Tentar novamente
               </Button>
            </div>
         )}

         {isError && feedbacksData && (
            <p
               role="status"
               className="flex items-center gap-2 rounded border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500"
            >
               <MdErrorOutline aria-hidden className="size-3.5 shrink-0" />
               <span className="min-w-0 flex-1 truncate">
                  Não foi possível atualizar a caixa
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

         {!isLoading && !isError && feedbacks.length === 0 && (
            <EmptyState
               icon={MdOutlineRateReview}
               title="Nenhum feedback recebido"
               description="O que for enviado pelo FatBird e pelo client aparece aqui."
            />
         )}

         {visiveis.length > 0 && (
            <div className="space-y-3">
               {visiveis.map((feedback) => (
                  <FeedbackCard
                     key={feedback.id}
                     feedback={feedback}
                     tema={orgTemas[feedback.uae]}
                     naoLido={naoLidos.has(feedback.id)}
                     onAbrir={(f) => setParams({ id: String(f.id) })}
                     onExcluir={(f) => setParaExcluir(f)}
                  />
               ))}
            </div>
         )}

         {feedbacks.length > 0 && visiveis.length === 0 && (
            <EmptyState
               icon={MdOutlineRateReview}
               title={
                  filtro === "aguardando"
                     ? "Nada aguardando resposta"
                     : "Nenhum feedback neste status"
               }
               description="Troque o filtro para ver os demais."
            />
         )}

         {selecionado && (
            <TratarFeedbackModal
               show
               onClose={() => setParams({ id: undefined })}
               feedback={selecionado}
            />
         )}

         {/* Exclusão é definitiva (não há soft delete na tabela) e o texto
             cita o assunto: numa caixa de cartões parecidos, "tem certeza?"
             sozinho não diz qual está prestes a sumir. */}
         {paraExcluir && (
            <ConfirmModal
               show
               title="Excluir feedback?"
               description={`"${paraExcluir.titulo}" será apagado definitivamente, junto com a conversa com o autor.`}
               isLoading={deleteMutation.isPending}
               onClose={() => setParaExcluir(null)}
               onConfirm={handleExcluir}
               confirmButtonText="Excluir"
            />
         )}
      </div>
   );
}
