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
import { FaPenToSquare, FaTrashCan } from "react-icons/fa6";
import clsx from "clsx";
import { Skeleton } from "@/components/ui/Skeleton";
import type { TipoMissaoPublic } from "services/routes/estatistica/tiposMissao";

interface TiposMissaoTableProps {
   tipos: TipoMissaoPublic[];
   isBusy: boolean;
   onEdit: (tipo: TipoMissaoPublic) => void;
   onDelete: (tipo: TipoMissaoPublic) => void;
}

/*
 * Larguras compartilhadas pela tabela e pelo skeleton (zero salto quando os
 * dados chegam). A Descrição usa o truque `w-full max-w-0`: a coluna absorve
 * a sobra e o texto trunca nela, em vez de alargar a tabela — assim código,
 * descrição e ações cabem no celular sem rolagem horizontal.
 */
const COL_COD = "w-24";
const COL_DESC = "w-full max-w-0";
const COL_ACOES = "w-28";

function TiposMissaoTableHead() {
   return (
      <TableHead>
         <TableRow>
            <TableHeadCell className={COL_COD}>Código</TableHeadCell>
            <TableHeadCell className={COL_DESC}>Descrição</TableHeadCell>
            <TableHeadCell className={COL_ACOES}>
               <span className="sr-only">Ações</span>
            </TableHeadCell>
         </TableRow>
      </TableHead>
   );
}

export function TiposMissaoTable({
   tipos,
   isBusy,
   onEdit,
   onDelete,
}: TiposMissaoTableProps) {
   return (
      <div className="overflow-x-auto rounded border border-slate-200 bg-white shadow-sm">
         <Table hoverable>
            <TiposMissaoTableHead />
            <TableBody className="divide-y">
               {tipos.map((tipo) => (
                  <TableRow key={tipo.id} className="bg-white">
                     <TableCell className={COL_COD}>
                        <span className="font-mono text-sm font-bold whitespace-nowrap text-slate-800">
                           {tipo.cod}
                        </span>
                     </TableCell>
                     <TableCell className={COL_DESC}>
                        <span
                           className="block truncate text-slate-700"
                           title={tipo.desc}
                        >
                           {tipo.desc}
                        </span>
                     </TableCell>
                     <TableCell className={COL_ACOES}>
                        <div className="flex items-center justify-end gap-1.5">
                           <Button
                              size="xs"
                              color="light"
                              disabled={isBusy}
                              onClick={() => onEdit(tipo)}
                              aria-label={`Editar tipo de missão ${tipo.cod}`}
                              title="Editar"
                              className="min-h-[24px] min-w-[24px]"
                           >
                              <FaPenToSquare className="size-3.5" />
                           </Button>
                           <Button
                              size="xs"
                              color="red"
                              disabled={isBusy}
                              onClick={() => onDelete(tipo)}
                              aria-label={`Remover tipo de missão ${tipo.cod}`}
                              title="Remover"
                              className="min-h-[24px] min-w-[24px]"
                           >
                              <FaTrashCan className="size-3.5" />
                           </Button>
                        </div>
                     </TableCell>
                  </TableRow>
               ))}
            </TableBody>
         </Table>
      </div>
   );
}

/** Larguras fixas das descrições fantasmas — padrão estável, sem Math.random. */
const DESC_WIDTHS = ["w-48", "w-64", "w-40", "w-56", "w-72", "w-44"];

export function TiposMissaoTableSkeleton({ rows = 8 }: { rows?: number }) {
   return (
      <div
         role="status"
         className="overflow-x-auto rounded border border-slate-200 bg-white shadow-sm"
      >
         <span className="sr-only">Carregando tipos de missão…</span>
         <Table hoverable aria-hidden>
            <TiposMissaoTableHead />
            <TableBody className="divide-y">
               {Array.from({ length: rows }).map((_, i) => (
                  <TableRow key={i} className="bg-white">
                     <TableCell className={COL_COD}>
                        <Skeleton className="h-5 w-10" />
                     </TableCell>
                     <TableCell className={COL_DESC}>
                        <Skeleton
                           className={clsx(
                              "h-4 max-w-full",
                              DESC_WIDTHS[i % DESC_WIDTHS.length]
                           )}
                        />
                     </TableCell>
                     <TableCell className={COL_ACOES}>
                        <div className="flex items-center justify-end gap-1.5">
                           <Skeleton className="h-8 w-9" />
                           <Skeleton className="h-8 w-9" />
                        </div>
                     </TableCell>
                  </TableRow>
               ))}
            </TableBody>
         </Table>
      </div>
   );
}
