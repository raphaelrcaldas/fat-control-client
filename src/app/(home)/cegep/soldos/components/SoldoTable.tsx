"use client";

import { Badge } from "flowbite-react";
import { HiPencil, HiTrash } from "react-icons/hi";
import { SoldoPublic } from "services/routes/cegep/soldos";
import { postoGradRecords, CIRCULO_LABELS } from "services/routes/postos";

const getPostoInfo = (pg: string) =>
   postoGradRecords.find((p) => p.short === pg);

interface SoldoTableProps {
   soldos: SoldoPublic[];
   onEdit: (soldo: SoldoPublic) => void;
   onDelete: (soldo: SoldoPublic) => void;
}

const formatCurrency = (value: number) => {
   return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
   }).format(value);
};

const formatDate = (dateStr: string | null) => {
   if (!dateStr) return "-";
   return new Date(dateStr + "T00:00:00").toLocaleDateString("pt-BR");
};

const getStatus = (dataInicio: string, dataFim: string | null) => {
   const today = new Date();
   today.setHours(0, 0, 0, 0);
   const inicio = new Date(dataInicio + "T00:00:00");
   const fim = dataFim ? new Date(dataFim + "T00:00:00") : null;

   if (inicio > today) return "proximo";
   if (fim && fim < today) return "anterior";
   return "vigente";
};

const getCirculoColor = (circulo: string | undefined) => {
   switch (circulo) {
      case "praca":
         return "gray";
      case "grad":
         return "indigo";
      case "of_sub":
         return "success";
      case "of_int":
         return "warning";
      case "of_sup":
         return "info";
      case "of_gen":
         return "failure";
      default:
         return "gray";
   }
};

