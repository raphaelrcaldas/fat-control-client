"use client";

// Skeleton que espelha o layout real do OrdemFormContent:
// header fixo + seções Informações, Tripulação, Etapas, Ordens Especiais e Classificação

function SectionSkeleton({ children }: { children: React.ReactNode }) {
   return (
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
         <div className="border-b border-slate-200 p-4">
            <div className="flex items-center gap-2">
               <div className="h-4 w-1 rounded-full bg-gray-200" />
               <div className="h-3.5 w-32 rounded bg-gray-200" />
            </div>
         </div>
         <div className="p-4">{children}</div>
      </div>
   );
}

export function OrdemDetailSkeleton() {
   return (
      <div
         role="status"
         aria-label="Carregando Ordem de Missão"
         className="flex flex-1 animate-pulse flex-col overflow-hidden rounded-lg border border-gray-200 bg-gray-50 shadow-xl"
      >
         {/* Header */}
         <header className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
            <div className="flex items-center gap-4">
               <div className="h-10 w-10 rounded-lg bg-gray-200" />
               <div className="space-y-2">
                  <div className="h-5 w-56 rounded bg-gray-200" />
                  <div className="h-3.5 w-36 rounded bg-gray-100" />
               </div>
            </div>
            <div className="flex gap-3">
               <div className="h-10 w-24 rounded-lg bg-gray-200" />
               <div className="h-10 w-24 rounded-lg bg-gray-100" />
            </div>
         </header>

         <main className="flex-1 overflow-y-auto">
            <div className="mx-auto space-y-4 p-4">
               {/* Informações: linha de inputs */}
               <SectionSkeleton>
                  <div className="grid gap-4 md:flex">
                     <div className="h-11 w-24 rounded-lg bg-gray-100" />
                     <div className="h-11 flex-1 rounded-lg bg-gray-100" />
                     <div className="h-11 flex-1 rounded-lg bg-gray-100" />
                     <div className="h-11 w-42 rounded-lg bg-gray-100" />
                     <div className="h-11 w-28 rounded-lg bg-gray-100" />
                  </div>
               </SectionSkeleton>

               {/* Tripulação: 6 slots */}
               <SectionSkeleton>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
                     {Array.from({ length: 6 }).map((_, i) => (
                        <div
                           key={i}
                           className="space-y-2 rounded-lg border border-gray-200 bg-white p-3"
                        >
                           <div className="h-3 w-16 rounded bg-gray-200" />
                           <div className="h-7 rounded-md bg-gray-100" />
                           <div className="h-7 rounded-md bg-gray-100" />
                        </div>
                     ))}
                  </div>
               </SectionSkeleton>

               {/* Etapas: tabela */}
               <SectionSkeleton>
                  <div className="space-y-2">
                     <div className="h-9 rounded bg-gray-200" />
                     {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-10 rounded bg-gray-100" />
                     ))}
                  </div>
               </SectionSkeleton>

               {/* Ordens Especiais: cards */}
               <SectionSkeleton>
                  <div className="space-y-3">
                     <div className="h-14 rounded-lg bg-gray-100" />
                     <div className="h-14 rounded-lg bg-gray-100" />
                  </div>
               </SectionSkeleton>

               {/* Classificação: etiquetas */}
               <SectionSkeleton>
                  <div className="flex gap-2">
                     <div className="h-6 w-20 rounded-full bg-gray-100" />
                     <div className="h-6 w-24 rounded-full bg-gray-100" />
                     <div className="h-6 w-16 rounded-full bg-gray-100" />
                  </div>
               </SectionSkeleton>
            </div>
         </main>
      </div>
   );
}
