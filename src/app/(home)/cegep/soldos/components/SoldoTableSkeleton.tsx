// Espelha SoldoTableDesktop (7 colunas) e SoldoCardList 1:1 para zero
// layout-shift na troca skeleton → conteúdo.
const COL_WIDTHS = ["w-32", "w-36", "w-20", "w-16", "w-16", "w-20", "w-10"];

export default function SoldoTableSkeleton({ rows = 8 }: { rows?: number }) {
   return (
      <div className="animate-pulse">
         {/* Desktop */}
         <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
               <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                     {COL_WIDTHS.map((w, i) => (
                        <th key={i} className="px-4 py-3">
                           <div className={`h-3 ${w} rounded bg-slate-200`} />
                        </th>
                     ))}
                  </tr>
               </thead>
               <tbody>
                  {Array.from({ length: rows }).map((_, r) => (
                     <tr key={r} className="border-b border-slate-200">
                        <td className="px-4 py-3">
                           <div className="flex items-center gap-3">
                              <div className="h-5 w-10 rounded bg-slate-200" />
                              <div className="h-4 w-28 rounded bg-slate-100" />
                           </div>
                        </td>
                        <td className="px-4 py-3">
                           <div className="h-5 w-36 rounded bg-slate-200" />
                        </td>
                        <td className="px-4 py-3">
                           <div className="h-4 w-20 rounded bg-slate-100" />
                        </td>
                        <td className="px-4 py-3">
                           <div className="h-4 w-16 rounded bg-slate-100" />
                        </td>
                        <td className="px-4 py-3">
                           <div className="h-4 w-16 rounded bg-slate-100" />
                        </td>
                        <td className="px-4 py-3">
                           <div className="flex items-center gap-1.5">
                              <div className="h-2 w-2 rounded-full bg-slate-200" />
                              <div className="h-3 w-16 rounded bg-slate-100" />
                           </div>
                        </td>
                        <td className="px-4 py-3">
                           <div className="flex justify-end gap-2">
                              <div className="h-5 w-5 rounded bg-slate-100" />
                              <div className="h-5 w-5 rounded bg-slate-100" />
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>

         {/* Mobile */}
         <div className="space-y-3 p-4 md:hidden">
            {Array.from({ length: Math.min(rows, 4) }).map((_, r) => (
               <div
                  key={r}
                  className="rounded border border-slate-200 bg-white p-4 shadow-sm"
               >
                  <div className="mb-3 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <div className="h-5 w-10 rounded bg-slate-200" />
                        <div className="h-4 w-24 rounded bg-slate-100" />
                     </div>
                     <div className="h-3 w-16 rounded bg-slate-100" />
                  </div>
                  <div className="mb-2 h-3 w-32 rounded bg-slate-100" />
                  <div className="mb-3 h-6 w-28 rounded bg-slate-200" />
                  <div className="mb-3 flex gap-4">
                     <div className="h-4 w-24 rounded bg-slate-100" />
                     <div className="h-4 w-24 rounded bg-slate-100" />
                  </div>
                  <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                     <div className="h-7 w-20 rounded bg-slate-100" />
                     <div className="h-7 w-20 rounded bg-slate-100" />
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
}
