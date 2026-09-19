"use client";

const SESSION_SKELETONS = [0, 1, 2, 3];
const FIELD_SKELETONS = [0, 1, 2, 3];

export function SimuladorEditorSkeleton() {
   return (
      <div className="space-y-2">
         <div
            role="status"
            aria-label="Carregando missão de simulador"
            className="flex h-[calc(100dvh-4.5rem)] min-h-0 animate-pulse flex-col overflow-hidden rounded border border-slate-200 bg-gray-50 shadow md:h-[calc(100dvh-5rem)]"
         >
            <div className="flex min-h-0 flex-1">
               <div className="hidden h-full w-80 shrink-0 flex-col border-r border-gray-200 bg-gray-50 lg:flex">
                  <div className="flex flex-col gap-3 border-b border-gray-200 bg-white p-4">
                     <div className="h-6 w-28 rounded bg-gray-200" />
                     <div className="h-3 w-52 rounded bg-gray-100" />
                     <div className="h-14 w-full rounded-md bg-gray-100" />
                     <div className="h-9 w-full rounded bg-gray-200" />
                  </div>
                  <div className="flex flex-col gap-2 p-3">
                     {SESSION_SKELETONS.map((item) => (
                        <div
                           key={item}
                           className="h-16 border border-gray-200 bg-white shadow"
                        />
                     ))}
                  </div>
               </div>

               <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-3 sm:px-5">
                     <div className="flex items-center gap-3">
                        <div className="size-9 rounded bg-slate-100" />
                        <div className="space-y-1.5">
                           <div className="h-5 w-36 rounded bg-slate-200" />
                           <div className="h-3 w-48 rounded bg-slate-100" />
                        </div>
                     </div>
                     <div className="h-8 w-28 rounded bg-slate-200" />
                  </div>
                  <div className="flex-1 overflow-hidden p-3 sm:p-5">
                     <div className="mx-auto max-w-4xl space-y-3">
                        <div className="h-24 rounded border border-slate-200 bg-white shadow-sm" />
                        <div className="rounded border border-slate-200 bg-white p-4 shadow-sm">
                           <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                              {FIELD_SKELETONS.map((item) => (
                                 <div key={item} className="space-y-2">
                                    <div className="h-3 w-14 rounded bg-slate-100" />
                                    <div className="h-8 w-full rounded bg-slate-200" />
                                 </div>
                              ))}
                           </div>
                           <div className="grid grid-cols-3 gap-3 pt-4">
                              {[0, 1, 2].map((item) => (
                                 <div
                                    key={item}
                                    className="h-8 rounded bg-slate-100"
                                 />
                              ))}
                           </div>
                        </div>
                        <div className="h-24 rounded border border-slate-200 bg-white shadow-sm" />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
