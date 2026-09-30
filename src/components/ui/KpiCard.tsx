"use client";

import type { ReactNode } from "react";
import clsx from "clsx";

interface KpiCardProps {
   icon: ReactNode;
   label: string;
   /**
    * Número já formatado. `null` é "o backend não tem o dado" — diferente de
    * zero, e por isso rende "Indisponível" em vez de "0".
    */
   value: string | null;
   /** Sufixo curto ao lado do número (kg, L, t…). */
   unit?: string;
   sub?: ReactNode;
   /** `lg` para os indicadores de topo, `md` para os operacionais. */
   size?: "lg" | "md";
   /**
    * Reserva a altura do subtexto mesmo sem `sub`. Numa grade onde só alguns
    * cartões têm apoio, sem isso a segunda fileira desalinha da primeira.
    */
   reservaSub?: boolean;
   /**
    * Carregando: troca o número por um bloco pulsante do mesmo tamanho. Sem
    * isso, quem passa `value={null}` enquanto a query roda mostra
    * "Indisponível", e `"0"` derivado de `data ?? []` piscaria como dado real.
    * Não anuncia nada ao leitor de tela por card (seriam vários seguidos): o
    * `role="status"` do carregamento fica com quem monta a grade.
    */
   isLoading?: boolean;
}

export function KpiCard({
   icon,
   label,
   value,
   unit,
   sub,
   size = "lg",
   reservaSub = false,
   isLoading = false,
}: KpiCardProps) {
   const isLg = size === "lg";

   return (
      <div className="rounded border border-slate-200 bg-white p-4 shadow-sm">
         <div className="flex items-center gap-3">
            <div
               className={clsx(
                  "bg-primary-50 text-primary-600 ring-primary-100 grid shrink-0 place-items-center rounded-md ring-1 ring-inset",
                  isLg ? "h-10 w-10" : "h-9 w-9"
               )}
            >
               {icon}
            </div>
            <div className="min-w-0">
               <span className="block font-mono text-[10px] font-bold tracking-[0.15em] text-slate-500 uppercase">
                  {label}
               </span>
               <span
                  className={clsx(
                     "block truncate leading-tight font-extrabold tracking-tight text-slate-900 tabular-nums",
                     isLg ? "text-2xl" : "text-xl"
                  )}
               >
                  {isLoading ? (
                     <span
                        aria-hidden
                        className={clsx(
                           "block w-20 animate-pulse rounded bg-slate-200",
                           isLg ? "h-[26px]" : "h-[22px]"
                        )}
                     />
                  ) : value == null ? (
                     <span className="text-sm font-medium text-slate-500 italic">
                        Indisponível
                     </span>
                  ) : (
                     value
                  )}
                  {unit && value != null && !isLoading && (
                     <span className="ml-1 text-sm font-bold text-slate-500">
                        {unit}
                     </span>
                  )}
               </span>
            </div>
         </div>
         {(sub || reservaSub) && (
            <p
               className={clsx(
                  "mt-2 truncate text-xs text-slate-500",
                  !sub && "min-h-4"
               )}
               // O subtexto de composição (PQD por tipo) trunca em telas
               // estreitas — o title devolve o valor inteiro no hover.
               title={typeof sub === "string" ? sub : undefined}
            >
               {sub}
            </p>
         )}
      </div>
   );
}
