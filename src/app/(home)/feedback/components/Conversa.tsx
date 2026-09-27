import clsx from "clsx";
import { MdErrorOutline } from "react-icons/md";
import { formatDateTime } from "utils/dateHandler";
import type {
   FeedbackDetalhe,
   FeedbackEvento,
} from "services/routes/feedbacks";
import { STATUS_META } from "@/components/feedback/feedbackMeta";

/** Parte "DD/MM/YYYY" e "HH:mm" do `formatDateTime` (horário local). */
function partes(iso: string) {
   const texto = formatDateTime(iso) ?? "";
   return { dia: texto.slice(0, 10), hora: texto.slice(11) };
}

function rotuloDia(dia: string): string {
   const hoje = partes(new Date().toISOString()).dia;
   const ontem = partes(new Date(Date.now() - 86_400_000).toISOString()).dia;
   if (dia === hoje) return "Hoje";
   if (dia === ontem) return "Ontem";
   return dia;
}

function nomeDe(evento: FeedbackEvento): string {
   if (evento.do_autor) return "Você";
   if (!evento.autor) return "Administração";
   return `${evento.autor.p_g} ${evento.autor.nome_guerra}`.toUpperCase();
}

type Item =
   | { chave: string; tipo: "dia"; rotulo: string }
   | { chave: string; tipo: "evento"; evento: FeedbackEvento };

/**
 * A abertura (`descricao`) é o primeiro balão do autor e não vem em
 * `eventos` — é montada aqui como um evento sintético, com o instante do
 * envio. Separador de dia entre eventos de dias diferentes.
 */
function montarItens(feedback: FeedbackDetalhe): Item[] {
   const abertura: FeedbackEvento = {
      id: 0,
      tipo: "mensagem",
      texto: feedback.descricao,
      status: null,
      autor: feedback.autor,
      do_autor: true,
      created_at: feedback.created_at,
   };
   const itens: Item[] = [];
   let diaAtual = "";
   for (const evento of [abertura, ...feedback.eventos]) {
      const { dia } = partes(evento.created_at);
      if (dia !== diaAtual) {
         diaAtual = dia;
         itens.push({
            chave: `dia-${dia}`,
            tipo: "dia",
            rotulo: rotuloDia(dia),
         });
      }
      itens.push({ chave: `ev-${evento.id}`, tipo: "evento", evento });
   }
   return itens;
}

/**
 * Balão de UM evento de mensagem. `do_autor` decide o lado — calculado pelo
 * backend, sem comparar ids no front: aqui é a página do próprio autor, e
 * "Você" fica à direita (o inverso da conversa espelhada em
 * `admin/feedback/components/TratarFeedbackModal.tsx`, onde quem está na
 * tela é a administração).
 */
export function Balao({
   evento,
   estado,
   onRetry,
}: {
   evento: FeedbackEvento;
   /** Envio otimista: ausente = mensagem gravada. "falhou" oferece retry;
    *  "encerrada" e "excluido" são falhas definitivas do mesmo envio, sem
    *  retry (a conversa fechou, ou o feedback sumiu, embaixo da pessoa). */
   estado?: "enviando" | "falhou" | "encerrada" | "excluido";
   onRetry?: () => void;
}) {
   const meu = evento.do_autor;
   const { hora } = partes(evento.created_at);
   const problema =
      estado === "falhou" || estado === "encerrada" || estado === "excluido";

   return (
      <li className={clsx("flex", meu ? "justify-end" : "justify-start")}>
         <div
            className={clsx(
               "max-w-[85%] rounded border px-3 py-2 shadow-sm",
               // Falha do envio troca o fundo de marca por um neutro: além
               // de marcar a anomalia, garante contraste do texto/botão de
               // "Tentar de novo" numa organização cujo tema também é
               // vermelho (marca e perigo colidiriam sobre `bg-primary-50`).
               problema
                  ? "border-red-300 bg-white"
                  : meu
                    ? "border-primary-100 bg-primary-50 text-slate-900"
                    : "border-slate-200 bg-white text-slate-800",
               estado === "enviando" && "opacity-70"
            )}
         >
            {!meu && (
               <p
                  className="text-primary-700 mb-0.5 truncate text-[11px] font-bold"
                  title={nomeDe(evento)}
               >
                  {nomeDe(evento)}
               </p>
            )}
            <p className="text-sm break-words whitespace-pre-line">
               {evento.texto}
            </p>
            {/* `role`/`aria-live` só no balão otimista (tem `estado`): uma
                mensagem já gravada não precisa anunciar a própria hora, mas
                a transição "enviando…" → "Não enviada" merece aviso. */}
            <p
               className="mt-1 text-right text-[11px] text-slate-500"
               role={estado ? "status" : undefined}
               aria-live={estado ? "polite" : undefined}
            >
               {estado === "enviando" && "enviando…"}
               {estado === "falhou" && (
                  <>
                     <MdErrorOutline
                        aria-hidden
                        className="mb-0.5 inline size-3 align-text-bottom"
                     />{" "}
                     Não enviada ·{" "}
                     <button
                        type="button"
                        onClick={onRetry}
                        className="min-h-[24px] font-semibold text-red-600 underline underline-offset-2"
                     >
                        Tentar de novo
                     </button>
                  </>
               )}
               {estado === "encerrada" && (
                  <>
                     <MdErrorOutline
                        aria-hidden
                        className="mb-0.5 inline size-3 align-text-bottom"
                     />{" "}
                     Não enviada — conversa encerrada
                  </>
               )}
               {estado === "excluido" && (
                  <>
                     <MdErrorOutline
                        aria-hidden
                        className="mb-0.5 inline size-3 align-text-bottom"
                     />{" "}
                     Não enviada — feedback excluído
                  </>
               )}
               {!estado && hora}
            </p>
         </div>
      </li>
   );
}

function LinhaStatus({ evento }: { evento: FeedbackEvento }) {
   const { hora } = partes(evento.created_at);
   const status = evento.status ? STATUS_META[evento.status] : null;
   return (
      <li className="flex justify-center px-6 text-center text-[11px] text-slate-500">
         <span>
            Status alterado para{" "}
            <span className="font-semibold text-slate-700">
               {status?.label ?? evento.status}
            </span>
            {` · ${nomeDe(evento)} · ${hora}`}
         </span>
      </li>
   );
}

/** Linha do tempo: abertura, mensagens, eventos de status e o balão
 *  otimista (passado pela página), em ordem. */
export function Conversa({
   feedback,
   pendente,
}: {
   feedback: FeedbackDetalhe;
   pendente?: React.ReactNode;
}) {
   return (
      <ol className="space-y-2" aria-label="Conversa">
         {montarItens(feedback).map((item) =>
            item.tipo === "dia" ? (
               <li
                  key={item.chave}
                  className="flex items-center gap-2 py-1"
                  aria-hidden
               >
                  <span className="h-px flex-1 bg-slate-200" />
                  <span className="text-[11px] font-semibold text-slate-500">
                     {item.rotulo}
                  </span>
                  <span className="h-px flex-1 bg-slate-200" />
               </li>
            ) : item.evento.tipo === "status" ? (
               <LinhaStatus key={item.chave} evento={item.evento} />
            ) : (
               <Balao key={item.chave} evento={item.evento} />
            )
         )}
         {pendente}
      </ol>
   );
}