export default function SoldoTable({
   soldos,
   onEdit,
   onDelete,
}: SoldoTableProps) {
   return (
      <>
         {/* Desktop Table */}
         <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm text-gray-600">
               <thead className="border-b border-gray-200 bg-gray-50 text-xs text-gray-700 uppercase">
                  <tr>
                     <th scope="col" className="px-4 py-3 font-semibold">
                        Posto/Graduacao
                     </th>
                     <th scope="col" className="px-4 py-3 font-semibold">
                        Circulo
                     </th>
                     <th scope="col" className="px-4 py-3 font-semibold">
                        Valor
                     </th>
                     <th scope="col" className="px-4 py-3 font-semibold">
                        Data Inicio
                     </th>
                     <th scope="col" className="px-4 py-3 font-semibold">
                        Data Fim
                     </th>
                     <th scope="col" className="px-4 py-3 font-semibold">
                        Status
                     </th>
                     <th scope="col" className="px-4 py-3">
                        <span className="sr-only">Acoes</span>
                     </th>
                  </tr>
               </thead>
               <tbody>
                  {soldos.map((soldo) => (
                     <tr
                        key={soldo.id}
                        className="border-b border-gray-200 transition-colors hover:bg-gray-50"
                     >
                        <td className="px-4 py-3">
                           <div className="flex items-center gap-3">
                              <Badge
                                 color={getCirculoColor(
                                    soldo.posto_grad?.circulo ||
                                       getPostoInfo(soldo.pg)?.circulo
                                 )}
                                 className="flex w-10 justify-center"
                                 size="sm"
                              >
                                 {soldo.pg.toUpperCase()}
                              </Badge>
                              <span className="text-gray-900">
                                 {soldo.posto_grad?.mid ||
                                    getPostoInfo(soldo.pg)?.mid ||
                                    soldo.pg}
                              </span>
                           </div>
                        </td>
                        <td className="px-4 py-3">
                           <Badge
                              color={getCirculoColor(
                                 soldo.posto_grad?.circulo ||
                                    getPostoInfo(soldo.pg)?.circulo
                              )}
                              className="flex w-36 justify-center"
                              size="sm"
                           >
                              {CIRCULO_LABELS[
                                 soldo.posto_grad?.circulo ||
                                    getPostoInfo(soldo.pg)?.circulo ||
                                    ""
                              ] || "-"}
                           </Badge>
                        </td>
                        <td className="px-4 py-3">
                           <span className="font-mono font-semibold text-green-600">
                              {formatCurrency(soldo.valor)}
                           </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-gray-600">
                           {formatDate(soldo.data_inicio)}
                        </td>
                        <td className="px-4 py-3 font-mono text-gray-600">
                           {formatDate(soldo.data_fim)}
                        </td>
                        <td className="px-4 py-3">
                           {(() => {
                              const status = getStatus(
                                 soldo.data_inicio,
                                 soldo.data_fim
                              );
                              if (status === "vigente") {
                                 return (
                                    <span className="inline-flex items-center gap-1.5 text-sm text-green-600">
                                       <span className="h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
                                       Vigente
                                    </span>
                                 );
                              }
                              if (status === "proximo") {
                                 return (
                                    <span className="inline-flex items-center gap-1.5 text-sm text-blue-600">
                                       <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                                       Próximo
                                    </span>
                                 );
                              }
                              return (
                                 <span className="inline-flex items-center gap-1.5 text-sm text-gray-400">
                                    <span className="h-2 w-2 rounded-full bg-gray-300"></span>
                                    Anterior
                                 </span>
                              );
                           })()}
                        </td>
                        <td className="px-4 py-3">
                           <div className="flex justify-end gap-2">
                              <button
                                 onClick={() => onEdit(soldo)}
                                 className="text-gray-600 hover:text-red-600"
                                 title="Editar"
                              >
                                 <HiPencil className="h-5 w-5" />
                              </button>
                              <button
                                 onClick={() => onDelete(soldo)}
                                 className="text-gray-600 hover:text-red-600"
                                 title="Excluir"
                              >
                                 <HiTrash className="h-5 w-5" />
                              </button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>

         {/* Mobile Cards */}
         <div className="space-y-3 p-4 md:hidden">
            {soldos.map((soldo) => (
               <div
                  key={soldo.id}
                  className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
               >
                  <div className="mb-3 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <Badge
                           color={getCirculoColor(
                              soldo.posto_grad?.circulo ||
                                 getPostoInfo(soldo.pg)?.circulo
                           )}
                           size="sm"
                        >
                           {soldo.pg.toUpperCase()}
                        </Badge>
                        <span className="font-medium text-gray-900">
                           {soldo.posto_grad?.mid ||
                              getPostoInfo(soldo.pg)?.mid ||
                              soldo.pg}
                        </span>
                     </div>
                     {(() => {
                        const status = getStatus(
                           soldo.data_inicio,
                           soldo.data_fim
                        );
                        if (status === "vigente") {
                           return (
                              <span className="inline-flex items-center gap-1 text-xs text-green-600">
                                 <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500"></span>
                                 Vigente
                              </span>
                           );
                        }
                        if (status === "proximo") {
                           return (
                              <span className="inline-flex items-center gap-1 text-xs text-blue-600">
                                 <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                                 Próximo
                              </span>
                           );
                        }
                        return (
                           <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-gray-300"></span>
                              Anterior
                           </span>
                        );
                     })()}
                  </div>

                  <div className="mb-2 text-xs text-gray-500">
                     {CIRCULO_LABELS[
                        soldo.posto_grad?.circulo ||
                           getPostoInfo(soldo.pg)?.circulo ||
                           ""
                     ] || "-"}
                  </div>

                  <div className="mb-3">
                     <span className="font-mono text-lg font-bold text-green-600">
                        {formatCurrency(soldo.valor)}
                     </span>
                  </div>

                  <div className="mb-3 flex gap-4 text-sm text-gray-600">
                     <div>
                        <span className="text-gray-400">Inicio: </span>
                        <span className="font-mono">
                           {formatDate(soldo.data_inicio)}
                        </span>
                     </div>
                     {soldo.data_fim && (
                        <div>
                           <span className="text-gray-400">Fim: </span>
                           <span className="font-mono">
                              {formatDate(soldo.data_fim)}
                           </span>
                        </div>
                     )}
                  </div>

                  <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
                     <button
                        onClick={() => onEdit(soldo)}
                        className="flex items-center gap-1 rounded px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
                     >
                        <HiPencil className="h-4 w-4" />
                        Editar
                     </button>
                     <button
                        onClick={() => onDelete(soldo)}
                        className="flex items-center gap-1 rounded px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                     >
                        <HiTrash className="h-4 w-4" />
                        Excluir
                     </button>
                  </div>
               </div>
            ))}
         </div>
      </>
   );
}
