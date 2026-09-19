"use client";

import type { ReactNode, RefObject } from "react";

interface SimuladorEditorLayoutProps {
   header: ReactNode;
   sidebar: ReactNode;
   content: ReactNode;
   contentRef?: RefObject<HTMLDivElement | null>;
}

export function SimuladorEditorLayout({
   header,
   sidebar,
   content,
   contentRef,
}: SimuladorEditorLayoutProps) {
   return (
      // dvh (nao vh): no mobile a barra de endereco altera a viewport. O
      // desconto corresponde a navbar de 4rem e ao padding do main do shell.
      <div className="flex h-[calc(100dvh-4.5rem)] min-h-0 flex-col overflow-hidden rounded border border-slate-200 bg-gray-50 shadow md:h-[calc(100dvh-5rem)]">
         <div className="flex min-h-0 flex-1">
            <div className="hidden h-full min-h-0 w-80 shrink-0 lg:block">
               {sidebar}
            </div>
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
               {header}
               <div
                  ref={contentRef}
                  className="flex-1 overflow-y-auto p-3 sm:p-5"
               >
                  <div className="mx-auto max-w-4xl">{content}</div>
               </div>
            </div>
         </div>
      </div>
   );
}
