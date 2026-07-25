"use client";

// Espelha o layout real da lista de eventos (OrdemHistoricoItem): cartão com
// borda de destaque à esquerda, cabeçalho (rótulo + autor + timestamp) e
// linhas de mudança — para não haver salto quando os logs chegam.

// Quantidade de linhas de mudança por cartão: padrão fixo (nunca aleatório,
// que causaria flicker e hydration mismatch). Contagem calibrada contra a
// altura real medida (blocos de lista trazem a legenda + o respiro do
// space-y-1 além das linhas de mudança).
const LINHAS_POR_EVENTO = [2, 4, 2];

export function OrdemHistoricoSkeleton() {
   return (
      <div
         role="status"
         aria-label="Carregando histórico"
         className="max-h-none animate-pulse space-y-3 sm:max-h-96 sm:overflow-hidden"
      >
         {LINHAS_POR_EVENTO.map((linhas, index) => (
            <div
               key={index}
               className="max-w-4xl space-y-2 rounded border border-l-2 border-slate-200 border-l-slate-300 bg-white p-3 shadow-sm"
            >
               <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                     <div className="h-3 w-16 rounded bg-slate-200" />
                     <div className="h-3 w-28 rounded bg-slate-100" />
                  </div>
                  <div className="h-3 w-28 rounded bg-slate-100" />
               </div>
               <div className="space-y-1">
                  {Array.from({ length: linhas }).map((_, linha) => (
                     <div
                        key={linha}
                        className="h-3.5 w-full max-w-sm rounded bg-slate-100"
                     />
                  ))}
               </div>
            </div>
         ))}
      </div>
   );
}
