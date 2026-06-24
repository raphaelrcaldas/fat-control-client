// Espelha o layout real (tabela principal + cards de grupo + área de gráfico)
// para zero layout-shift na troca skeleton → conteúdo.

const TABLE_ROWS = Array.from({ length: 8 });
const MONTH_CELLS = Array.from({ length: 12 });
const GROUP_CARDS = ["COMPREP", "COMAE", "DCTA"];

function HeaderCell({ wide = false }: { wide?: boolean }) {
   return (
      <div className={`h-3.5 rounded bg-slate-300 ${wide ? "w-28" : "w-10"}`} />
   );
}

function BodyCell({ wide = false }: { wide?: boolean }) {
   return (
      <div className={`h-3 rounded bg-slate-100 ${wide ? "w-28" : "w-10"}`} />
   );
}

export function EsfAerSkeleton() {
   return (
      <div className="grid animate-pulse justify-items-center gap-4">
         {/* Tabela principal */}
         <div className="w-full overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-6 bg-gray-200 px-3 py-2.5">
               <HeaderCell wide />
               <HeaderCell />
               <HeaderCell />
               <HeaderCell />
               {MONTH_CELLS.map((_, i) => (
                  <HeaderCell key={i} />
               ))}
            </div>
            {TABLE_ROWS.map((_, r) => (
               <div
                  key={r}
                  className="flex items-center gap-6 border-t border-slate-100 px-3 py-2.5"
               >
                  <BodyCell wide />
                  <BodyCell />
                  <BodyCell />
                  <BodyCell />
                  {MONTH_CELLS.map((_, i) => (
                     <BodyCell key={i} />
                  ))}
               </div>
            ))}
         </div>

         {/* Cards de grupo */}
         <div className="grid w-full grid-cols-3 gap-4 md:w-2/3">
            {GROUP_CARDS.map((label) => (
               <div
                  key={label}
                  className="rounded border-t-4 border-slate-200 bg-white p-4 shadow-sm"
               >
                  <div className="mb-3 h-4 w-20 rounded bg-slate-200" />
                  <div className="space-y-2">
                     {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex justify-between">
                           <div className="h-3 w-14 rounded bg-slate-100" />
                           <div className="h-3 w-12 rounded bg-slate-200" />
                        </div>
                     ))}
                  </div>
               </div>
            ))}
         </div>

         {/* Área de gráfico (apenas lg, como o layout real) */}
         <div className="col-span-full hidden w-full grid-cols-1 gap-4 lg:grid lg:grid-cols-3">
            <div className="rounded border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
               <div className="h-[320px] rounded bg-slate-100" />
            </div>
            <div className="rounded border border-slate-200 bg-white p-4 shadow-sm lg:col-span-1">
               <div className="h-[320px] rounded bg-slate-100" />
            </div>
         </div>
      </div>
   );
}
