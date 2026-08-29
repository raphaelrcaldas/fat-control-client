"use client";

import { useEffect, useState } from "react";
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
import { useToast } from "@/app/context/toast";
import { useUpdateFeedback } from "@/hooks/queries";
import type { Feedback, FeedbackStatus } from "services/routes/feedbacks";
import { STATUS_META, STATUS_ORDEM, TIPO_META } from "../feedbackMeta";

const RESPOSTA_MAX = 2000;

interface TratarFeedbackModalProps {
   show: boolean;
   onClose: () => void;
   feedback: Feedback;
}

export function TratarFeedbackModal({
   show,
   onClose,
   feedback,
}: TratarFeedbackModalProps) {
   const { push } = useToast();
   const updateMutation = useUpdateFeedback();
   const isSaving = updateMutation.isPending;

   const [status, setStatus] = useState<FeedbackStatus>(feedback.status);
   const [resposta, setResposta] = useState(feedback.resposta ?? "");

   // Reabrir o modal (ou trocar de item) volta ao que está salvo: o
   // rascunho de um feedback não pode vazar para o seguinte.
   useEffect(() => {
      if (show) {
         setStatus(feedback.status);
         setResposta(feedback.resposta ?? "");
      }
   }, [show, feedback.id, feedback.status, feedback.resposta]);

   const respostaSalva = feedback.resposta ?? "";
   const temMudanca = status !== feedback.status || resposta !== respostaSalva;

   const handleClose = () => {
      if (!isSaving) onClose();
   };

   const handleSave = async () => {
      try {
         await updateMutation.mutateAsync({
            id: feedback.id,
            data: {
               ...(status !== feedback.status ? { status } : {}),
               ...(resposta !== respostaSalva ? { resposta } : {}),
            },
         });
         push({ message: "Feedback atualizado", type: "success" });
         onClose();
      } catch (err: unknown) {
         const message =
            err instanceof Error ? err.message : "Erro ao atualizar feedback";
         push({ title: "Erro", message, type: "error" });
      }
   };

   const tipo = TIPO_META[feedback.tipo];

   return (
      <Modal show={show} onClose={handleClose} size="2xl">
         <ModalHeader>Tratar feedback</ModalHeader>
         <ModalBody>
            <div className="space-y-4">
               <div className="rounded border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">
                     <span className="uppercase">
                        {feedback.autor.p_g} {feedback.autor.nome_guerra}
                     </span>
                     {" · "}
                     {tipo.label}
                     {feedback.rota ? ` · ${feedback.rota}` : ""}
                  </p>
                  <p className="font-semibold text-slate-900">
                     {feedback.titulo}
                  </p>
                  <p className="mt-1 text-sm whitespace-pre-line text-slate-700">
                     {feedback.descricao}
                  </p>
               </div>

               <div>
                  <Label htmlFor="feedback-status" className="text-sm">
                     Status
                  </Label>
                  <Select
                     id="feedback-status"
                     className="mt-1"
                     value={status}
                     onChange={(e) =>
                        setStatus(e.target.value as FeedbackStatus)
                     }
                  >
                     {STATUS_ORDEM.map((valor) => (
                        <option key={valor} value={valor}>
                           {STATUS_META[valor].label}
                        </option>
                     ))}
                  </Select>
               </div>

               <div>
                  <Label htmlFor="feedback-resposta" className="text-sm">
                     Resposta ao autor
                  </Label>
                  <Textarea
                     id="feedback-resposta"
                     className="mt-1"
                     rows={5}
                     maxLength={RESPOSTA_MAX}
                     value={resposta}
                     placeholder="O que será feito (ou por que não será). O autor lê isto no portal."
                     onChange={(e) => setResposta(e.target.value)}
                  />
                  <div className="mt-1 flex justify-between text-xs text-slate-500">
                     {/* Esvaziar o campo retira a resposta publicada — o
                         backend limpa autor e data junto. */}
                     <span>Deixe em branco para retirar a resposta.</span>
                     <span className="tabular-nums">
                        {resposta.length}/{RESPOSTA_MAX}
                     </span>
                  </div>
               </div>

               <div className="flex justify-end gap-2">
                  <Button
                     color="light"
                     onClick={handleClose}
                     disabled={isSaving}
                  >
                     Cancelar
                  </Button>
                  <Button
                     color="primary"
                     onClick={handleSave}
                     disabled={isSaving || !temMudanca}
                  >
                     {isSaving ? (
                        <>
                           <Spinner
                              size="sm"
                              color="primary"
                              className="mr-2"
                           />
                           Salvando...
                        </>
                     ) : (
                        "Salvar"
                     )}
                  </Button>
               </div>
            </div>
         </ModalBody>
      </Modal>
   );
}
