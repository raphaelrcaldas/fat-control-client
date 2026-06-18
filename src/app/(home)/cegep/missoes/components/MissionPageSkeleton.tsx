// Espelha o layout do MissionPage (header + cards de seção + barra de ações)
// para zero layout-shift na troca skeleton → formulário.

// Alturas aproximadas de cada seção empilhada, em ordem de render.
const SECTION_HEIGHTS = [
   "h-16", // Etiquetas
   "h-24", // Documento
   "h-20", // Descrição
   "h-24", // Classificação
   "h-32", // Período
   "h-28", // Observações
   "h-28", // Pernoites
   "h-24", // Militares
];

export function MissionPageSkeleton() {
   return (
      <div className="flex w-full justify-center">
         <div className="flex w-full max-w-7xl flex-col gap-2">
            {/* Header */}
            <div className="flex items-center gap-4 rounded border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
               <div className="h-10 w-10 shrink-0 rounded-full bg-slate-200" />
               <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
                  <div className="h-3 w-56 animate-pulse rounded bg-slate-100" />
               </div>
            </div>

            {/* Seções */}
            <div className="space-y-2">
               {SECTION_HEIGHTS.map((h, i) => (
                  <div
                     key={i}
                     className="rounded border border-slate-200 bg-white p-4 shadow-sm"
                  >
                     <div className="mb-4 flex items-center gap-2">
                        <div className="h-4 w-1 rounded-full bg-slate-200" />
                        <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                     </div>
                     <div
                        className={`w-full animate-pulse rounded bg-slate-100 ${h}`}
                     />
                  </div>
               ))}
            </div>

            {/* Barra de ações */}
            <div className="rounded border border-slate-200 bg-white p-4 shadow-sm">
               <div className="flex w-full justify-center gap-3">
                  <div className="h-10 w-28 animate-pulse rounded bg-slate-200" />
                  <div className="h-10 w-28 animate-pulse rounded bg-slate-100" />
               </div>
            </div>
         </div>
      </div>
   );
}
