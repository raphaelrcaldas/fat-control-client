"use client";

import clsx from "clsx";

import { EDITOR_TOP_H } from "./MissaoEditorLayout";

// Skeleton que espelha o MissaoEditorLayout:
// sidebar (título + botão + itens de etapa) | header + cards de seção

export function MissaoEditorSkeleton() {
   return (
      <div
         role="status"
         className="flex h-[calc(100vh-5rem)] min-h-0 animate-pulse flex-col overflow-hidden border border-slate-200 bg-gray-50 shadow"
      >
         <span className="sr-only">Carregando missão…</span>
         <div className="flex min-h-0 flex-1">
            {/* Sidebar */}
            <div className="hidden h-full w-88 shrink-0 flex-col border-r border-gray-200 bg-gray-50 lg:flex">
               <div
                  className={clsx(
                     "flex flex-col justify-center border-b border-gray-200 bg-white py-2 pr-3 pl-4",
                     EDITOR_TOP_H
                  )}
               >
                  {/* masthead: caixa de ícone + eyebrow, título e obs */}
                  <div className="flex items-center gap-3">
                     <div className="h-10 w-10 shrink-0 rounded-md bg-slate-100" />
                     <div className="flex flex-1 flex-col gap-1.5">
                        <div className="h-2.5 w-14 rounded bg-slate-200" />
                        <div className="h-5 w-24 rounded bg-slate-200" />
                        <div className="h-3 w-32 rounded bg-slate-100" />
                     </div>
                  </div>
               </div>
               <div className="flex flex-col gap-2 p-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                     <div
                        key={i}
                        className="flex flex-col gap-2 border border-gray-200 bg-white p-3 pl-4 shadow"
                     >
                        <div className="flex items-center justify-between">
                           <div className="h-4 w-32 rounded bg-slate-200" />
                           <div className="h-3 w-12 rounded bg-slate-100" />
                        </div>
                        <div className="flex items-center justify-between">
                           <div className="h-3 w-24 rounded bg-slate-100" />
                           <div className="h-4 w-12 rounded bg-slate-200" />
                        </div>
                     </div>
                  ))}
               </div>
               <div className="mt-auto flex gap-2 border-t border-gray-200 bg-white p-3">
                  <div className="h-[30px] flex-1 rounded bg-slate-100" />
                  <div className="h-[30px] w-28 rounded bg-slate-100" />
               </div>
            </div>

            {/* Header + conteúdo */}
            <div className="flex min-h-0 w-full flex-col">
               <div
                  className={clsx(
                     "flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 lg:py-0",
                     EDITOR_TOP_H
                  )}
               >
                  <div className="flex items-center gap-3">
                     <div className="h-9 w-9 rounded-full bg-slate-100" />
                     <div className="flex flex-col gap-2">
                        <div className="h-7 w-40 rounded bg-slate-200" />
                        <div className="h-4 w-64 rounded bg-slate-100" />
                     </div>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="h-9 w-28 rounded bg-slate-100" />
                     <div className="h-9 w-20 rounded bg-slate-200" />
                  </div>
               </div>
               <div className="flex-1 overflow-hidden py-5">
                  <div className="mx-auto flex max-w-5xl flex-col gap-4">
                     {Array.from({ length: 3 }).map((_, i) => (
                        <div
                           key={i}
                           className="border border-gray-200 bg-white shadow-sm"
                        >
                           <div className="flex items-center gap-2 border-b border-gray-300 bg-gray-50/60 px-4 py-3">
                              <div className="h-2 w-2 rounded-full bg-gray-200" />
                              <div className="h-3 w-32 rounded bg-gray-200" />
                           </div>
                           <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-4">
                              {Array.from({ length: 4 }).map((_, j) => (
                                 <div key={j} className="flex flex-col gap-1.5">
                                    <div className="h-3 w-16 rounded bg-slate-100" />
                                    <div className="h-8 w-full rounded-md bg-slate-100" />
                                 </div>
                              ))}
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
