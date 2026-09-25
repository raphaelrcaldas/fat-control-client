"use client";

// Skeleton que espelha o layout real do OrdemFormContent:
// header fixo + seções Informações, Tripulação, Etapas, Ordens Especiais e Classificação

function SectionSkeleton({
   // As seções reais Etapas e Ordens Especiais usam `FormSection` SEM
   // `title` (ver OrdemFormContent.tsx) — sem a faixa de cabeçalho com
   // borda inferior. Com withHeader=false o cabeçalho é desenhado no
   // corpo, espelhando o cabeçalho interno real dessas tabelas/listas
   // (ver EtapasTable.tsx), para não haver salto de layout.
   withHeader = true,
   contentClassName = "p-4",
   children,
}: {
   withHeader?: boolean;
   contentClassName?: string;
   children: React.ReactNode;
}) {
   return (
      <div className="rounded border border-slate-200 bg-white shadow-sm">
         {withHeader && (
            <div className="border-b border-slate-200 p-4">
               <div className="flex items-center gap-2">
                  <div className="h-4 w-1 rounded-full bg-slate-200" />
                  <div className="h-3.5 w-32 rounded bg-slate-200" />
               </div>
            </div>
         )}
         <div className={contentClassName}>{children}</div>
      </div>
   );
}

// Cabeçalho interno das seções sem título (Etapas, Ordens Especiais):
// barra + título + contador à esquerda, "Adicionar" à direita
function InlineHeaderSkeleton() {
   return (
      <div className="mb-3 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <div className="h-4 w-1 rounded-full bg-slate-200" />
            <div className="h-3.5 w-20 rounded bg-slate-200" />
            <div className="h-4 w-6 rounded-full bg-slate-100" />
         </div>
         <div className="h-3.5 w-20 rounded bg-slate-100" />
      </div>
   );
}

export function OrdemDetailSkeleton() {
   return (
      <div
         role="status"
         aria-label="Carregando Ordem de Missão"
         className="flex flex-1 animate-pulse flex-col overflow-hidden rounded border border-slate-200 bg-slate-50 shadow"
      >
         {/* Header */}
         <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm md:px-6 md:py-4">
            <div className="flex flex-1 items-center gap-4">
               <div className="h-10 w-10 rounded bg-slate-200" />
               <div className="hidden space-y-2 md:block">
                  <div className="h-5 w-56 rounded bg-slate-200" />
                  <div className="h-3.5 w-36 rounded bg-slate-100" />
               </div>
            </div>
            {/* Badge de status central */}
            <div className="hidden flex-1 justify-center md:flex">
               <div className="h-7 w-24 rounded-full bg-slate-100" />
            </div>
            <div className="flex flex-1 justify-end gap-2 md:gap-3">
               <div className="h-10 w-24 rounded bg-slate-200" />
               <div className="h-10 w-24 rounded bg-slate-100" />
            </div>
         </header>

         <div className="flex-1 overflow-y-auto">
            <div className="mx-auto space-y-4 p-4">
               {/* Informações: linha de inputs */}
               <SectionSkeleton>
                  <div className="grid grid-cols-4 gap-4 md:flex">
                     <div className="col-span-1 h-11 rounded bg-slate-100 md:w-24" />
                     <div className="col-span-3 h-11 rounded bg-slate-100 md:flex-1" />
                     <div className="col-span-4 h-11 rounded bg-slate-100 md:flex-1" />
                     <div className="col-span-2 h-11 rounded bg-slate-100 md:w-42" />
                     <div className="col-span-2 h-11 rounded bg-slate-100 md:w-28" />
                  </div>
               </SectionSkeleton>

               {/* Tripulação: 6 slots */}
               <SectionSkeleton>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
                     {Array.from({ length: 6 }).map((_, i) => (
                        <div
                           key={i}
                           className="space-y-2 rounded border border-slate-200 bg-white p-3"
                        >
                           <div className="h-3 w-16 rounded bg-slate-200" />
                           <div className="h-7 rounded-md bg-slate-100" />
                           <div className="h-7 rounded-md bg-slate-100" />
                        </div>
                     ))}
                  </div>
               </SectionSkeleton>

               {/* Etapas: tabela — FormSection sem título, cabeçalho no corpo */}
               <SectionSkeleton withHeader={false}>
                  <InlineHeaderSkeleton />
                  <div className="space-y-2">
                     <div className="h-9 rounded bg-slate-200" />
                     {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-10 rounded bg-slate-100" />
                     ))}
                  </div>
               </SectionSkeleton>

               {/* Ordens Especiais: cards — FormSection sem título, cabeçalho
                   no corpo; mesmo contentClassName da seção real */}
               <SectionSkeleton withHeader={false} contentClassName="px-4 py-5">
                  <InlineHeaderSkeleton />
                  <div className="space-y-3">
                     <div className="h-14 rounded bg-slate-100" />
                     <div className="h-14 rounded bg-slate-100" />
                  </div>
               </SectionSkeleton>

               {/* Classificação: etiquetas */}
               <SectionSkeleton>
                  <div className="flex gap-2">
                     <div className="h-6 w-20 rounded-full bg-slate-100" />
                     <div className="h-6 w-24 rounded-full bg-slate-100" />
                     <div className="h-6 w-16 rounded-full bg-slate-100" />
                  </div>
               </SectionSkeleton>
            </div>
         </div>
      </div>
   );
}
