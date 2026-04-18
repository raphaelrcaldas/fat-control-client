import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeadCell,
   TableRow,
   Badge,
} from "flowbite-react";
import { isoDateToString } from "utils/dateHandler";
import { MdCalendarToday, MdLocationOn, MdAttachMoney } from "react-icons/md";
import { FaBed } from "react-icons/fa";
import { Pernoite } from "services/routes/cegep/missoes";

interface MisPntsTableProps {
   pernoites: Pernoite[];
   acDeslocSede: boolean;
   total: number;
}

export function MisPntsTable({
   pernoites,
   acDeslocSede,
   total,
}: MisPntsTableProps) {
   return (
      <div>
         {/* Header */}
         <div className="mb-2 flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-red-600">
               <FaBed className="text-lg" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Pernoites</h2>
         </div>

         <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
            <Table
               className="text-center"
               theme={{
                  head: {
                     cell: { base: "bg-white border-b border-slate-200" },
                  },
               }}
            >
               <TableHead>
                  <TableRow>
                     <TableHeadCell className="">
                        <div className="flex items-center justify-center gap-2">
                           <MdCalendarToday />
                           Chegada
                        </div>
                     </TableHeadCell>
                     <TableHeadCell className="">
                        <div className="flex items-center justify-center gap-2">
                           <MdCalendarToday />
                           Saída
                        </div>
                     </TableHeadCell>
                     <TableHeadCell className="">
                        <div className="flex items-center justify-center gap-2">
                           <MdLocationOn />
                           Localidade
                        </div>
                     </TableHeadCell>
                     <TableHeadCell className="">Dias</TableHeadCell>
                     <TableHeadCell className="">Diárias</TableHeadCell>
                     <TableHeadCell className="">Acrésc. Desloc</TableHeadCell>
                     <TableHeadCell className="">
                        <div className="flex items-center justify-center gap-2">
                           <MdAttachMoney />
                           SubTotal
                        </div>
                     </TableHeadCell>
                  </TableRow>
               </TableHead>
               <TableBody className="divide-y divide-gray-200">
                  {pernoites.map((pnt) => {
                     const ini = isoDateToString(pnt.data_ini);
                     const fim = isoDateToString(pnt.data_fim);
                     const ac_desloc = pnt.acrec_desloc ? 95 : 0;

                     return (
                        <TableRow key={pnt.id}>
                           <TableCell className="font-mono text-gray-700">
                              {ini}
                           </TableCell>
                           <TableCell className="font-mono text-gray-700">
                              {fim}
                           </TableCell>
                           <TableCell>
                              <div className="flex flex-col items-center">
                                 <span className="font-semibold text-gray-800">
                                    {pnt.cidade.nome}-{pnt.cidade.uf}
                                 </span>
                              </div>
                           </TableCell>
                           <TableCell className="font-mono">
                              {pnt.custo.dias}
                           </TableCell>
                           <TableCell>
                              <div className="flex flex-col items-center gap-1 font-mono">
                                 {pnt.custo.vals.map((val, i) => {
                                    const qtd = Number(val.qtd).toFixed(1);
                                    const valor = Number(
                                       val.valor
                                    ).toLocaleString("pt-BR", {
                                       style: "currency",
                                       currency: "BRL",
                                    });

                                    return (
                                       <div
                                          className="rounded border border-current/30 bg-red-100 px-2 py-0.5 text-sm font-medium text-nowrap text-slate-600"
                                          key={i}
                                       >
                                          {qtd} × {valor}
                                       </div>
                                    );
                                 })}
                              </div>
                           </TableCell>
                           <TableCell>
                              <span className="font-mono text-gray-800">
                                 {ac_desloc > 0
                                    ? Number(ac_desloc).toLocaleString(
                                         "pt-BR",
                                         {
                                            style: "currency",
                                            currency: "BRL",
                                         }
                                      )
                                    : "-"}
                              </span>
                           </TableCell>
                           <TableCell>
                              <span className="rounded-lg border border-current/30 bg-green-50 px-3 py-1 font-mono font-bold text-green-700">
                                 {Number(pnt.custo.subtotal).toLocaleString(
                                    "pt-BR",
                                    {
                                       style: "currency",
                                       currency: "BRL",
                                    }
                                 )}
                              </span>
                           </TableCell>
                        </TableRow>
                     );
                  })}
               </TableBody>
            </Table>
         </div>

         {/* Footer com totais */}
         <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-red-200 bg-linear-to-r from-red-50 to-red-100 p-3 shadow-sm">
               <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">
                     Total de Dias
                  </span>
                  <span className="text-base font-bold text-red-700">
                     {pernoites.reduce(
                        (acc, pnt) => acc + (pnt.custo?.dias || 0),
                        0
                     )}{" "}
                     dias
                  </span>
               </div>
            </div>

            <div className="rounded-lg border border-green-200 bg-linear-to-r from-green-50 to-emerald-100 p-3 shadow-sm">
               <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">
                     Acresc. Desloc. Sede
                  </span>
                  <span className="font-mono text-base text-green-700">
                     {acDeslocSede
                        ? Number(95).toLocaleString("pt-BR", {
                             style: "currency",
                             currency: "BRL",
                          })
                        : Number(0).toLocaleString("pt-BR", {
                             style: "currency",
                             currency: "BRL",
                          })}
                  </span>
               </div>
            </div>

            <div className="rounded-lg bg-linear-to-r from-red-400 to-red-600 p-3 shadow-md">
               <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white uppercase">
                     Valor Total
                  </span>
                  <span className="font-mono text-base text-white">
                     {Number(total).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                     })}
                  </span>
               </div>
            </div>
         </div>
      </div>
   );
}
