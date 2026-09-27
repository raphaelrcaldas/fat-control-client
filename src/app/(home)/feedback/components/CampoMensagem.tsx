"use client";

import { useState } from "react";
import { Button, Spinner, Textarea } from "flowbite-react";
import { MdSend } from "react-icons/md";
import { MENSAGEM_MAX, mensagemSchema } from "services/routes/feedbacks";

/** Contador só perto do teto: antes disso ele é ruído na tela pequena. */
const AVISO_A_PARTIR = 1800;

/**
 * Campo do rodapé do modal da conversa (`ConversaModal`). Enter quebra
 * linha; Ctrl/⌘+Enter envia (o botão sempre envia, para quem está no
 * celular sem Ctrl). Cresce até ~5 linhas (`field-sizing-content` +
 * `max-h`, Tailwind v4).
 */
export function CampoMensagem({
   onEnviar,
   enviando,
   desabilitado = false,
}: {
   onEnviar: (texto: string) => void;
   enviando: boolean;
   /** Conversa ainda é placeholder (sem os eventos reais): deixa digitar,
    *  mas não enviar — o rascunho poderia ir parar numa conversa
    *  desatualizada. */
   desabilitado?: boolean;
}) {
   const [texto, setTexto] = useState("");
   const valido = mensagemSchema.safeParse({ texto }).success;
   const podeEnviar = valido && !enviando && !desabilitado;

   const enviar = () => {
      if (!podeEnviar) return;
      onEnviar(texto.trim());
      setTexto("");
   };

   return (
      <div className="w-full">
         <div className="flex items-end gap-2">
            <Textarea
               value={texto}
               onChange={(e) => setTexto(e.target.value)}
               onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                     e.preventDefault();
                     enviar();
                  }
               }}
               maxLength={MENSAGEM_MAX}
               rows={1}
               placeholder="Escreva uma mensagem…"
               aria-label="Mensagem para a administração"
               className="field-sizing-content max-h-32 min-h-10 resize-none"
            />
            <Button
               type="button"
               color="primary"
               onClick={enviar}
               disabled={!podeEnviar}
               aria-label="Enviar mensagem"
               className="h-10 shrink-0 px-3"
            >
               {enviando ? (
                  <Spinner size="sm" color="primary" />
               ) : (
                  <MdSend className="h-4 w-4" aria-hidden />
               )}
            </Button>
         </div>
         <p className="mt-1 flex justify-between gap-2 text-[11px] text-slate-500">
            <span>
               {desabilitado
                  ? "Carregando conversa…"
                  : "Ctrl+Enter envia · a administração é avisada"}
            </span>
            {texto.length >= AVISO_A_PARTIR && (
               <span className="tabular-nums">
                  {texto.length}/{MENSAGEM_MAX}
               </span>
            )}
         </p>
      </div>
   );
}
