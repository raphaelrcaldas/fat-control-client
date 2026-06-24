"use client";

// Skeleton que espelha o MissaoEditorLayout:
// sidebar (título + botão + itens de etapa) | header + cards de seção

export function MissaoEditorSkeleton() {
   return (
      <div
         role="status"
         aria-label="Carregando missão"
         className="flex h-[calc(100vh-5rem)] min-h-0 animate-pulse flex-col overflow-hidden border border-slate-200 bg-gray-50 shadow"
      >
         <div className="flex min-h-0 flex-1">
            {/* Sidebar */}
            <div className="hidden h-full w-88 flex-col border-r border-gray-200 bg-gray-50 lg:flex">
               <div className="flex flex-col gap-3 border-b border-gray-200 bg-white p-4">
                  <div className="h-9 w-full rounded-md bg-slate-100" />
                  <div className="h-12 w-full rounded-md bg-slate-100" />
                  <div className="h-9 w-full rounded bg-slate-200" />
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
                        <div className="flex justify-end">
                           <div className="h-4 w-16 rounded-full bg-slate-100" />
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            {/* Header + conteúdo */}
            <div className="flex min-h-0 w-full flex-col">
               <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
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
