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
import { situacaoMeta } from "../schemas/aeronaveSchema";

interface AeronaveTableProps {
   aeronaves: AeronavePublic[];
   onEdit: (aeronave: AeronavePublic) => void;
}

export function AeronaveTable({ aeronaves, onEdit }: AeronaveTableProps) {
   return (
      <div className="hidden overflow-x-auto rounded border border-slate-200 bg-white shadow-sm md:block">
         <Table
            hoverable
            className="text-center"
            theme={{
               head: { cell: { base: "bg-white border-b border-slate-200" } },
            }}
         >
            <TableHead>
               <TableRow>
                  <TableHeadCell>Matrícula</TableHeadCell>
                  <TableHeadCell>Projeto</TableHeadCell>
                  <TableHeadCell>Tipo</TableHeadCell>
                  <TableHeadCell>Situação</TableHeadCell>
                  <TableHeadCell>Observação</TableHeadCell>
                  <TableHeadCell>Status</TableHeadCell>
                  <TableHeadCell>Ações</TableHeadCell>
               </TableRow>
            </TableHead>
            <TableBody className="divide-y">
               {aeronaves.map((aeronave) => {
                  return (
                     <TableRow
                        key={aeronave.matricula}
                        className={clsx({
                           "bg-white": aeronave.active,
                           "bg-slate-50": !aeronave.active,
                        })}
                     >
                        <TableCell
                           className={clsx("text-base font-bold", {
                              "text-gray-900": aeronave.active,
                              "text-gray-500": !aeronave.active,
                           })}
                        >
                           {aeronave.matricula}
                        </TableCell>
                        <TableCell className="text-center align-middle">
                           <div className="flex flex-col leading-tight uppercase">
                              <span className="font-semibold text-gray-900">
                                 {aeronave.proj.modelo}
                              </span>
                              <span className="text-xs text-gray-500">
                                 {aeronave.proj.id_projeto}
                              </span>
                           </div>
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
                           <Tooltip content={situacaoMeta(aeronave.sit).label}>
                              <span
                                 className={clsx(
                                    "inline-block w-10 rounded p-2 font-bold",
                                    situacaoMeta(aeronave.sit).badge
                                 )}
                              >
                                 {aeronave.sit}
                                 {/* O Tooltip só dispara no hover/foco do
                                     mouse; o span não é focável. Sem isto o
                                     leitor de tela anuncia só a sigla. */}
                                 <span className="sr-only">
                                    {" "}
                                    {situacaoMeta(aeronave.sit).label}
                                 </span>
                              </span>
                           </Tooltip>
                        </TableCell>
                        <TableCell className="max-w-xs text-gray-600">
                           {aeronave.obs ? (
                              <span className="whitespace-pre-line">
                                 {aeronave.obs}
                              </span>
                           ) : (
                              <>
                                 <span className="text-gray-500" aria-hidden>
                                    —
                                 </span>
                                 <span className="sr-only">sem observação</span>
                              </>
                           )}
                        </TableCell>
                        <TableCell>
                           <span
                              className={clsx(
                                 "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                                 aeronave.active
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                              )}
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
                                 // A tabela é `md:block`, então ela TAMBÉM
                                 // aparece no tablet, onde o ponteiro é o
                                 // dedo — media 26px lá. `pointer-coarse`
                                 // cresce só no toque; no mouse segue denso.
                                 // Hover em `primary-*` (era `blue-*` cravado,
                                 // que virava o único azul da tela numa org de
                                 // tema vermelho) e sob `pointer-fine`, senão
                                 // o estado gruda após o toque.
                                 className="pointer-fine:hover:bg-primary-50 pointer-fine:hover:text-primary-600 rounded p-1.5 text-gray-500 transition-colors pointer-coarse:flex pointer-coarse:min-h-[44px] pointer-coarse:min-w-[44px] pointer-coarse:items-center pointer-coarse:justify-center"
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
