"use client";

import type { ReactNode } from "react";

type Props = {
   title: string;
   badge?: ReactNode;
   action?: ReactNode;
   children: ReactNode;
};

export function EtapaSectionCard({ title, badge, action, children }: Props) {
   return (
      <section className="overflow-hidden border border-gray-200 bg-white shadow-sm">
         <header className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-300 bg-gray-50/60 px-4 py-3">
            <div className="flex items-center gap-2">
               <span
                  aria-hidden
                  className="inline-block h-2 w-2 shrink-0 rounded-full bg-red-600"
               />
               <h3 className="text-xs font-semibold tracking-wider text-gray-700 uppercase">
                  {title}
               </h3>
               {badge && <div className="ml-2 flex items-center">{badge}</div>}
            </div>
            {action && <div className="flex items-center gap-2">{action}</div>}
         </header>
         <div className="p-4">{children}</div>
      </section>
   );
}
