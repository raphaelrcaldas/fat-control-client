const TABLE_ROWS = [0, 1, 2, 3, 4, 5, 6, 7];
const TABLE_COLS = [0, 1, 2, 3, 4, 5];
const STAT_CARDS = [0, 1, 2];

/** Carregamento do conteúdo: espelha a tabela à esquerda e o painel do gráfico à direita. */
export function SeboSkeleton() {
   return (
      <div className="flex flex-col gap-3 xl:flex-row">
         {/* Tabela */}
         <div className="w-full overflow-hidden rounded border border-slate-200 bg-white shadow-sm xl:w-auto">
            <div className="flex items-center gap-6 border-b border-slate-200 bg-slate-50 px-4 py-3">
               {TABLE_COLS.map((c) => (
                  <div
                     key={c}
                     className="h-3 w-12 animate-pulse rounded bg-slate-200"
                  />
               ))}
            </div>
            {TABLE_ROWS.map((r) => (
               <div
                  key={r}
                  className="flex items-center gap-6 border-b border-slate-100 px-4 py-3 last:border-b-0"
               >
                  {TABLE_COLS.map((c) => (
                     <div
                        key={c}
                        className="h-3 w-12 animate-pulse rounded bg-slate-100"
                     />
                  ))}
               </div>
            ))}
         </div>

         {/* Painel do gráfico — só aparece no xl, como na página real */}
         <div className="hidden flex-1 xl:block">
            <div className="rounded border border-slate-200 bg-white p-4 shadow-sm">
               <div className="mb-4 h-5 w-48 animate-pulse rounded bg-slate-200" />
               <div className="mb-4 grid grid-cols-3 gap-3">
                  {STAT_CARDS.map((i) => (
                     <div
                        key={i}
                        className="rounded border border-slate-200 p-3"
                     >
                        <div className="h-2.5 w-12 animate-pulse rounded bg-slate-100" />
                        <div className="mt-2 h-5 w-16 animate-pulse rounded bg-slate-200" />
                     </div>
                  ))}
               </div>
               {/* Controle da zona de tolerância */}
               <div className="mb-4 flex items-center gap-3">
                  <div className="h-3 w-28 animate-pulse rounded bg-slate-100" />
                  <div className="h-2 flex-1 animate-pulse rounded-full bg-slate-200" />
                  <div className="h-3 w-10 animate-pulse rounded bg-slate-100" />
               </div>
               <div className="h-95 animate-pulse rounded bg-slate-200" />
            </div>
         </div>
      </div>
   );
}
