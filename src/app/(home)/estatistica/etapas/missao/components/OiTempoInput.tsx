"use client";

import { useEffect, useRef, useState } from "react";
import { TextInput } from "flowbite-react";

import { minutesToTime, parseDuracao } from "@/../utils/dateHandler";

interface OiTempoInputProps {
   id: string;
   /** Minutos. */
   value: number;
   onChange: (minutos: number) => void;
   /** OI unica: o tempo e o da etapa, sem edicao. */
   readOnly?: boolean;
   /** Erro vindo de fora (tentativa de salvar com tempo zerado). */
   invalid?: boolean;
}

/**
 * Duracao da OI em texto ("1:30", "130" ou "90").
 *
 * Nao e `type="time"`: aquilo e hora do dia (relogio no celular, AM/PM em
 * navegador em ingles) e nao deixava apagar o campo. O texto digitado e a
 * unica fonte do `value` (ver "Input controlado com value derivado" em
 * docs/ai/notes/frontend-armadilhas.md); ele so e reescrito a partir dos
 * minutos quando o campo nao esta em foco.
 */
export function OiTempoInput({
   id,
   value,
   onChange,
   readOnly = false,
   invalid = false,
}: OiTempoInputProps) {
   const fmt = (min: number) => (min > 0 ? minutesToTime(min) : "");
   const [texto, setTexto] = useState(() => fmt(value));
   const [tocado, setTocado] = useState(false);
   const focado = useRef(false);

   // Mudanca vinda de fora (OI unica acompanhando a etapa, "ajustar a ultima
   // OI"): reescreve o texto, desde que a pessoa nao esteja digitando
   useEffect(() => {
      if (!focado.current) setTexto(value > 0 ? minutesToTime(value) : "");
   }, [value]);

   const minutos = parseDuracao(texto);
   const formatoInvalido = minutos === null;
   const vazio = minutos === 0;

   return (
      <TextInput
         id={id}
         type="text"
         inputMode="numeric"
         autoComplete="off"
         placeholder="hh:mm"
         value={texto}
         readOnly={readOnly}
         color={
            !readOnly && (formatoInvalido || ((tocado || invalid) && vazio))
               ? "failure"
               : undefined
         }
         title={
            readOnly
               ? "OI única: o tempo é o da etapa"
               : "Duração: 1:30, 130 ou 90 (minutos)"
         }
         onFocus={(e) => {
            focado.current = true;
            e.target.select();
         }}
         onChange={(e) => {
            const t = e.target.value;
            setTexto(t);
            onChange(parseDuracao(t) ?? 0);
         }}
         onBlur={() => {
            focado.current = false;
            setTocado(true);
            if (minutos !== null) setTexto(fmt(minutos));
         }}
         sizing="sm"
         className="font-mono [&_input]:text-center"
      />
   );
}
