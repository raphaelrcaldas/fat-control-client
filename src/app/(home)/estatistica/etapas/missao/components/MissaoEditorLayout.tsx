"use client";

import type { ReactNode, RefObject } from "react";

type Props = {
   header: ReactNode;
   sidebar: ReactNode;
   content: ReactNode;
   contentRef?: RefObject<HTMLDivElement | null>;
};

export function MissaoEditorLayout({
   header,
   sidebar,
   content,
   contentRef,
}: Props) {
   return (
      <div className="flex h-[calc(100vh-5rem)] min-h-0 flex-col overflow-hidden border border-slate-200 bg-gray-50 shadow">
         <div className="flex min-h-0">
            <div className="hidden h-full min-h-0 w-88 lg:block">{sidebar}</div>
            <div className="flex min-h-0 w-full flex-col">
               {header}
               {/* div, não <main>: o layout do (home) já provê o main da página
                   (main aninhado/duplicado reprova landmarks no axe) */}
               <div ref={contentRef} className="flex-1 overflow-y-auto py-5">
                  <div className="mx-auto flex max-w-5xl flex-col gap-4">
                     {content}
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
