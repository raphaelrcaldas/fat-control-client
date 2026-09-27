import clsx from "clsx";
import { HiChevronRight } from "react-icons/hi";
import { formatRelativeTime } from "utils/dateHandler";
import type { Feedback } from "services/routes/feedbacks";
import { STATUS_META, TIPO_META } from "@/components/feedback/feedbackMeta";

/**
 * Card da lista "Meus feedbacks". ABRE a conversa num modal
 * (`ConversaModal`) — o card inteiro é um botão, sem controle interativo
 * dentro. Espelha o card do FatBird (mesma feature, outra biblioteca de
 * UI; lá ele navega para a rota da conversa):
 * `fatbird/src/app/(home)/feedback/components/FeedbackCard.tsx`.
 */
export function FeedbackCard({
   feedback,
   novaMensagem,
   onAbrir,
}: {
   feedback: Feedback;
   /** Há aviso não lido da administração para esta conversa. */
   novaMensagem: boolean;
   onAbrir: (id: number) => void;
}) {
   const tipo = TIPO_META[feedback.tipo];
   const status = STATUS_META[feedback.status];
   const Icone = tipo.icon;
   const ultima = feedback.ultima_mensagem;

   // Prévia: quem falou por último e o quê. Sem mensagem, a própria
   // descrição (a abertura da conversa).
   const quem = !ultima
      ? null
      : ultima.do_autor
        ? "Você"
        : ultima.autor
          ? `${ultima.autor.p_g} ${ultima.autor.nome_guerra}`.toUpperCase()
          : "Administração";
   const previa = ultima?.texto ?? feedback.descricao;
   const quando = formatRelativeTime(feedback.ultima_atividade);
   const meta = [
      tipo.label,
      quando,
      feedback.total_mensagens > 0
         ? `${feedback.total_mensagens} ${
              feedback.total_mensagens === 1 ? "mensagem" : "mensagens"
           }`
         : null,
   ]
      .filter(Boolean)
      .join(" · ");

   return (
      <button
         type="button"
         onClick={() => onAbrir(feedback.id)}
         className={clsx(
            "group relative block w-full rounded border border-slate-200 bg-white py-3 pr-9 pl-3 text-left shadow-sm transition-colors",
            "hover:border-primary-600/40 hover:shadow-md",
            "focus-visible:ring-primary-600 outline-none focus-visible:ring-2"
         )}
         aria-label={`Feedback ${feedback.titulo}, ${status.label}${
            novaMensagem ? ", nova mensagem" : ""
         }${quem ? `, última mensagem de ${quem}` : ""}`}
      >
         <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
               <Icone className="size-4" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
               <div className="flex min-w-0 items-center gap-2">
                  <h2
                     className="min-w-0 flex-1 truncate text-sm font-bold text-slate-900"
                     title={feedback.titulo}
                  >
                     {feedback.titulo}
                  </h2>
                  <span
                     className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${status.badge}`}
                  >
                     {status.label}
                  </span>
               </div>
               <p className="truncate text-xs text-slate-500" title={meta}>
                  {meta}
               </p>
            </div>
         </div>

         <div className="mt-2 flex min-w-0 items-center gap-2">
            <p
               className={clsx(
                  "min-w-0 flex-1 truncate text-sm",
                  novaMensagem ? "text-slate-900" : "text-slate-600"
               )}
               title={quem ? `${quem}: ${previa}` : previa}
            >
               {quem && (
                  <span className="font-semibold text-slate-800">{quem}: </span>
               )}
               {previa}
            </p>
            {/* Mesmo selo do FatBird: ponto de marca, sem pulse. */}
            {novaMensagem && (
               <span className="text-primary-700 inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold">
                  <span
                     aria-hidden
                     className="bg-primary-600 size-1.5 rounded-full"
                  />
                  Nova mensagem
               </span>
            )}
         </div>

         <HiChevronRight
            aria-hidden
            className="group-hover:text-primary-600 absolute top-1/2 right-3 size-4 -translate-y-1/2 text-slate-300"
         />
      </button>
   );
}
