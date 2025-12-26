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
      <div className="rounded-xl bg-gradient-to-br from-gray-50 to-white p-2">
         {/* Header */}
         <div className="mb-2 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
               <FaBed className="text-lg" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Pernoites</h2>
         </div>

         {/* Tabela moderna */}
         <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
            <Table className="text-center">
               <TableHead className="bg-gradient-to-r from-blue-600 to-indigo-600">
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
                  {pernoites.map((pnt, idx) => {
                     const ini = isoDateToString(pnt.data_ini);
                     const fim = isoDateToString(pnt.data_fim);
                     const ac_desloc = pnt.acrec_desloc ? 95 : 0;

                     return (
                        <TableRow
                           key={pnt.id}
                           className={`${
                              idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                           } transition-colors hover:bg-blue-50`}
                        >
                           <TableCell className="font-medium text-gray-700">
                              {ini}
                           </TableCell>
                           <TableCell className="font-medium text-gray-700">
                              {fim}
                           </TableCell>
                           <TableCell>
                              <div className="flex flex-col items-center">
                                 <span className="font-semibold text-gray-800">
                                    {pnt.cidade.nome}-{pnt.cidade.uf}
                                 </span>
                              </div>
                           </TableCell>
                           <TableCell>
                              <Badge color="info">{pnt.custo.dias}</Badge>
                           </TableCell>
                           <TableCell>
                              <div className="flex flex-col items-center gap-1">
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
                                          className="rounded bg-blue-50 px-2 py-1 text-xs font-medium text-nowrap"
                                          key={i}
                                       >
                                          {qtd} × {valor}
                                       </div>
                                    );
                                 })}
                              </div>
                           </TableCell>
                           <TableCell>
                              {ac_desloc > 0 ? (
                                 <Badge color="success" size="sm">
                                    {Number(ac_desloc).toLocaleString("pt-BR", {
                                       style: "currency",
                                       currency: "BRL",
                                    })}
                                 </Badge>
                              ) : (
                                 <span className="text-gray-400">—</span>
                              )}
                           </TableCell>
                           <TableCell>
                              <span className="rounded-lg bg-green-50 px-3 py-1 font-bold text-green-700">
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
            <div className="rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 p-3 shadow-sm">
               <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">
                     Total de Dias
                  </span>
                  <span className="text-base font-bold text-blue-700">
                     {pernoites.reduce(
                        (acc, pnt) => acc + (pnt.custo?.dias || 0),
                        0
                     )}{" "}
                     dias
                  </span>
               </div>
            </div>

            <div className="rounded-lg border border-green-200 bg-gradient-to-r from-green-50 to-emerald-100 p-3 shadow-sm">
               <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">
                     Acresc. Desloc. Sede
                  </span>
                  <span className="text-base font-bold text-green-700">
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

            <div className="rounded-lg bg-gradient-to-r from-indigo-500 to-blue-600 p-3 shadow-md">
               <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white uppercase">
                     Valor Total
                  </span>
                  <span className="text-base font-bold text-white">
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
