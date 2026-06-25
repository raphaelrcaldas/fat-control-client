"use client";

// Skeleton fiel da listagem de etapas. Espelha o EtapasTable nos dois modos:
// - grouped: barra "selecionar todas" + cards de missao (header + tabela interna)
// - flat: tabela unica dentro da moldura arredondada
// Mesmas colunas/larguras/visibilidades responsivas do EtapaRow -> zero layout-shift.

import clsx from "clsx";
import { Table, TableBody, TableCell, TableRow } from "flowbite-react";

// Contagens fixas (sem Math.random) para evitar flicker e hydration mismatch.
const GROUPED_MISSOES = [2, 3, 8, 3]; // nº de etapas por card de missao
const FLAT_ROWS = 8;

function Bar({ className }: { className?: string }) {
   return (
      <div className={clsx("animate-pulse rounded bg-slate-200", className)} />
   );
}

function EtapaRowSkeleton() {
   return (
      <TableRow>
         <TableCell className="w-7">
            <Bar className="mx-auto size-4" />
         </TableCell>
         <TableCell className="w-12 sm:w-20">
            <Bar className="mx-auto h-5 w-18" />
         </TableCell>
         <TableCell className="w-12 sm:w-14">
            <Bar className="mx-auto h-5 w-12" />
         </TableCell>
         <TableCell className="w-12 sm:w-14">
            <Bar className="mx-auto h-5 w-12" />
         </TableCell>
         <TableCell className="w-13 sm:w-16">
            <Bar className="mx-auto h-5 w-13" />
         </TableCell>
         <TableCell className="w-13 sm:w-16">
            <Bar className="mx-auto h-5 w-13" />
         </TableCell>
         <TableCell className="w-13 sm:w-16">
            <Bar className="mx-auto h-5 w-13" />
         </TableCell>
         <TableCell className="hidden w-14 sm:table-cell">
            <Bar className="mx-auto h-5 w-12" />
         </TableCell>
         <TableCell className="hidden w-5 sm:table-cell" />
         <TableCell className="hidden w-92 md:table-cell">
            <Bar className="mx-auto h-5 w-80" />
         </TableCell>
         <TableCell className="hidden lg:table-cell">
            <div className="flex flex-wrap items-center gap-1">
               <Bar className="h-5 w-10 bg-slate-100" />
               <Bar className="h-5 w-10 bg-slate-100" />
               <Bar className="h-5 w-10 bg-slate-100" />
               <Bar className="h-5 w-10 bg-slate-100" />
               <Bar className="h-5 w-10 bg-slate-100" />
               <Bar className="h-5 w-10 bg-slate-100" />
               <Bar className="h-5 w-10 bg-slate-100" />
            </div>
         </TableCell>
         <TableCell className="px-2 sm:w-14">
            <div className="flex items-center gap-1">
               <Bar className="size-6 bg-slate-100" />
               <Bar className="size-6 bg-slate-100" />
            </div>
         </TableCell>
      </TableRow>
   );
}

function InnerTableSkeleton({ rows }: { rows: number }) {
   return (
      <div className="overflow-x-auto">
         <Table
            className="text-center"
            theme={{
               body: { cell: { base: "px-1 py-1.5 align-middle" } },
            }}
         >
            <TableBody className="divide-y">
               {Array.from({ length: rows }, (_, i) => (
                  <EtapaRowSkeleton key={i} />
               ))}
            </TableBody>
         </Table>
      </div>
   );
}

function MissaoCardSkeleton({ rows }: { rows: number }) {
   return (
      <div className="mx-0.5 overflow-hidden rounded border border-gray-300 bg-white shadow">
         <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white p-1.5">
            <Bar className="size-4" />
            <Bar className="h-5 w-10" />
         </div>
         <InnerTableSkeleton rows={rows} />
      </div>
   );
}

export interface EtapasTableSkeletonProps {
   grouped: boolean;
}

export function EtapasTableSkeleton({ grouped }: EtapasTableSkeletonProps) {
   if (grouped) {
      return (
         <div
            role="status"
            aria-label="Carregando etapas"
            className="space-y-2"
         >
            <div className="ml-1 flex h-10 items-center gap-2 px-1">
               <Bar className="size-4" />
               <Bar className="h-5 w-64" />
            </div>
            {GROUPED_MISSOES.map((rows, i) => (
               <MissaoCardSkeleton key={i} rows={rows} />
            ))}
         </div>
      );
   }

   return (
      <div
         role="status"
         aria-label="Carregando etapas"
         className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
      >
         <InnerTableSkeleton rows={FLAT_ROWS} />
      </div>
   );
}
