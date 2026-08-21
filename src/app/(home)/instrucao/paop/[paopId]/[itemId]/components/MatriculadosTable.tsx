"use client";

import {
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
   TableCell,
   Button,
} from "flowbite-react";
import { FaUserMinus } from "react-icons/fa6";
import { formatDateFull } from "@/../utils/dateHandler";
import { Skeleton } from "@/components/ui/Skeleton";
import { PermBased } from "../../../../../hooks/usePermBased";
import type { TripulanteMatriculado } from "services/routes/instrucao/paops";

interface MatriculadosTableProps {
   tripulantes: TripulanteMatriculado[];
   isBusy: boolean;
   onRemover: (tripulante: TripulanteMatriculado) => void;
}

export function MatriculadosTable({
   tripulantes,
   isBusy,
   onRemover,
}: MatriculadosTableProps) {
   return (
      <div className="overflow-x-auto rounded border border-slate-200 bg-white shadow-sm">
         <Table hoverable>
            <TableHead>
               <TableRow>
                  <TableHeadCell className="w-16 text-center">#</TableHeadCell>
                  <TableHeadCell className="w-24 text-center">
                     Trigrama
                  </TableHeadCell>
                  <TableHeadCell className="w-28 text-center">
                     Posto
                  </TableHeadCell>
                  <TableHeadCell>Nome</TableHeadCell>
                  <TableHeadCell className="w-32 text-center">
                     Inclusão
                  </TableHeadCell>
                  <TableHeadCell className="w-20 text-center">
                     <span className="sr-only">Ações</span>
                  </TableHeadCell>
               </TableRow>
            </TableHead>
            <TableBody className="divide-y">
               {tripulantes.map((trip, i) => (
                  <TableRow key={trip.id} className="bg-white">
                     <TableCell className="text-center text-slate-500 tabular-nums">
                        {i + 1}
                     </TableCell>
                     <TableCell className="text-center font-mono text-sm font-bold text-slate-800 uppercase">
                        {trip.trig}
                     </TableCell>
                     <TableCell className="text-center text-slate-600 uppercase">
                        {trip.p_g}
                     </TableCell>
                     <TableCell>
                        <span className="font-semibold text-slate-800 uppercase">
                           {trip.nome_guerra}
                        </span>
                        {trip.nome_completo && (
                           <span className="mt-0.5 block text-xs text-slate-500 uppercase">
                              {trip.nome_completo}
                           </span>
                        )}
                     </TableCell>
                     <TableCell className="text-center text-slate-600 tabular-nums">
                        {formatDateFull(trip.data_inclusao)}
                     </TableCell>
                     <TableCell>
                        <div className="flex justify-center">
                           <PermBased
                              resource="instrucao.paop"
                              requiredPerm="update"
                           >
                              <Button
                                 size="xs"
                                 color="red"
                                 disabled={isBusy}
                                 onClick={() => onRemover(trip)}
                                 title="Desmatricular"
                              >
                                 <FaUserMinus className="size-3.5" />
                              </Button>
                           </PermBased>
                        </div>
                     </TableCell>
                  </TableRow>
               ))}
            </TableBody>
         </Table>
      </div>
   );
}

export function MatriculadosTableSkeleton() {
   return (
      <div className="space-y-2 rounded border border-slate-200 bg-white p-4 shadow-sm">
         {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
               <Skeleton className="h-4 w-6" />
               <Skeleton className="h-4 w-16" />
               <Skeleton className="h-4 w-16" />
               <Skeleton className="h-4 w-56" />
               <Skeleton className="ml-auto h-4 w-24" />
               <Skeleton className="h-7 w-10" />
            </div>
         ))}
      </div>
   );
}
