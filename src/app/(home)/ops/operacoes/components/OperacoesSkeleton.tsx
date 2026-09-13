// Espelha `OperacoesTable` 1:1 — as duas formas, lista no mobile e tabela de
// `md:` para cima — para zero layout-shift na troca skeleton → conteúdo.
export function OperacoesSkeleton({ rows = 8 }: { rows?: number }) {
   const linhas = Array.from({ length: rows });

   return (
      <div className="animate-pulse">
         {/* mobile */}
         <ul className="flex flex-col divide-y divide-slate-100 md:hidden">
            {linhas.map((_, i) => (
               <li key={i} className="flex items-stretch">
                  <span className="w-1 shrink-0 bg-slate-200" aria-hidden />
                  <div className="flex min-w-0 flex-1 flex-col gap-2 px-3 py-3">
                     <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-200" />
                        <div className="h-3.5 w-32 rounded bg-slate-200" />
                        <div className="h-4 w-16 rounded bg-slate-100" />
                        <div className="ml-auto h-3 w-7 rounded bg-slate-100" />
                     </div>
                     <div className="h-3 w-40 rounded bg-slate-100" />
                     <div className="flex items-center justify-between gap-2">
                        <div className="h-3 w-36 rounded bg-slate-100" />
                        <div className="h-3.5 w-16 rounded bg-slate-200" />
                     </div>
                  </div>
               </li>
            ))}
         </ul>

         {/* desktop — mesmas colunas e larguras da tabela real */}
         <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
               <thead>
                  <tr className="bg-gray-50">
                     <th className="w-1 p-0" />
                     <th className="w-px px-3 py-2">
                        <div className="ml-auto h-3 w-5 rounded bg-slate-200" />
                     </th>
                     <th className="px-3 py-2">
                        <div className="h-3 w-20 rounded bg-slate-200" />
                     </th>
                     <th className="w-px px-3 py-2">
                        <div className="h-3 w-10 rounded bg-slate-200" />
                     </th>
                     <th className="hidden px-3 py-2 lg:table-cell">
                        <div className="h-3 w-12 rounded bg-slate-200" />
                     </th>
                     <th className="w-px px-3 py-2">
                        <div className="h-3 w-16 rounded bg-slate-200" />
                     </th>
                     <th className="w-px px-3 py-2">
                        <div className="ml-auto h-3 w-8 rounded bg-slate-200" />
                     </th>
                     <th className="w-px px-3 py-2">
                        <div className="ml-auto h-3 w-10 rounded bg-slate-200" />
                     </th>
                     <th className="w-px px-3 py-2">
                        <div className="ml-auto h-3 w-12 rounded bg-slate-200" />
                     </th>
                     <th className="w-px px-3 py-2">
                        <div className="ml-auto h-3 w-7 rounded bg-slate-200" />
                     </th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {linhas.map((_, i) => (
                     <tr key={i}>
                        <td className="w-1 bg-slate-200 p-0" />
                        <td className="w-px px-3 py-2">
                           <div className="ml-auto h-3 w-6 rounded bg-slate-100" />
                        </td>
                        <td className="px-3 py-2">
                           <div className="flex items-center gap-2">
                              <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-200" />
                              <div className="h-3.5 w-36 rounded bg-slate-200" />
                           </div>
                        </td>
                        <td className="w-px px-3 py-2">
                           <div className="h-4 w-16 rounded bg-slate-100" />
                        </td>
                        <td className="hidden px-3 py-2 lg:table-cell">
                           <div className="h-3 w-28 rounded bg-slate-100" />
                        </td>
                        <td className="w-px px-3 py-2">
                           <div className="h-3 w-24 rounded bg-slate-100" />
                        </td>
                        <td className="w-px px-3 py-2">
                           <div className="ml-auto h-3 w-5 rounded bg-slate-100" />
                        </td>
                        <td className="w-px px-3 py-2">
                           <div className="ml-auto h-3 w-11 rounded bg-slate-200" />
                        </td>
                        <td className="w-px px-3 py-2">
                           <div className="ml-auto h-3 w-6 rounded bg-slate-100" />
                        </td>
                        <td className="w-px px-3 py-2">
                           <div className="ml-auto h-3 w-4 rounded bg-slate-100" />
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
   );
}
