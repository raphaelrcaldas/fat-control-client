"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { realCurrency } from "utils/financeiro";
import { prefereMenosMovimento } from "utils/motion";
import { BudgetLegendItem } from "./BudgetLegendItem";

/**
 * Barra segmentada de consumo orçamentário + legenda. **Única** no módulo:
 * serve o `GestaoFiscalCard` (pago/previsto) e o `PlanoMetricCard` do sandbox
 * de propostas (que soma um terceiro segmento na cor do cenário). Ler o
 * mesmo orçamento em duas telas com barras diferentes já produziu divergência.
 */

export interface BudgetSegment {
   /**
    * Identidade estável do segmento (chave de render). Existe porque `label`
    * é texto livre no cartão da proposta — o nome do cenário —, e batizar um
    * cenário de "Pago" colidiria com o segmento consolidado.
    */
   id: string;
   label: string;
   value: number;
   /** Classe do segmento na barra (literal — Tailwind não compila template). */
   barClass: string;
   dotClass: string;
   textClass: string;
   /**
    * Desenha o segmento na barra mas o mantém fora da legenda — para quando o
    * valor já está dito em outro lugar do cartão.
    */
   omitirLegenda?: boolean;
   /**
    * Trecho **simulado**: ainda não é dinheiro comprometido, é o que a
    * proposta acrescentaria. Ganha a mesma linguagem do trecho sandbox da
    * Calculadora de missão (`CompletudeSimBar`) — listrado, pulsando e com uma
    * faixa clara varrendo — para nunca ser lido como consolidado.
    */
   simulado?: boolean;
}

interface BudgetBarProps {
   /** Teto do período. `<= 0` desenha o trilho vazio, sem divisão por zero. */
   total: number;
   segments: readonly BudgetSegment[];
   /** Legenda do que sobra (ou do que estourou). Omitida quando não há teto. */
   remainder?: {
      label: string;
      value: number;
      dotClass: string;
      textClass: string;
   };
}

export function BudgetBar({ total, segments, remainder }: BudgetBarProps) {
   const projetado = segments.reduce((acc, s) => acc + s.value, 0);
   const excede = total > 0 && projetado > total;
   // Primeiro segmento com valor: é ele que arredonda a ponta esquerda.
   const primeiroComValor = segments.findIndex((s) => s.value > 0);

   // Os segmentos crescem a partir do zero em vez de aparecerem prontos: o
   // que o cenário acrescenta ao exercício é a informação que a barra existe
   // para dar, e vê-la entrar deixa claro *quanto* ela empurrou. Um frame de
   // atraso é o que dá ao navegador um estado anterior para interpolar.
   const [entrou, setEntrou] = useState(false);
   useEffect(() => {
      // Preferência por menos movimento: assenta no valor final de uma vez,
      // sem o frame de atraso que só existe para dar de onde interpolar.
      if (prefereMenosMovimento()) {
         setEntrou(true);
         return;
      }
      const frame = requestAnimationFrame(() => setEntrou(true));
      return () => cancelAnimationFrame(frame);
   }, []);

   // Estourado o teto, a escala passa a ser o TOTAL PROJETADO. Normalizar pelo
   // teto satura todos os segmentos em 100% e a barra fica cega justamente
   // quando mais importa: não dá para ver *quanto* estourou.
   const escala = excede ? projetado : total;
   const largura = (v: number) =>
      escala > 0 ? Math.min(100, Math.max(0, (v / escala) * 100)) : 0;

   // Posição do teto dentro da nova escala — vira a marca vertical na barra.
   const tetoPct = excede ? (total / projetado) * 100 : 100;

   return (
      <div>
         <div className="relative flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            {/* Todos os segmentos ficam montados, mesmo zerados: um segmento
                que só nasce quando ganha valor apareceria pronto, sem largura
                anterior de onde animar — é o caso do cenário, que começa em
                zero. Sem valor, some por completo (sem o anel de 1px). */}
            {segments.map((s, i) => (
               <div
                  key={s.id}
                  title={`${s.label} ${realCurrency(s.value)}`}
                  className={clsx(
                     "h-full transition-[width] duration-500 ease-out motion-reduce:transition-none",
                     s.barClass,
                     s.value > 0 && "ring-1 ring-white",
                     i === primeiroComValor && "rounded-l-full",
                     s.simulado &&
                        "animate-sandbox-pulse relative overflow-hidden"
                  )}
                  style={{ width: `${entrou ? largura(s.value) : 0}%` }}
               >
                  {s.simulado && s.value > 0 && (
                     <>
                        {/* Listras + varredura: a diferença entre consolidado e
                            simulado não pode depender só de matiz. */}
                        <span
                           aria-hidden
                           className="absolute inset-0 [background:repeating-linear-gradient(115deg,transparent_0_4px,rgba(15,23,42,0.28)_4px_8px)]"
                        />
                        <span
                           aria-hidden
                           className="animate-sandbox-sweep absolute inset-y-0 -left-1/3 w-1/3 bg-linear-to-r from-transparent via-white/80 to-transparent"
                        />
                     </>
                  )}
               </div>
            ))}

            {excede && (
               <>
                  {/* Faixa que passou do teto: o excesso é vermelho, não a cor
                      do cenário que o causou. */}
                  <span
                     aria-hidden
                     className="absolute inset-y-0 right-0 bg-red-500 transition-[left] duration-500 ease-out motion-reduce:transition-none"
                     style={{ left: `${tetoPct}%` }}
                  />
                  <span
                     aria-hidden
                     title={`Teto ${realCurrency(total)}`}
                     className="absolute inset-y-0 border-l-2 border-slate-900 transition-[left] duration-500 ease-out motion-reduce:transition-none"
                     style={{ left: `${tetoPct}%` }}
                  />
               </>
            )}
         </div>

         {/* Mesma grade de três colunas do `GestaoFiscalCard`. */}
         <div className="mt-3 grid grid-cols-3 gap-x-2 gap-y-2">
            {segments
               .filter((s) => !s.omitirLegenda)
               .map((s) => (
                  <BudgetLegendItem
                     key={s.id}
                     label={s.label}
                     valor={realCurrency(s.value)}
                     dotClass={s.dotClass}
                     textClass={s.textClass}
                  />
               ))}

            {remainder && (
               <BudgetLegendItem
                  label={remainder.label}
                  valor={realCurrency(Math.abs(remainder.value))}
                  dotClass={remainder.dotClass}
                  textClass={remainder.textClass}
                  className="col-start-3"
               />
            )}
         </div>
      </div>
   );
}
