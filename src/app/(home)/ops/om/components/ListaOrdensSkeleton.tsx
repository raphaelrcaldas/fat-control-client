"use client";

// Skeleton que espelha a silhueta do OrdemItem:
// bloco do número + divisórias + colunas (status, etiquetas, doc, descrição, rota)

export function ListaOrdensSkeleton({ rows = 5 }: { rows?: number }) {
   return (
      <div
         role="status"
         aria-label="Carregando ordens de missão"
         className="animate-pulse space-y-2"
      >
         {Array.from({ length: rows }).map((_, i) => (
            <div
               key={i}
               className="relative overflow-hidden rounded border-y border-r border-gray-200 bg-white py-3 pr-4 pl-5 shadow"
            >
               {/* Faixa lateral de status */}
               <div className="absolute inset-y-0 left-0 w-1.5 bg-gray-200" />
               <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                     <div className="flex flex-col items-center gap-1.5">
                        <div className="hidden h-3 w-12 self-start rounded bg-gray-100 md:block" />
                        <div className="h-6 w-16 rounded bg-gray-200" />
                     </div>
                     <div className="hidden h-10 w-px bg-gray-200 md:block" />
                     <div className="hidden w-24 flex-col items-center gap-1.5 md:flex">
                        <div className="h-3 w-12 rounded bg-gray-100" />
                        <div className="h-4 w-16 rounded bg-gray-200" />
                     </div>
                     <div className="hidden h-10 w-px bg-gray-200 md:block" />
                     <div className="hidden w-32 flex-col items-center gap-1.5 md:flex">
                        <div className="h-3 w-14 rounded bg-gray-100" />
                        <div className="h-4 w-20 rounded-full bg-gray-200" />
                     </div>
                     <div className="hidden h-10 w-px bg-gray-200 xl:block" />
                     <div className="hidden w-48 flex-col gap-1.5 xl:flex">
                        <div className="h-3 w-28 rounded bg-gray-100" />
                        <div className="h-4 w-36 rounded bg-gray-200" />
                     </div>
                     <div className="hidden h-10 w-px bg-gray-200 lg:block" />
                     <div className="hidden w-48 flex-col gap-1.5 lg:flex">
                        <div className="h-3 w-16 rounded bg-gray-100" />
                        <div className="h-4 w-40 rounded bg-gray-200" />
                     </div>
                     <div className="hidden h-10 w-px bg-gray-200 md:block" />
                     <div className="h-5 w-40 rounded bg-gray-100" />
                  </div>
                  <div className="h-9 w-9 shrink-0 rounded bg-gray-100" />
               </div>
            </div>
         ))}
      </div>
   );
}
