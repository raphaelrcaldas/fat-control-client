"use client";
import clsx from "clsx";
import { useQuadsContext } from "@/app/(home)/context/quads";
import { CELULA_QUADRINHO, LARGURA_POR_VISUAL } from "./dimensoesCelula";

interface QuadsBoardSkeletonProps {
   rows?: number;
}

// Nº de cards (quadrinhos) por linha — padrão fixo para um visual realista
// e estável (sem flicker), variando o comprimento entre as linhas.
const CARDS_PER_ROW = [9, 5, 12, 7, 4, 10, 6, 8];

export function QuadsBoardSkeleton({ rows = 8 }: QuadsBoardSkeletonProps) {
   const { visual } = useQuadsContext();

   return (
      // Mesma moldura da grade real (ver QuadsBoard): largura da maior linha,
      // nunca menor que o quadro.
      <div className="flex w-max min-w-full flex-col gap-1">
         {Array.from({ length: rows }).map((_, rowIdx) => {
            const cards = CARDS_PER_ROW[rowIdx % CARDS_PER_ROW.length];
            return (
               <div
                  key={rowIdx}
                  className="flex min-w-max items-center justify-start gap-1 px-1 py-0.5"
               >
                  {/* Trigrama (sticky à esquerda, igual ao CrewRow) */}
                  <div className="sticky left-0 z-10 shrink-0 bg-white px-1">
                     {/* O botão do trigrama também cresce no dedo (piso de
                         44px que o tema dá a todo Button), então o
                         placeholder cresce junto. */}
                     <div className="h-9 w-18 animate-pulse rounded bg-slate-200 pointer-coarse:min-h-[44px]" />
                  </div>

                  {/* Cards de quadrinho */}
                  {Array.from({ length: cards }).map((_, cardIdx) => (
                     <div
                        key={cardIdx}
                        className={clsx(
                           "shrink-0 animate-pulse rounded bg-slate-200",
                           CELULA_QUADRINHO,
                           LARGURA_POR_VISUAL[visual]
                        )}
                     />
                  ))}
               </div>
            );
         })}
      </div>
   );
}
