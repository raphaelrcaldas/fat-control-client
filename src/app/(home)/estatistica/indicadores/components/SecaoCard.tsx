"use client";

import type { ReactNode } from "react";

interface SecaoCardProps {
   /** Categoria acima do título. Omitir deixa só o título. */
   eyebrow?: string;
   titulo: string;
   children: ReactNode;
}

/** Moldura padrão das seções do painel: título + conteúdo. */
export function SecaoCard({ eyebrow, titulo, children }: SecaoCardProps) {
   return (
      <section className="flex flex-col rounded border border-slate-200 bg-white shadow-sm">
         <header className="border-b border-slate-200 px-4 py-3">
            {eyebrow && (
               <span className="text-primary-600 block font-mono text-[10px] font-bold tracking-[0.3em] uppercase">
                  {eyebrow}
               </span>
            )}
            <h2 className="text-sm font-bold text-slate-900">{titulo}</h2>
         </header>
         {children}
      </section>
   );
}
