"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { realCurrency } from "utils/financeiro";
import { prefereMenosMovimento } from "utils/motion";
import type { CenarioCor } from "../cenarioPalette";
import type { PlanoStats } from "../propostaCalc";

interface CenarioChipProps {
   codigo: string;
   nome: string;
   cor: CenarioCor;
   stats: PlanoStats;
   militares: number;
   active: boolean;
   /** Tem alteração ainda não salva. */
   dirty: boolean;
   onClick: () => void;
}

/**
 * Cartão de um cenário: identidade (código + nome), quanto ele custa no
 * exercício, quantos militares envolve e o quanto ocupa do teto.
 *
 * O cartão é sempre CLARO — a cor do cenário entra pela espinha lateral (mesma
 * gramática do Masthead) e pelo medidor colado na base. Selecionado = fundo
 * tênue da cor + anel + sombra, como as abas do sistema. A versão anterior
 * pintava o ativo de cor sólida e precisava de texto branco translúcido, que
 * vivia raspando o mínimo de contraste.
 */
export function CenarioChip({
   codigo,
   nome,
   cor,
   stats,
   militares,
   active,
   dirty,
   onClick,
}: CenarioChipProps) {
   const larguraTeto = stats.semTeto
      ? 0
      : Math.min(100, Math.max(0, stats.pctProjetado));

   // A barra sempre PARTE de zero e cresce até a marca: montada já no valor
   // final, a mudança (militar entrando no cenário, troca de exercício) seria
   // um salto seco. Um frame de atraso é o que faz o navegador ter um estado
   // anterior para interpolar.
   const [larguraAnimada, setLarguraAnimada] = useState(0);
   useEffect(() => {
      // Quem pediu menos movimento vai direto ao valor: com a transição
      // desligada, adiar um frame só trocava a animação por um salto.
      if (prefereMenosMovimento()) {
         setLarguraAnimada(larguraTeto);
         return;
      }
      const frame = requestAnimationFrame(() => setLarguraAnimada(larguraTeto));
      return () => cancelAnimationFrame(frame);
   }, [larguraTeto]);

   // Rótulo por extenso: "2 mil." é lido como "dois mil" pelo leitor de tela.
   const rotulo = [
      `Cenário ${codigo} ${nome}`,
      `custo ${realCurrency(stats.rascunho)}`,
      `${militares} ${militares === 1 ? "militar" : "militares"}`,
      stats.excedeTeto ? "excede o teto" : null,
      dirty ? "alterações não salvas" : null,
   ]
      .filter(Boolean)
      .join(", ");

   return (
      <button
         type="button"
         onClick={onClick}
         aria-pressed={active}
         aria-label={rotulo}
         className={clsx(
            "focus-visible:ring-primary-500 relative flex w-52 shrink-0 flex-col gap-1.5 overflow-hidden rounded py-2 pr-3 pl-4 text-left transition-shadow ring-inset focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
            "pb-3.5 pointer-coarse:min-h-[44px]",
            active
               ? clsx(cor.soft, "shadow-sm ring-2", cor.ring)
               : "bg-white ring-1 ring-slate-200 hover:bg-slate-50"
         )}
      >
         {/* Espinha (gramática do Masthead): marca só o cartão selecionado. Cor
             forte em todos empatava a leitura — o inativo chegava a puxar mais
             atenção que o ativo. */}
         {active && (
            <span
               aria-hidden
               className={clsx("absolute inset-y-0 left-0 w-1", cor.dot)}
            />
         )}

         <span className="flex items-center gap-2">
            <span
               className={clsx(
                  "grid h-5 w-5 shrink-0 place-items-center rounded font-mono text-xs leading-4 font-bold",
                  cor.text,
                  active ? "bg-white" : cor.soft
               )}
            >
               {codigo}
            </span>
            <span className="truncate text-sm font-semibold text-slate-900">
               {nome}
            </span>
            {dirty && (
               <span
                  aria-hidden
                  title="Alterações não salvas"
                  className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500 ring-2 ring-white"
               />
            )}
         </span>

         <span className="flex items-center justify-between gap-2">
            <span className="text-sm font-bold text-slate-900 tabular-nums">
               {stats.rascunho > 0 ? "+" : ""}
               {realCurrency(stats.rascunho)}
            </span>
            {/* Só o número: a unidade vive no `title` e no `aria-label` do
                cartão ("N militares"), que já é lido por extenso. */}
            <span
               aria-hidden
               title={`${militares} ${militares === 1 ? "militar" : "militares"}`}
               className="rounded-full bg-white px-2 py-0.5 text-xs leading-4 font-semibold text-slate-600 tabular-nums ring-1 ring-slate-200 ring-inset"
            >
               {militares}
            </span>
         </span>

         {stats.excedeTeto && (
            <span className="w-fit rounded-full bg-red-50 px-1.5 py-0.5 text-xs leading-4 font-bold text-red-700 uppercase ring-1 ring-red-200 ring-inset">
               Excede o teto
            </span>
         )}

         {/* Medidor do teto colado na base, de ponta a ponta: lido como parte
             da moldura do cartão, não como mais um elemento empilhado. */}
         <span
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-1 bg-slate-100"
         >
            {/* Anima em `scaleX`, não em `width`: a escala roda no compositor,
                enquanto largura em transição refaz layout a cada frame — e há
                um cartão desses por cenário. */}
            <span
               className={clsx(
                  "block h-full w-full origin-left transition-[transform,background-color] duration-500 ease-out motion-reduce:transition-none",
                  stats.excedeTeto
                     ? "bg-red-500"
                     : active
                       ? cor.barSegment
                       : "bg-slate-300"
               )}
               style={{ transform: `scaleX(${larguraAnimada / 100})` }}
            />
         </span>
      </button>
   );
}
