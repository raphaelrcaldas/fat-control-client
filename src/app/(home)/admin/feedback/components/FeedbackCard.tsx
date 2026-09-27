"use client";

import { MdChatBubbleOutline, MdDeleteOutline, MdReply } from "react-icons/md";
import clsx from "clsx";
import { formatDateTime, formatRelativeTime } from "utils/dateHandler";
import type { Feedback } from "services/routes/feedbacks";
import { THEME_META, type OrgTheme } from "@/lib/orgTheme";
import {
   ORIGEM_LABEL,
   STATUS_META,
   TIPO_META,
   aguardandoResposta,
} from "@/components/feedback/feedbackMeta";

interface FeedbackCardProps {
   feedback: Feedback;
   /** Tema da unidade de origem — pinta o dot; ausente cai no cinza. */
   tema?: OrgTheme;
   /** Há aviso não lido deste feedback no sino (novo ou mensagem do autor). */
   naoLido: boolean;
   onAbrir: (feedback: Feedback) => void;
   onExcluir: (feedback: Feedback) => void;
}

/**
 * Cartão da caixa da administração. O cartão inteiro abre a conversa: o
 * botão do título estende a área de clique por um `::after` que cobre o
 * cartão (padrão "stretched link") — o de excluir fica por cima (`z-10`) e
 * continua sendo um controle próprio, sem botão dentro de botão.
 *
 * Duas marcas de triagem, independentes: "Aguardando resposta" é derivada
 * do dado (a última fala é do autor, `aguardandoResposta`) e vale para
 * qualquer admin; o selo "Novo"/"Nova mensagem" é o aviso não lido do sino
 * de QUEM está olhando, e apaga ao abrir a conversa.
 */
export function FeedbackCard({
   feedback,
   tema,
   naoLido,
   onAbrir,
   onExcluir,
}: FeedbackCardProps) {
   const tipo = TIPO_META[feedback.tipo];
   const status = STATUS_META[feedback.status];
   const Icone = tipo.icon;
   const aguardando = aguardandoResposta(feedback);
   const ultima = feedback.ultima_mensagem;
   const autorNome =
      `${feedback.autor.p_g} ${feedback.autor.nome_guerra}`.toUpperCase();

   const quemFalou = !ultima
      ? null
      : ultima.do_autor
        ? "Autor"
        : ultima.autor
          ? `${ultima.autor.p_g} ${ultima.autor.nome_guerra}`.toUpperCase()
          : "Administração";

   const quando = formatRelativeTime(feedback.ultima_atividade);
   // A linha trunca (nunca quebra); o `title` guarda a versão completa,
   // com a data absoluta do envio.
   const metaCompleta = [
      feedback.uae.toUpperCase(),
      autorNome,
      tipo.label,
      `via ${ORIGEM_LABEL[feedback.origem]}`,
      `enviado em ${formatDateTime(feedback.created_at)}`,
   ].join(" · ");

   return (
      <article
         className={clsx(
            "group relative rounded border bg-white p-4 shadow-sm transition-colors",
            "hover:border-slate-300 hover:shadow-md",
            aguardando ? "border-slate-300" : "border-slate-200"
         )}
      >
         <div className="flex min-w-0 items-start gap-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-600">
               <Icone className="size-5" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
               <div className="flex min-w-0 items-center gap-2">
                  <h3 className="min-w-0 flex-1">
                     <button
                        type="button"
                        onClick={() => onAbrir(feedback)}
                        title={feedback.titulo}
                        className={clsx(
                           "block w-full truncate text-left font-semibold text-slate-900 outline-none",
                           "after:absolute after:inset-0 after:rounded after:content-['']",
                           "focus-visible:after:ring-2 focus-visible:after:ring-slate-500"
                        )}
                     >
                        {feedback.titulo}
                     </button>
                  </h3>
                  <span
                     className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${status.badge}`}
                  >
                     {status.label}
                  </span>
               </div>
               <p
                  className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-slate-500"
                  title={metaCompleta}
               >
                  {/* Caixa cross-tenant: dot na cor do tenant + sigla dizem
                      de qual unidade o feedback saiu. A sigla carrega a
                      informação; a cor reforça. */}
                  <span
                     aria-hidden
                     className={clsx(
                        "size-2 shrink-0 rounded-full",
                        tema ? THEME_META[tema].swatch : "bg-slate-300"
                     )}
                  />
                  <span className="shrink-0 font-medium text-slate-700 uppercase">
                     {feedback.uae}
                  </span>
                  <span className="min-w-0 truncate">
                     {`· ${autorNome} · ${tipo.label} · via ${ORIGEM_LABEL[feedback.origem]}`}
                  </span>
                  {quando && <span className="shrink-0">{`· ${quando}`}</span>}
               </p>
            </div>
         </div>

         <p className="mt-2 line-clamp-2 text-sm break-words whitespace-pre-line text-slate-700">
            {feedback.descricao}
         </p>

         {ultima && (
            <p
               className="mt-1 truncate text-sm text-slate-600"
               title={`${quemFalou}: ${ultima.texto ?? ""}`}
            >
               <span className="font-semibold text-slate-800">
                  {quemFalou}:{" "}
               </span>
               {ultima.texto}
            </p>
         )}

         <div className="mt-2 flex min-w-0 items-center gap-3 border-t border-slate-100 pt-2">
            <span className="min-w-0 flex-1">
               {aguardando && (
                  <span className="inline-flex max-w-full items-center gap-1.5 text-xs font-semibold text-slate-900">
                     <MdReply className="size-4 shrink-0" aria-hidden />
                     <span className="truncate">Aguardando resposta</span>
                  </span>
               )}
            </span>
            {/* No rodapé, não na linha do título: no celular o título
                dividia a linha com este selo e o de status e truncava em
                poucas letras. */}
            {naoLido && (
               <span className="text-primary-700 inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold">
                  <span
                     aria-hidden
                     className="bg-primary-600 size-1.5 rounded-full"
                  />
                  {feedback.total_mensagens > 0 ? "Nova mensagem" : "Novo"}
               </span>
            )}
            {feedback.total_mensagens > 0 && (
               <span
                  className="inline-flex shrink-0 items-center gap-1 text-xs text-slate-500 tabular-nums"
                  title={`${feedback.total_mensagens} ${feedback.total_mensagens === 1 ? "mensagem" : "mensagens"}`}
               >
                  <MdChatBubbleOutline className="size-3.5" aria-hidden />
                  {feedback.total_mensagens}
                  <span className="sr-only">
                     {feedback.total_mensagens === 1
                        ? " mensagem"
                        : " mensagens"}
                  </span>
               </span>
            )}
            {/* Destrutiva discreta: só o ícone, e acima do clique do
                cartão. A confirmação (com o título) vem do modal. */}
            <button
               type="button"
               onClick={() => onExcluir(feedback)}
               aria-label={`Excluir feedback ${feedback.titulo}`}
               title="Excluir"
               className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
            >
               <MdDeleteOutline className="size-4" aria-hidden />
            </button>
         </div>
      </article>
   );
}
