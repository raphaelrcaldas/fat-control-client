// Skeleton que espelha PassaportesTable (mesmas 6 colunas + cabeçalho),
// para zero layout-shift quando os dados chegam.

const COLS = [
   "w-10", // dot
   "w-40", // militar
   "w-24", // nº passaporte
   "w-32", // validade passaporte
   "w-24", // nº visa
   "w-32", // validade visa
] as const;

export default function PassaportesTableSkeleton({
   rows = 8,
}: {
   rows?: number;
}) {
   return (
      <div className="overflow-x-auto">
         <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-gray-50">
               <tr>
                  {COLS.map((w, i) => (
                     <th key={i} className="px-4 py-3">
                        {i > 0 && (
                           <div
                              className={`h-3 ${w} animate-pulse rounded bg-slate-200`}
                           />
                        )}
                     </th>
                  ))}
               </tr>
            </thead>
            <tbody>
               {Array.from({ length: rows }).map((_, r) => (
                  <tr key={r} className="border-b border-slate-200">
                     <td className="w-10 px-3 py-3">
                        <div className="h-3 w-3 animate-pulse rounded-full bg-slate-200" />
                     </td>
                     {COLS.slice(1).map((w, c) => (
                        <td key={c} className="px-4 py-3">
                           <div
                              className={`h-4 ${w} animate-pulse rounded bg-slate-200`}
                           />
                        </td>
                     ))}
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
   );
}
