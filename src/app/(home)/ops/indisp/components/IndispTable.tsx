import { ReactNode } from "react";
import { CrewIndispList } from "services/routes/indisps";
import { IndispTableHeader } from "./IndispTableHeader";
import { IndispTableRow } from "./IndispTableRow";

interface IndispTableProps {
   indisps: CrewIndispList[];
   dates: Date[];
   controls?: ReactNode;
   legend?: ReactNode;
}

export function IndispTable({
   indisps,
   dates,
   controls,
   legend,
}: IndispTableProps) {
   const principais = indisps.filter((item) => item.trip.oper !== "al");
   const alunos = indisps.filter((item) => item.trip.oper === "al");
   // "Hoje" calculado uma vez e propagado (evita new Date() por célula/coluna).
   const today = new Date();

   return (
      <div className="flex max-h-full min-h-0 w-fit flex-col overflow-hidden rounded border border-slate-200 bg-white shadow">
         {controls && (
            <div className="shrink-0 border-b border-slate-200">{controls}</div>
         )}
         {legend && <div className="shrink-0">{legend}</div>}

         <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto">
            <div className="min-w-max px-2 pb-2">
               <table className="relative w-full overflow-visible">
                  <IndispTableHeader dates={dates} today={today} />
                  <tbody className="divide-y divide-slate-200">
                     {principais.map((item) => (
                        <IndispTableRow
                           key={item.trip.id}
                           dates={dates}
                           tripData={item}
                           today={today}
                        />
                     ))}

                     {alunos.length > 0 && (
                        <>
                           <tr>
                              <td
                                 colSpan={dates.length + 1}
                                 className="px-4 py-3"
                              >
                                 <div className="flex items-center justify-center gap-2">
                                    <div className="h-px flex-1 bg-gray-300" />
                                    <span className="text-base font-bold text-gray-700 uppercase">
                                       Alunos
                                    </span>
                                    <div className="h-px flex-1 bg-gray-300" />
                                 </div>
                              </td>
                           </tr>
                           {alunos.map((item) => (
                              <IndispTableRow
                                 key={item.trip.id}
                                 dates={dates}
                                 tripData={item}
                                 today={today}
                              />
                           ))}
                        </>
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
   );
}
