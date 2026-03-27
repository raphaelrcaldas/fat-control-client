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
import type { AeronavePublic } from "services/routes/aeronaves";
import clsx from "clsx";
import { PermBased } from "@/app/(home)/hooks/usePermBased";

interface AeronaveTableProps {
   aeronaves: AeronavePublic[];
   onEdit: (aeronave: AeronavePublic) => void;
}

export function AeronaveTable({ aeronaves, onEdit }: AeronaveTableProps) {
   return (
      <div className="hidden overflow-x-auto rounded-lg bg-white shadow-md md:block">
         <Table hoverable className="text-center">
            <TableHead>
               <TableRow>
                  <TableHeadCell>Matrícula</TableHeadCell>
                  <TableHeadCell>Tipo</TableHeadCell>
                  <TableHeadCell>Situação</TableHeadCell>
                  <TableHeadCell>Observação</TableHeadCell>
                  <TableHeadCell>Status</TableHeadCell>
                  <TableHeadCell className="text-center">Ações</TableHeadCell>
               </TableRow>
            </TableHead>
            <TableBody className="divide-y">
               {aeronaves.map((aeronave) => {
                  return (
                     <TableRow
                        key={aeronave.matricula}
                        className={`bg-white ${!aeronave.active ? "opacity-50" : ""}`}
                     >
                        <TableCell className="text-base font-bold text-gray-900">
                           {aeronave.matricula}
                        </TableCell>
                        <TableCell className="text-center align-middle">
                           {aeronave.is_sim ? (
                              <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">
                                 Simulador
                              </span>
                           ) : (
                              <span className="inline-flex items-center rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-medium text-sky-700">
                                 Aeronave
                              </span>
                           )}
                        </TableCell>
                        <TableCell className="text-center align-middle">
                           <span
                              className={clsx(
                                 "inline-block w-10 rounded p-2 font-bold text-white",
                                 {
                                    "bg-emerald-400": aeronave.sit === "DI",
                                    "bg-red-400": aeronave.sit === "IN",
                                    "bg-gray-400": aeronave.sit === "IS",
                                    "bg-orange-400": aeronave.sit === "DO",
                                 }
                              )}
                           >
                              {aeronave.sit}
                           </span>
                        </TableCell>
                        <TableCell className="max-w-xs text-gray-600">
                           {aeronave.obs ? (
                              <span className="whitespace-pre-line">
                                 {aeronave.obs}
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
                                 aria-label={`Editar aeronave ${aeronave.matricula}`}
                              >
                                 <HiPencil
                                    className="h-4.5 w-4.5"
                                    aria-hidden="true"
                                 />
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
