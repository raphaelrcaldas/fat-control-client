// Espelha o layout do MissionPage (header com ações + cards de seção) para
// zero layout-shift na troca skeleton → formulário. As ações (Editar/Clonar,
// Salvar) moram no header, dentro do MissionActionBar — não há barra de rodapé.

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
      <div role="status" className="flex w-full justify-center">
         <span className="sr-only">Carregando missão…</span>
         <div aria-hidden className="flex w-full max-w-7xl flex-col gap-2">
            {/* Header: voltar, identificador e ações (ícone no celular,
                rótulo a partir de sm — mesmo do MissionActionBar) */}
            <div className="flex items-center gap-3 rounded border border-slate-200 bg-white px-4 py-2.5 shadow-sm sm:gap-4">
               <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-slate-200" />
               <div className="min-w-0 flex-1">
                  <div className="h-7 w-40 animate-pulse rounded bg-slate-200" />
               </div>
               <div className="ml-auto flex shrink-0 items-center gap-2">
                  <div className="h-8 w-9 animate-pulse rounded bg-slate-200 sm:w-24" />
                  <div className="h-8 w-9 animate-pulse rounded bg-slate-100 sm:w-24" />
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
         </div>
      </div>
   );
}
