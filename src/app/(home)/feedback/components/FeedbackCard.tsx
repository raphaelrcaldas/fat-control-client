"use client";

import { Button } from "flowbite-react";
import { MdOutlineChat, MdReply } from "react-icons/md";
import { formatDateTime } from "utils/dateHandler";
import type { Feedback } from "services/routes/feedbacks";
import { STATUS_META, TIPO_META } from "../feedbackMeta";

interface FeedbackCardProps {
   feedback: Feedback;
   onResponder?: (feedback: Feedback) => void;
}

export function FeedbackCard({ feedback, onResponder }: FeedbackCardProps) {
   const tipo = TIPO_META[feedback.tipo];
   const status = STATUS_META[feedback.status];
   const Icone = tipo.icon;

   return (
      <article className="space-y-3 rounded border border-slate-200 bg-white p-4 shadow-sm">
         <header className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
               <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-600">
                  <Icone className="h-5 w-5" aria-hidden />
               </div>
               <div className="min-w-0">
                  <h3 className="font-semibold break-words text-slate-900">
                     {feedback.titulo}
                  </h3>
                  <p className="text-xs text-slate-500">
                     <span className="uppercase">
                        {feedback.autor.p_g} {feedback.autor.nome_guerra}
                     </span>
                     {" · "}
                     {tipo.label}
                     {" · "}
                     {formatDateTime(feedback.created_at)}
                     {feedback.rota ? ` · ${feedback.rota}` : ""}
                  </p>
               </div>
            </div>
            <span
               className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${status.badge}`}
            >
               {status.label}
            </span>
         </header>

         <p className="text-sm whitespace-pre-line text-slate-700">
            {feedback.descricao}
         </p>

         {feedback.resposta && (
            <div className="space-y-1 rounded border-l-4 border-slate-300 bg-slate-50 p-3">
               <p className="flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase">
                  <MdOutlineChat className="h-3.5 w-3.5" aria-hidden />
                  Resposta
                  {feedback.respondente && (
                     <span className="uppercase">
                        {" · "}
                        {feedback.respondente.p_g}{" "}
                        {feedback.respondente.nome_guerra}
                     </span>
                  )}
                  {feedback.respondido_em && (
                     <span className="font-normal normal-case">
                        {" · "}
                        {formatDateTime(feedback.respondido_em)}
                     </span>
                  )}
               </p>
               <p className="text-sm whitespace-pre-line text-slate-700">
                  {feedback.resposta}
               </p>
            </div>
         )}

         {onResponder && (
            <div className="flex justify-end">
               <Button
                  size="xs"
                  color="light"
                  onClick={() => onResponder(feedback)}
               >
                  <MdReply className="mr-1.5 h-4 w-4" aria-hidden />
                  {feedback.resposta ? "Editar tratamento" : "Tratar"}
               </Button>
            </div>
         )}
      </article>
   );
}
