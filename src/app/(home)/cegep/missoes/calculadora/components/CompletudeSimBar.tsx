"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";

const BAR_TICKS = Array.from({ length: 9 }, (_, i) => i);

interface CompletudeSimBarProps {
   /** Completude real do comissionamento hoje (0–100). */
   atual: number;
   /** Completude projetada com a missão (0–100, já limitada). */
   projetada: number;
   /** Comissionamento já fechou módulo — define a cor do trecho consolidado. */
   modulo: boolean;
   /** Rótulo lido por leitor de tela no lugar dos dois números. */
   ariaLabel: string;
}

/**
 * Barra de completude com um segundo segmento "sandbox": o pedaço que a
 * missão em planejamento acrescentaria, desenhado à frente do trecho
 * consolidado em âmbar listrado, pulsando e com uma faixa clara varrendo no
 * sentido do avanço.
 *
 * A distinção é deliberadamente redundante (cor + listras + animação): a
 * diferença entre o que já foi cumprido e o que é só simulação não pode
 * depender de matiz. O trecho consolidado mantém a linguagem da tabela de
 * comissionamentos — vermelho sem módulo, verde com módulo — e os ticks de
 * 10 em 10 dão a régua sem precisar de eixo.
 */
export function CompletudeSimBar({
   atual,
   projetada,
   modulo,
   ariaLabel,
}: CompletudeSimBarProps) {
   const base = Math.max(0, Math.min(100, atual));
   const alvo = Math.max(base, Math.min(100, projetada));

   // O segmento cresce de 0 até a largura final na montagem (e a cada nova
   // projeção), em vez de aparecer pronto — é o "avançando" da simulação.
   const [largura, setLargura] = useState(0);
   useEffect(() => {
      setLargura(0);
      const id = requestAnimationFrame(() => setLargura(alvo - base));
      return () => cancelAnimationFrame(id);
   }, [base, alvo]);

   return (
      <div
         className="relative h-2.5 w-full overflow-hidden rounded-[1px] border border-slate-200 bg-slate-100"
         role="progressbar"
         aria-valuenow={alvo}
         aria-valuemin={0}
         aria-valuemax={100}
         aria-label={ariaLabel}
      >
         {/* Trecho consolidado — o que já está computado de verdade. */}
         <div
            className={clsx(
               "absolute top-0 left-0 h-full transition-[width] duration-700 ease-out",
               modulo ? "bg-green-700" : "bg-red-700"
            )}
            style={{ width: `${base}%` }}
         />

         {/* Trecho simulado — ainda não existe, então nunca é sólido. */}
         <div
            className="animate-sandbox-pulse absolute top-0 h-full overflow-hidden bg-amber-400 transition-[width] duration-1000 ease-out"
            style={{ left: `${base}%`, width: `${largura}%` }}
         >
            <div
               aria-hidden
               className="absolute inset-0 [background:repeating-linear-gradient(115deg,transparent_0_4px,rgba(120,53,15,0.35)_4px_8px)]"
            />
            <div
               aria-hidden
               className="animate-sandbox-sweep absolute inset-y-0 -left-1/3 w-1/3 bg-linear-to-r from-transparent via-white/80 to-transparent"
            />
         </div>

         {BAR_TICKS.map((i) => (
            <div
               key={i}
               aria-hidden
               className="absolute top-0 h-full w-px bg-slate-900/20"
               style={{ left: `${(i + 1) * 10}%` }}
            />
         ))}
      </div>
   );
}
