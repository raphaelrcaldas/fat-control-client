"use client";

import { useMemo, useState } from "react";
import { Button } from "flowbite-react";
import { MdErrorOutline, MdOutlineRateReview } from "react-icons/md";
import clsx from "clsx";
import { EmptyState } from "@/components/ui/EmptyState";
import { useFeedbacks } from "@/hooks/queries";
import type { Feedback, FeedbackStatus } from "services/routes/feedbacks";
import { usePermBased } from "../hooks/usePermBased";
import { FeedbackCard } from "./components/FeedbackCard";
import { FeedbacksSkeleton } from "./components/FeedbacksSkeleton";
import { TratarFeedbackModal } from "./components/TratarFeedbackModal";
import { STATUS_META, STATUS_ORDEM } from "./feedbackMeta";

export default function FeedbackPage() {
   // A lista inteira da org vem numa consulta e o filtro é local: são os
   // contadores por status que orientam o trabalho ("3 abertos"), e eles
   // exigem o conjunto completo. O endpoint aceita `status`/`tipo` para
   // quem consultar de fora — a tela não precisa deles.
   const { data: feedbacks = [], isLoading, isError, refetch } = useFeedbacks();
   const { hasPerm } = usePermBased();
   const podeTratar = hasPerm("feedbacks", "update");

   const [statusFiltro, setStatusFiltro] = useState<FeedbackStatus | null>(
      null
   );
   const [selecionado, setSelecionado] = useState<Feedback | null>(null);

   const contagem = useMemo(() => {
      const mapa = {} as Record<FeedbackStatus, number>;
      for (const f of feedbacks) {
         mapa[f.status] = (mapa[f.status] ?? 0) + 1;
      }
      return mapa;
   }, [feedbacks]);

   const visiveis = statusFiltro
      ? feedbacks.filter((f) => f.status === statusFiltro)
      : feedbacks;

   return (
      <div className="flex flex-col space-y-2">
         {/* Masthead */}
         <header className="relative overflow-hidden rounded border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6 sm:py-5">
            <span
               aria-hidden
               className="bg-primary-600 absolute top-0 left-0 h-full w-1"
            />
            <div className="relative flex flex-wrap items-center justify-between gap-4">
               <div className="flex min-w-0 items-center gap-4">
                  <div className="bg-primary-50 text-primary-600 ring-primary-100 grid h-12 w-12 shrink-0 place-items-center rounded-md ring-1 ring-inset">
                     <MdOutlineRateReview className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                     <span className="text-primary-600 block font-mono text-[10px] font-bold tracking-[0.3em] uppercase">
                        Portal do Tripulante
                     </span>
                     <h1 className="text-2xl leading-none font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                        Feedbacks
                     </h1>
                  </div>
               </div>
            </div>
         </header>

         {/* Filtro por status — os contadores SÃO o filtro */}
         {!isLoading && !isError && feedbacks.length > 0 && (
            <div className="flex flex-wrap gap-2 rounded border border-slate-200 bg-white p-2 shadow-sm">
               <button
                  type="button"
                  onClick={() => setStatusFiltro(null)}
                  aria-pressed={statusFiltro === null}
                  className={clsx(
                     "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                     statusFiltro === null
                        ? "border-primary-600 bg-primary-50 text-primary-700"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  )}
               >
                  Todos ({feedbacks.length})
               </button>
               {STATUS_ORDEM.filter((s) => contagem[s]).map((s) => (
                  <button
                     key={s}
                     type="button"
                     onClick={() =>
                        setStatusFiltro(statusFiltro === s ? null : s)
                     }
                     aria-pressed={statusFiltro === s}
                     className={clsx(
                        "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                        statusFiltro === s
                           ? STATUS_META[s].badge
                           : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                     )}
                  >
                     {STATUS_META[s].label} ({contagem[s]})
                  </button>
               ))}
            </div>
         )}

         {isLoading && <FeedbacksSkeleton />}

         {/* Falha de carga não é caixa vazia: dizer "nenhum feedback" quando
             a consulta quebrou esconde trabalho pendente da unidade. */}
         {isError && (
            <div className="flex flex-col items-center gap-3 rounded border border-red-200 bg-white p-8 text-center shadow-sm">
               <MdErrorOutline className="h-8 w-8 text-red-600" aria-hidden />
               <div>
                  <p className="font-semibold text-slate-900">
                     Não foi possível carregar os feedbacks
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
               title="Nenhum feedback recebido"
               description="O que os tripulantes enviarem pelo FatBird aparece aqui."
            />
         )}

         {!isError && visiveis.length > 0 && (
            <div className="space-y-3">
               {visiveis.map((feedback) => (
                  <FeedbackCard
                     key={feedback.id}
                     feedback={feedback}
                     onResponder={
                        podeTratar ? (f) => setSelecionado(f) : undefined
                     }
                  />
               ))}
            </div>
         )}

         {!isError && feedbacks.length > 0 && visiveis.length === 0 && (
            <EmptyState
               icon={MdOutlineRateReview}
               title="Nenhum feedback neste status"
               description="Troque o filtro para ver os demais."
            />
         )}

         {selecionado && (
            <TratarFeedbackModal
               show={!!selecionado}
               onClose={() => setSelecionado(null)}
               feedback={selecionado}
            />
         )}
      </div>
   );
}
