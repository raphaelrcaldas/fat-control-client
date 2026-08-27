"use client";

/**
 * Espelha a lista de eventos do HistoricoTab: 3 cartões com cabeçalho
 * (rótulo + carimbo de hora), linha do autor e duas linhas de alteração.
 * As alturas seguem as do conteúdo real (`text-sm` = 20px de linha), mas
 * layout-shift zero é inatingível aqui — o número de eventos é variável.
 */
export default function HistoricoTabSkeleton() {
   return (
      <div className="animate-pulse space-y-2" role="status" aria-live="polite">
         <span className="sr-only">Carregando histórico…</span>
         {[0, 1, 2].map((i) => (
            <div
               key={i}
               aria-hidden
               className="rounded border border-l-2 border-slate-200 bg-white p-3 shadow-sm"
            >
               <div className="flex items-center justify-between">
                  <div className="h-5 w-40 rounded bg-slate-200" />
                  <div className="h-4 w-28 rounded bg-slate-100" />
               </div>
               <div className="mt-1 h-5 w-32 rounded bg-slate-100" />
               <div className="mt-2 space-y-1">
                  <div className="h-5 w-56 rounded bg-slate-100" />
                  <div className="h-5 w-44 rounded bg-slate-100" />
               </div>
            </div>
         ))}
      </div>
   );
}
