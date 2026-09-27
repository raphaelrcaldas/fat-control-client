"use client";

import { useEffect, useRef, useState } from "react";
import {
   Button,
   Label,
   Modal,
   ModalBody,
   ModalHeader,
   Select,
   Spinner,
   Textarea,
} from "flowbite-react";
import clsx from "clsx";
import { useToast } from "@/app/context/toast";
import {
   TIPOS_AVISO_ADMIN,
   useEnviarMensagemAdmin,
   useFeedback,
   useMarcarConversaLida,
   useUpdateFeedback,
} from "@/hooks/queries";
import type {
   Feedback,
   FeedbackDetalhe,
   FeedbackEvento,
   FeedbackStatus,
} from "services/routes/feedbacks";
import { formatDateTime, formatDateTimeShort } from "utils/dateHandler";
import { formatSaveError, type ApiErrorLabels } from "utils/apiErrors";
import {
   ORIGEM_LABEL,
   STATUS_META,
   STATUS_ORDEM,
   TIPO_META,
} from "@/components/feedback/feedbackMeta";

const MENSAGEM_MAX = 2000;

const ERROR_LABELS: ApiErrorLabels = {
   fields: { texto: "Mensagem", status: "Status" },
};

interface TratarFeedbackModalProps {
   show: boolean;
   onClose: () => void;
   feedback: Feedback;
}

function nomeDe(evento: FeedbackEvento, autorNome: string): string {
   if (evento.do_autor) return autorNome;
   if (!evento.autor) return "Administração";
   return `${evento.autor.p_g} ${evento.autor.nome_guerra}`.toUpperCase();
}

/**
 * Tratar = conversar. Linha do tempo espelhada em relação ao FatBird: aqui
 * o AUTOR fica à esquerda e a administração à direita (quem está usando a
 * tela fica à direita, como em qualquer chat).
 *
 * O botão diz o que vai acontecer: "Enviar", "Enviar e marcar como X" ou
 * "Atualizar status" — a gravação é sempre atômica no backend.
 *
 * Abrir marca como lidos os avisos deste feedback no sino de quem abriu
 * (`useMarcarConversaLida` com `TIPOS_AVISO_ADMIN`).
 */
