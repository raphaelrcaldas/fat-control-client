"use client";

import { useEffect, useState } from "react";
import {
   Button,
   Label,
   Modal,
   ModalBody,
   ModalHeader,
   Spinner,
   Textarea,
   TextInput,
} from "flowbite-react";
import { MdSend } from "react-icons/md";
import clsx from "clsx";
import { useToast } from "@/app/context/toast";
import { useAddFeedback } from "@/hooks/queries";
import type { FeedbackTipo } from "services/routes/feedbacks";
import { TIPOS, TIPO_META } from "./feedbackMeta";

const TITULO_MIN = 3;
const TITULO_MAX = 120;
const DESCRICAO_MIN = 10;
const DESCRICAO_MAX = 2000;

interface EnviarFeedbackModalProps {
   show: boolean;
   onClose: () => void;
   /** Tela de onde o modal foi aberto — vai no payload como `rota`. */
   rota?: string | null;
}

export function EnviarFeedbackModal({
   show,
   onClose,
   rota,
}: EnviarFeedbackModalProps) {
   const { push } = useToast();
   const addMutation = useAddFeedback();
   const isSending = addMutation.isPending;

   const [tipo, setTipo] = useState<FeedbackTipo>("sugestao");
   const [titulo, setTitulo] = useState("");
   const [descricao, setDescricao] = useState("");
   const [tentouEnviar, setTentouEnviar] = useState(false);

   // Cada abertura começa em branco: o modal é acionado de qualquer tela e
   // reaproveitar o rascunho anterior misturaria assuntos de telas
   // diferentes.
   useEffect(() => {
      if (show) {
         setTipo("sugestao");
         setTitulo("");
         setDescricao("");
         setTentouEnviar(false);
      }
   }, [show]);

   const tituloLimpo = titulo.trim();
   const descricaoLimpa = descricao.trim();
   const erroTitulo =
      tituloLimpo.length < TITULO_MIN
         ? `Descreva o assunto em pelo menos ${TITULO_MIN} caracteres`
         : null;
   const erroDescricao =
      descricaoLimpa.length < DESCRICAO_MIN
         ? `Conte o que aconteceu em pelo menos ${DESCRICAO_MIN} caracteres`
         : null;

   const handleClose = () => {
      if (!isSending) onClose();
   };

   const handleSend = async () => {
      setTentouEnviar(true);
      if (erroTitulo || erroDescricao) return;

      try {
         await addMutation.mutateAsync({
            tipo,
            titulo: tituloLimpo,
            descricao: descricaoLimpa,
            rota: rota ?? null,
         });
         push({ message: "Feedback enviado. Obrigado!", type: "success" });
         onClose();
      } catch (err: unknown) {
         const message =
            err instanceof Error
               ? err.message
               : "Não foi possível enviar seu feedback";
         push({ title: "Erro", message, type: "error" });
      }
   };

   return (
      <Modal show={show} onClose={handleClose} size="2xl">
         <ModalHeader>Enviar feedback</ModalHeader>
         <ModalBody>
            <div className="space-y-4">
               <p className="text-sm text-slate-500">
                  {rota
                     ? `Sobre a tela ${rota} — a administração recebe junto com o endereço.`
                     : "Sobre o sistema em geral."}
               </p>

               <fieldset>
                  <legend className="mb-1 text-sm font-medium text-slate-900">
                     Tipo
                  </legend>
                  {/* Botões em vez de Select: são quatro opções fixas e a
                      escolha do tipo é o que orienta o resto do formulário —
                      vale ocupar espaço para mostrá-las. */}
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                     {TIPOS.map((valor) => {
                        const meta = TIPO_META[valor];
                        const Icone = meta.icon;
                        const ativo = tipo === valor;
                        return (
                           <button
                              key={valor}
                              type="button"
                              onClick={() => setTipo(valor)}
                              aria-pressed={ativo}
                              className={clsx(
                                 "flex flex-col items-center gap-1 rounded border px-2 py-2 text-xs font-semibold transition-colors",
                                 "focus-visible:ring-primary-600 focus-visible:ring-2 focus-visible:outline-none",
                                 ativo
                                    ? "border-primary-600 bg-primary-50 text-primary-700"
                                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                              )}
                           >
                              <Icone className="h-5 w-5" aria-hidden />
                              {meta.label}
                           </button>
                        );
                     })}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                     {TIPO_META[tipo].descricao}
                  </p>
               </fieldset>

               <div>
                  <Label htmlFor="feedback-titulo" className="text-sm">
                     Assunto
                  </Label>
                  {/* Sem `color="failure"`: o tema custom substitui as
                      `colors` do input, então o erro se comunica pelo texto
                      e pelo `aria-invalid`, não pela borda. */}
                  <TextInput
                     id="feedback-titulo"
                     className="mt-1"
                     maxLength={TITULO_MAX}
                     value={titulo}
                     placeholder="Resuma em uma frase"
                     aria-invalid={!!(tentouEnviar && erroTitulo)}
                     aria-describedby={
                        tentouEnviar && erroTitulo
                           ? "feedback-titulo-erro"
                           : undefined
                     }
                     onChange={(e) => setTitulo(e.target.value)}
                  />
                  {tentouEnviar && erroTitulo && (
                     <p
                        id="feedback-titulo-erro"
                        role="alert"
                        className="mt-1 text-sm text-red-600"
                     >
                        {erroTitulo}
                     </p>
                  )}
               </div>

               <div>
                  <Label htmlFor="feedback-descricao" className="text-sm">
                     Detalhes
                  </Label>
                  <Textarea
                     id="feedback-descricao"
                     className="mt-1"
                     rows={6}
                     maxLength={DESCRICAO_MAX}
                     value={descricao}
                     placeholder={TIPO_META[tipo].placeholder}
                     aria-invalid={!!(tentouEnviar && erroDescricao)}
                     aria-describedby={
                        tentouEnviar && erroDescricao
                           ? "feedback-descricao-erro"
                           : undefined
                     }
                     onChange={(e) => setDescricao(e.target.value)}
                  />
                  <div className="mt-1 flex justify-between gap-3 text-xs">
                     {tentouEnviar && erroDescricao ? (
                        <span
                           id="feedback-descricao-erro"
                           role="alert"
                           className="text-sm text-red-600"
                        >
                           {erroDescricao}
                        </span>
                     ) : (
                        <span />
                     )}
                     <span className="shrink-0 text-slate-500 tabular-nums">
                        {descricao.length}/{DESCRICAO_MAX}
                     </span>
                  </div>
               </div>

               <div className="flex justify-end gap-2">
                  <Button
                     color="light"
                     onClick={handleClose}
                     disabled={isSending}
                  >
                     Cancelar
                  </Button>
                  <Button
                     color="primary"
                     onClick={handleSend}
                     disabled={isSending}
                  >
                     {isSending ? (
                        <>
                           <Spinner
                              size="sm"
                              color="primary"
                              className="mr-2"
                           />
                           Enviando...
                        </>
                     ) : (
                        <>
                           <MdSend className="mr-2 h-4 w-4" aria-hidden />
                           Enviar
                        </>
                     )}
                  </Button>
               </div>
            </div>
         </ModalBody>
      </Modal>
   );
}
