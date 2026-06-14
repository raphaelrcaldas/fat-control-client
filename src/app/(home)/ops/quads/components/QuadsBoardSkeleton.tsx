"use client";
import clsx from "clsx";
import { useQuadsContext } from "@/app/(home)/context/quads";

interface QuadsBoardSkeletonProps {
   rows?: number;
}

// Nº de cards (quadrinhos) por linha — padrão fixo para um visual realista
// e estável (sem flicker), variando o comprimento entre as linhas.
const CARDS_PER_ROW = [9, 5, 12, 7, 4, 10, 6, 8];

export function QuadsBoardSkeleton({ rows = 8 }: QuadsBoardSkeletonProps) {
   const { visual } = useQuadsContext();

   return (
      <>
         {Array.from({ length: rows }).map((_, rowIdx) => {
            const cards = CARDS_PER_ROW[rowIdx % CARDS_PER_ROW.length];
            return (
               <div
                  key={rowIdx}
                  className="flex items-center justify-start gap-1 overflow-visible px-1 py-0.5"
               >
                  {/* Trigrama (sticky à esquerda, igual ao CrewRow) */}
                  <div className="sticky left-0 z-10 shrink-0 bg-white px-1">
                     <div className="h-9 w-16 animate-pulse rounded bg-slate-200" />
                  </div>

                  {/* Cards de quadrinho */}
                  {Array.from({ length: cards }).map((_, cardIdx) => (
                     <div
                        key={cardIdx}
                        className={clsx(
                           "size-9 shrink-0 animate-pulse rounded bg-slate-200",
                           {
                              "sm:w-18": visual === "comp",
                              "sm:w-9": visual === "reduz",
                           }
                        )}
                     />
                  ))}
               </div>
            );
         })}
      </>
   );
}