export function TratarFeedbackModal({
   show,
   onClose,
   feedback,
}: TratarFeedbackModalProps) {
   const { push } = useToast();
   const detalhe = useFeedback(show ? feedback.id : null);
   useMarcarConversaLida(show ? feedback.id : null, TIPOS_AVISO_ADMIN);
   const enviar = useEnviarMensagemAdmin();
   const atualizar = useUpdateFeedback();
   const salvando = enviar.isPending || atualizar.isPending;

   const atual = detalhe.data ?? null;
   const statusAtual = atual?.status ?? feedback.status;
   const [status, setStatus] = useState<FeedbackStatus>(feedback.status);
   const [texto, setTexto] = useState("");

   // Reabrir (ou trocar de item) descarta o rascunho: o texto de um
   // feedback não pode vazar para o seguinte. O status volta a acompanhar
   // o servidor até a pessoa mexer no Select de novo.
   const statusTocadoRef = useRef(false);
   useEffect(() => {
      if (show) {
         setStatus(feedback.status);
         setTexto("");
         statusTocadoRef.current = false;
      }
   }, [show, feedback.id, feedback.status]);

   // O status inicial vem da LISTA; quando o detalhe (a conversa) carrega,
   // ele pode estar mais atualizado (outra aba tratou entretanto). Sincroniza
   // só enquanto a pessoa não escolheu nada no Select, senão a escolha some
   // debaixo dela.
   useEffect(() => {
      if (atual && !statusTocadoRef.current) {
         setStatus(atual.status);
      }
   }, [atual]);

   const textoLimpo = texto.trim();
   const mudouStatus = status !== statusAtual;
   const rotulo = textoLimpo
      ? mudouStatus
         ? `Enviar e marcar como ${STATUS_META[status].label}`
         : "Enviar"
      : "Atualizar status";
   const habilitado = !salvando && (textoLimpo.length > 0 || mudouStatus);

   const handleSalvar = async () => {
      try {
         if (textoLimpo) {
            await enviar.mutateAsync({
               id: feedback.id,
               data: {
                  texto: textoLimpo,
                  ...(mudouStatus ? { status } : {}),
               },
            });
            push({ message: "Mensagem enviada", type: "success" });
         } else {
            await atualizar.mutateAsync({ id: feedback.id, data: { status } });
            push({ message: "Status atualizado", type: "success" });
         }
         setTexto("");
         // O que estava pendente foi gravado: o Select volta a poder
         // acompanhar o servidor até a próxima escolha manual.
         statusTocadoRef.current = false;
      } catch (err: unknown) {
         const message = formatSaveError(err, "Erro ao salvar", ERROR_LABELS);
         push({ title: "Erro", message, type: "error" });
      }
   };

   const tipo = TIPO_META[feedback.tipo];
   const autorNome =
      `${feedback.autor.p_g} ${feedback.autor.nome_guerra}`.toUpperCase();
   const metaTopo =
      `${feedback.uae.toUpperCase()} · ${autorNome} · ${tipo.label} · via ${ORIGEM_LABEL[feedback.origem]} · enviado em ${formatDateTime(feedback.created_at)}` +
      (feedback.rota ? ` · tela ${feedback.rota}` : "");
   const statusMeta = STATUS_META[statusAtual];

   return (
      <Modal
         show={show}
         onClose={() => !salvando && onClose()}
         size="3xl"
         dismissible={!salvando}
         className="items-start md:py-8"
      >
         {/* Mesmo cabeçalho do modal do autor (`ConversaModal`): título,
             selo do status ATUAL e a meta numa linha que trunca. */}
         <ModalHeader
            className="border-slate-200 p-4"
            theme={{ title: "min-w-0 flex-1" }}
         >
            <span className="flex min-w-0 items-center gap-2">
               <span
                  className="min-w-0 truncate text-base font-bold text-slate-900 sm:text-lg"
                  title={feedback.titulo}
               >
                  {feedback.titulo}
               </span>
               <span
                  className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusMeta.badge}`}
               >
                  {statusMeta.label}
               </span>
            </span>
            <span
               className="block truncate text-xs font-normal text-slate-500"
               title={metaTopo}
            >
               {metaTopo}
            </span>
         </ModalHeader>
         <ModalBody className="p-4">
            <div className="space-y-3">
               <ConversaTimeline
                  feedback={feedback}
                  autorNome={autorNome}
                  atual={atual}
                  isLoading={detalhe.isLoading}
                  isError={detalhe.isError}
                  onRetry={() => detalhe.refetch()}
               />

               <div>
                  <Label htmlFor="feedback-mensagem" className="text-sm">
                     Mensagem ao autor
                  </Label>
                  <Textarea
                     id="feedback-mensagem"
                     className="mt-1"
                     rows={3}
                     maxLength={MENSAGEM_MAX}
                     value={texto}
                     disabled={salvando}
                     placeholder="O que será feito, ou uma pergunta para o autor."
                     onChange={(e) => setTexto(e.target.value)}
                     onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                           e.preventDefault();
                           if (habilitado) handleSalvar();
                        }
                     }}
                  />
                  <div className="mt-1 flex justify-between text-xs text-slate-500">
                     <span>
                        Ctrl+Enter envia ·{" "}
                        {feedback.origem === "fatbird"
                           ? "o autor é avisado no FatBird"
                           : "o autor é avisado no sino do client"}
                     </span>
                     <span className="tabular-nums">
                        {texto.length}/{MENSAGEM_MAX}
                     </span>
                  </div>
               </div>

               <div className="flex flex-wrap items-end justify-between gap-2">
                  <div className="min-w-44">
                     <Label htmlFor="feedback-status" className="text-sm">
                        Status
                     </Label>
                     <Select
                        id="feedback-status"
                        className="mt-1"
                        value={status}
                        onChange={(e) => {
                           statusTocadoRef.current = true;
                           setStatus(e.target.value as FeedbackStatus);
                        }}
                     >
                        {STATUS_ORDEM.map((valor) => (
                           <option key={valor} value={valor}>
                              {STATUS_META[valor].label}
                           </option>
                        ))}
                     </Select>
                  </div>
                  <div className="flex gap-2">
                     <Button
                        color="light"
                        onClick={onClose}
                        disabled={salvando}
                     >
                        Fechar
                     </Button>
                     <Button
                        color="primary"
                        onClick={handleSalvar}
                        disabled={!habilitado}
                     >
                        {salvando && (
                           <Spinner
                              size="sm"
                              color="primary"
                              className="mr-2"
                           />
                        )}
                        {rotulo}
                     </Button>
                  </div>
               </div>
            </div>
         </ModalBody>
      </Modal>
   );
}

/**
 * Linha do tempo, isolada num componente próprio: o `Modal` do Flowbite
 * monta o conteúdo dentro de um `FloatingPortal`, um ciclo de render depois
 * do resto da árvore. Um efeito de rolagem declarado no componente PAI roda
 * antes desse ciclo e encontra `ref.current === null`. Aqui o efeito nasce
 * junto com a `<ol>` dentro do portal, então roda quando ela existe de
 * verdade — ao montar e a cada evento novo (mesma dependência cobre os
 * dois casos, porque o primeiro render também dispara o efeito).
 */
function ConversaTimeline({
   feedback,
   autorNome,
   atual,
   isLoading,
   isError,
   onRetry,
}: {
   feedback: Feedback;
   autorNome: string;
   atual: FeedbackDetalhe | null;
   isLoading: boolean;
   isError: boolean;
   onRetry: () => void;
}) {
   const olRef = useRef<HTMLOListElement>(null);
   const totalEventos = atual?.eventos.length ?? 0;

   useEffect(() => {
      const ol = olRef.current;
      if (!ol) return;
      // Rola só a lista (não o ModalBody/overlay inteiro).
      ol.scrollTop = ol.scrollHeight;
   }, [totalEventos]);

   return (
      <ol
         ref={olRef}
         aria-label="Conversa"
         className="max-h-[50vh] space-y-2 overflow-y-auto rounded border border-slate-200 bg-slate-50 p-3"
      >
         {/* Abertura: a descrição é o primeiro balão do autor. */}
         <BalaoAdmin
            lado="autor"
            nome={autorNome}
            texto={feedback.descricao}
            quando={formatDateTimeShort(feedback.created_at)}
         />
         {isLoading && (
            <li className="flex justify-center py-2">
               <Spinner size="sm" />
            </li>
         )}
         {isError && (
            <li className="text-center text-xs text-red-700">
               Não foi possível carregar a conversa.{" "}
               <button
                  type="button"
                  className="inline-flex min-h-[24px] items-center font-semibold underline"
                  onClick={onRetry}
               >
                  Tentar novamente
               </button>
            </li>
         )}
         {atual?.eventos.map((evento) =>
            evento.tipo === "status" ? (
               <li
                  key={evento.id}
                  className="text-center text-[11px] text-slate-500"
               >
                  Status alterado para{" "}
                  <span className="font-semibold text-slate-700">
                     {evento.status ? STATUS_META[evento.status].label : ""}
                  </span>
                  {` · ${nomeDe(evento, autorNome)} · ${formatDateTimeShort(evento.created_at)}`}
               </li>
            ) : (
               <BalaoAdmin
                  key={evento.id}
                  lado={evento.do_autor ? "autor" : "admin"}
                  nome={nomeDe(evento, autorNome)}
                  texto={evento.texto ?? ""}
                  quando={formatDateTimeShort(evento.created_at)}
               />
            )
         )}
      </ol>
   );
}

function BalaoAdmin({
   lado,
   nome,
   texto,
   quando,
}: {
   lado: "autor" | "admin";
   nome: string;
   texto: string;
   quando: string;
}) {
   const admin = lado === "admin";
   return (
      <li className={clsx("flex", admin ? "justify-end" : "justify-start")}>
         <div
            className={clsx(
               "max-w-[85%] rounded px-3 py-2 shadow-sm",
               admin
                  ? "bg-slate-700 text-white"
                  : "border border-slate-200 bg-white text-slate-800"
            )}
         >
            <p
               className={clsx(
                  "mb-0.5 truncate text-[11px] font-bold",
                  admin ? "text-slate-200" : "text-slate-500"
               )}
            >
               {nome}
            </p>
            <p className="text-sm break-words whitespace-pre-line">{texto}</p>
            <p
               className={clsx(
                  "mt-1 text-right text-[11px]",
                  admin ? "text-slate-300" : "text-slate-400"
               )}
            >
               {quando}
            </p>
         </div>
      </li>
   );
}
