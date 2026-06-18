// Espelha a toolbar + tabela de pagamentos para zero layout-shift na troca
// skeleton → conteúdo. Renderizado dentro do container já bordado da seção.

const COLS = [
   { label: "", w: "w-5" },
   { label: "Ordem", w: "w-16" },
   { label: "Militar", w: "w-32" },
   { label: "Sit", w: "w-8" },
   { label: "Descrição", w: "w-40" },
   { label: "Afastamento", w: "w-24" },
   { label: "Regresso", w: "w-24" },
   { label: "Dias", w: "w-8" },
   { label: "Diárias", w: "w-10" },
   { label: "Valor", w: "w-20" },
   { label: "", w: "w-16" },
];

export function PagamentosSkeleton({ rows = 15 }: { rows?: number }) {
   return (
      <div>
         {/* Toolbar */}
         <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-gray-50 px-3 py-0.5">
            <div className="flex items-center gap-4">
               <div className="h-5 w-5 rounded bg-slate-200" />
               <div className="h-5 w-48 animate-pulse rounded bg-slate-200" />
            </div>
            <div className="flex items-center gap-3">
               <div className="h-4 w-40 animate-pulse rounded bg-slate-100" />
               <div className="h-8 w-20 rounded border border-slate-200 bg-slate-100" />
            </div>
         </div>

         {/* Tabela */}
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
               <thead className="border-b border-slate-200">
                  <tr>
                     {COLS.map((c, i) => (
                        <th
                           key={i}
                           className="px-3 py-2 text-center text-xs font-semibold text-slate-400 uppercase"
                        >
                           {c.label}
                        </th>
                     ))}
                  </tr>
               </thead>
               <tbody className="animate-pulse divide-y divide-slate-200">
                  {Array.from({ length: rows }).map((_, r) => (
                     <tr key={r}>
                        {COLS.map((c, i) => (
                           <td key={i} className="px-3 py-1.5">
                              <div
                                 className={`mx-auto h-6 ${c.w} rounded bg-slate-100`}
                              />
                           </td>
                        ))}
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
   );
}
