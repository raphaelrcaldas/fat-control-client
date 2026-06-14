import clsx from "clsx";
import { ReactNode } from "react";
import { getColumnVisibilityClass } from "../utils/columnVisibility";

// Espelha a IndispTable: cabeçalho de controles + coluna de trigrama +
// N colunas de dia (mesma visibilidade por breakpoint) + cabeçalho de 2 linhas.
interface IndispTableSkeletonProps {
   cols?: number;
   rows?: number;
   controls?: ReactNode;
   legend?: ReactNode;
}

export function IndispTableSkeleton({
   cols = 21,
   rows = 14,
   controls,
   legend,
}: IndispTableSkeletonProps) {
   return (
      <div className="flex max-h-full min-h-0 w-fit flex-col overflow-hidden rounded border border-slate-200 bg-white shadow">
         {controls && (
            <div className="shrink-0 border-b border-slate-200">{controls}</div>
         )}
         {legend && <div className="shrink-0">{legend}</div>}
         <div className="min-w-max flex-1 animate-pulse overflow-x-auto overflow-y-auto px-2 pb-2">
            <table className="w-full">
               <thead className="bg-white">
                  <tr>
                     <th />
                     {Array.from({ length: cols }).map((_, i) => (
                        <th
                           key={i}
                           className={clsx(
                              "px-1 py-2",
                              getColumnVisibilityClass(i)
                           )}
                        >
                           <div className="mx-auto h-4 w-6 rounded bg-slate-100" />
                        </th>
                     ))}
                  </tr>
                  <tr>
                     <th />
                     {Array.from({ length: cols }).map((_, i) => (
                        <th
                           key={i}
                           className={clsx(
                              "px-1 py-2",
                              getColumnVisibilityClass(i)
                           )}
                        >
                           <div className="mx-auto h-4 w-8 rounded bg-slate-200" />
                        </th>
                     ))}
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-200">
                  {Array.from({ length: rows }).map((_, r) => (
                     <tr key={r}>
                        <th scope="row" className="px-px py-1.5">
                           <div className="mx-auto h-10 w-14 rounded bg-slate-200" />
                        </th>
                        {Array.from({ length: cols }).map((_, i) => (
                           <td
                              key={i}
                              className={clsx(
                                 "px-1",
                                 getColumnVisibilityClass(i)
                              )}
                           >
                              <div className="mx-auto size-10 rounded bg-slate-100" />
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
