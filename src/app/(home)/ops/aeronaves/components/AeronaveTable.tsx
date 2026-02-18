"use client";

import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeadCell,
   TableRow,
   Tooltip,
} from "flowbite-react";
import { HiPencil } from "react-icons/hi";
import { MdWarning } from "react-icons/md";
import { formatDateFull, isoStrToDate } from "utils/dateHandler";
import type { AeronavePublic } from "services/routes/aeronaves";
import clsx from "clsx";
import { PermBased } from "@/app/(home)/hooks/usePermBased";

interface AeronaveTableProps {
   aeronaves: AeronavePublic[];
   onEdit: (aeronave: AeronavePublic) => void;
}

function isInspProxima(dateStr: string | null): boolean {
   if (!dateStr) return false;
   const diff = isoStrToDate(dateStr).getTime() - Date.now();
   const days = diff / (1000 * 60 * 60 * 24);
   return days >= 0 && days <= 30;
}

function isInspVencida(dateStr: string | null): boolean {
   if (!dateStr) return false;
   return isoStrToDate(dateStr).getTime() < Date.now();
}

export function AeronaveTable({ aeronaves, onEdit }: AeronaveTableProps) {
   return (
      <div className="hidden overflow-x-auto rounded-lg bg-white shadow-md md:block">
         <Table hoverable className="text-center">
            <TableHead>
               <TableRow>
                  <TableHeadCell>Matrícula</TableHeadCell>
                  <TableHeadCell>Situação</TableHeadCell>
                  <TableHeadCell>Observação</TableHeadCell>
                  <TableHeadCell>Próx. Inspeção</TableHeadCell>
                  <TableHeadCell>Status</TableHeadCell>
                  <TableHeadCell className="text-center">Ações</TableHeadCell>
               </TableRow>
            </TableHead>
            <TableBody className="divide-y">
               {aeronaves.map((aeronave) => {
                  const proxima = isInspProxima(aeronave.prox_insp);
                  const vencida = isInspVencida(aeronave.prox_insp);

                  return (
                     <TableRow
                        key={aeronave.matricula}
                        className={`bg-white ${!aeronave.active ? "opacity-30" : ""}`}
                     >
                        <TableCell className="text-base font-bold text-gray-900">
                           {aeronave.matricula}
                        </TableCell>
                        <TableCell className="flex justify-center">
                           <span
                              className={clsx(
                                 "w-10 rounded p-2 font-bold text-white",
                                 {
                                    "bg-emerald-400": aeronave.sit == "DI",
                                    "bg-red-400": aeronave.sit == "IN",
                                    "bg-gray-400": aeronave.sit == "IS",
                                    "bg-orange-400": aeronave.sit == "DO",
                                 }
                              )}
                           >
                              {aeronave.sit}
                           </span>
                        </TableCell>
                        <TableCell className="max-w-xs text-gray-600">
                           {aeronave.obs ? (
                              <span>{aeronave.obs}</span>
                           ) : (
                              <span className="text-gray-300">—</span>
                           )}
                        </TableCell>
                        <TableCell>
                           {aeronave.prox_insp ? (
                              <span
                                 className={`inline-flex items-center gap-1.5 ${
                                    vencida
                                       ? "font-semibold text-red-600"
                                       : proxima
                                         ? "font-semibold text-yellow-600"
                                         : "text-gray-700"
                                 }`}
                              >
                                 {(proxima || vencida) && (
                                    <MdWarning className="h-4 w-4" />
                                 )}
                                 {formatDateFull(aeronave.prox_insp)}
                              </span>
                           ) : (
                              <span className="text-gray-300">—</span>
                           )}
                        </TableCell>
                        <TableCell>
                           <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                 aeronave.active
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                           >
                              {aeronave.active ? "Ativa" : "Inativa"}
                           </span>
                        </TableCell>
                        <TableCell>
                           <PermBased
                              resource={"aeronaves"}
                              requiredPerm={"update"}
                           >
                              <button
                                 onClick={() => onEdit(aeronave)}
                                 className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                                 title="Editar"
                              >
                                 <HiPencil className="h-4.5 w-4.5" />
                              </button>
                           </PermBased>
                        </TableCell>
                     </TableRow>
                  );
               })}
            </TableBody>
         </Table>
      </div>
   );
}
